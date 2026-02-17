import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { isPointInPolygon, isValidCoordinate } from '../utils/geoUtils';
import { Branch, CoverageResponse, Zone } from '../types';
// v2.0 - Updated 2026-01-18: Added is_available flag for delivery-disabled branches

export const checkCoverage = async (req: Request, res: Response) => {
    try {
        let { lat, lng } = req.body;

        // Ensure they are numbers (in case n8n sends strings)
        lat = parseFloat(lat);
        lng = parseFloat(lng);

        // 1. Validation
        if (!isValidCoordinate(lat, lng)) {
            return res.status(400).json({ error: 'Invalid coordinates provided' });
        }

        // 2. Fetch Active Branches & Zones from DB
        // We only want branches that are marked 'is_active' = true
        const { data: branches, error } = await supabase
            .from('branches')
            .select('*')
            .eq('is_active', true);

        if (error || !branches) {
            console.error('DB Error:', error);
            return res.status(500).json({ error: 'Failed to fetch branch data' });
        }

        // 3. The Search Logic
        const userLocation = { lat, lng };

        // First pass: Check delivery-ENABLED branches
        for (const branchData of branches) {
            const branch = branchData as Branch;
            const isDeliveryEnabled = branch.is_delivery_available !== false && (branch as any).is_delivery_available !== 'false';

            // Skip disabled branches in first pass
            if (!isDeliveryEnabled) continue;

            // Safety check: ensure zones exist
            if (!branch.zones || !Array.isArray(branch.zones)) continue;

            // Loop through every zone in this branch
            for (const zone of branch.zones) {
                const isInside = isPointInPolygon(userLocation, zone.polygon);

                if (isInside) {
                    // FOUND IT! Delivery is available
                    return res.json({
                        covered: true,
                        branch_id: branch.id,
                        branch_name: branch.name,
                        zone_name: zone.name,
                        delivery_fee: zone.delivery_fee,
                        opening_time: (branch as any).opening_time,
                        closing_time: (branch as any).closing_time,
                    });
                }
            }
        }

        // Second pass: Check delivery-DISABLED branches (to give specific message)
        for (const branchData of branches) {
            const branch = branchData as Branch;
            const isDeliveryEnabled = branch.is_delivery_available !== false && (branch as any).is_delivery_available !== 'false';

            // Only check disabled branches in second pass
            if (isDeliveryEnabled) continue;

            // Safety check: ensure zones exist
            if (!branch.zones || !Array.isArray(branch.zones)) continue;

            // Loop through every zone in this branch
            for (const zone of branch.zones) {
                const isInside = isPointInPolygon(userLocation, zone.polygon);

                if (isInside) {
                    // Found in a delivery-DISABLED branch
                    return res.json({
                        covered: false,
                        delivery_unavailable: true,
                        branch_id: branch.id,
                        branch_name: branch.name,
                        zone_name: zone.name,
                        opening_time: (branch as any).opening_time,
                        closing_time: (branch as any).closing_time,
                        message: 'Delivery temporarily unavailable for this branch'
                    });
                }
            }
        }

        // 4. No Match Found in ANY branch
        return res.json({
            covered: false,
            message: 'Location is outside all delivery zones.'
        });

    } catch (err: any) {
        console.error('Geo Controller Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// NEW: Get list of all supported zones (for Dropdown selection)
export const getAvailableZones = async (req: Request, res: Response) => {
    try {
        const { data: branches, error } = await supabase
            .from('branches')
            .select('id, name, zones, is_delivery_available, opening_time, closing_time')
            .eq('is_active', true);

        if (error || !branches) {
            return res.status(500).json({ error: 'Failed to fetch zones' });
        }

        const allZones: any[] = [];

        console.log('[getAvailableZones] v2.1 - Fetched', branches.length, 'branches. Will include is_available flag.');
        console.log('[getAvailableZones] Branches:', branches.map((b: any) => ({ name: b.name, is_delivery_available: b.is_delivery_available })));

        // Flatten the structure: Branch -> Zones -> List
        // Now include ALL zones but mark disabled ones with is_available: false
        branches.forEach((branch: any) => {
            // Check if delivery is available for this branch
            const isDeliveryAvailable = branch.is_delivery_available !== false && branch.is_delivery_available !== 'false';

            if (branch.zones && Array.isArray(branch.zones)) {
                branch.zones.forEach((zone: any) => {
                    allZones.push({
                        name: zone.name,
                        branch_id: branch.id,
                        branch_name: branch.name,
                        delivery_fee: zone.delivery_fee,
                        // If your zone JSON has 'city', use it. If not, use Branch Name as group
                        group: zone.city || branch.name,
                        is_available: isDeliveryAvailable, // indicates if delivery is available
                        opening_time: branch.opening_time || null,
                        closing_time: branch.closing_time || null,
                    });
                });
            }
        });

        // Optional: Remove duplicates or sort
        allZones.sort((a, b) => a.name.localeCompare(b.name));

        res.json(allZones);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
