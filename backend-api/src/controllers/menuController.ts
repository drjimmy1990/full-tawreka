import { Request, Response } from 'express';
import { supabase } from '../config/supabase'; // Adjusted path to config folder
import { MenuCategory, MenuItem, OptionGroup } from '../types';

// 1. Get Website Colors & Logo
export const getSiteSettings = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('site_settings').select('*');
        if (error) throw error;

        // Convert DB rows to a simple JSON object
        const settings: any = {};
        data.forEach((row: any) => {
            settings[row.key] = row.value;
        });

        res.json(settings);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Get All Active Branches
export const getBranches = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('branches')
            .select('id, name, name_ar, name_en, name_ru, phone_contact, zones, opening_time, closing_time, address_ar, address_en, address_ru, google_maps_embed, google_maps_link, is_active, is_delivery_available') // Added is_delivery_available
            .eq('is_active', true);

        if (error) throw error;
        res.json(data || []);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Get Menu with Branch-Specific Prices
export const getBranchMenu = async (req: Request, res: Response) => {
    try {
        const branchId = parseInt(req.params.id);
        if (isNaN(branchId)) return res.status(400).json({ error: 'Invalid Branch ID' });

        // A. Fetch Categories
        const { data: categories, error: catError } = await supabase
            .from('menu_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (catError) throw catError;

        // B. Fetch All Active Items (Global)
        const { data: rawItems, error: itemError } = await supabase
            .from('menu_items')
            .select('*')
            .eq('is_active', true)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (itemError) throw itemError;

        // C. Fetch Branch Specific Prices
        const { data: branchPrices, error: priceError } = await supabase
            .from('branch_item_prices')
            .select('item_id, price, is_available, choice_prices')
            .eq('branch_id', branchId);

        if (priceError) throw priceError;

        // Map for quick lookup
        const priceMap = new Map();
        branchPrices?.forEach(bp => {
            priceMap.set(bp.item_id, bp);
        });

        // D. Fetch Item-Option Links with Groups (NO nested choices - Supabase issue)
        const { data: linksData, error: linkError } = await supabase
            .from('item_option_links')
            .select(`
                item_id,
                choice_prices,
                option_groups (
                    id, name_ar, name_en, min_selection, max_selection, is_price_replacement
                )
            `)
            .order('sort_order');

        if (linkError) throw linkError;

        // E. Fetch ALL option_choices separately
        const { data: allChoices, error: choiceError } = await supabase
            .from('option_choices')
            .select('id, group_id, name_ar, name_en, name_other, price_modifier, is_available, sort_order, description_ar, description_en, description_other')
            .eq('is_available', true)
            .order('sort_order', { ascending: true });

        if (choiceError) throw choiceError;

        // F. Create lookup map for choices by group_id
        const choicesByGroup = new Map<number, any[]>();
        allChoices?.forEach(choice => {
            const groupId = choice.group_id;
            if (!choicesByGroup.has(groupId)) {
                choicesByGroup.set(groupId, []);
            }
            choicesByGroup.get(groupId)!.push(choice);
        });

        // DEBUG
        console.log('DEBUG linksData count:', linksData?.length);
        console.log('DEBUG allChoices count:', allChoices?.length);
        console.log('DEBUG choicesByGroup:', Object.fromEntries(choicesByGroup));

        // E. Combine everything
        const menu: MenuCategory[] = categories.map((cat: any) => ({
            id: cat.id,
            name_ar: cat.name_ar,
            name_en: cat.name_en,
            name_other: cat.name_other,
            image_url: cat.image_url,
            items: []
        }));

        rawItems.forEach((item: any) => {
            // Get Branch Override
            const branchPriceData = priceMap.get(item.id);

            // CHANGED: We do NOT skip items if is_available is false. We pass the status to frontend.
            const isAvailable = branchPriceData ? branchPriceData.is_available : true;

            // Calculate Price (Override or Base)
            const finalPrice = branchPriceData ? branchPriceData.price : item.base_price;

            // Get Branch Specific Choice Prices override if exists
            const branchChoicePrices = branchPriceData?.choice_prices || {};

            // Find Options with item-specific prices
            const itemOptions = linksData
                .filter((link: any) => link.item_id === item.id)
                .map((link: any) => {
                    const group = link.option_groups;
                    if (!group) return null; // Safety check

                    // Get choices from our separate lookup
                    const groupChoices = choicesByGroup.get(group.id) || [];

                    // Item-Link prices (set in MenuBuilder for THIS item)
                    const itemLinkPrices = link.choice_prices || {};

                    // DEBUG: Log the item link prices
                    console.log(`DEBUG Item ${item.id} Group ${group.id} itemLinkPrices:`, itemLinkPrices);

                    // Apply pricing logic
                    const choices = groupChoices.map((choice: any) => {
                        let price = undefined;

                        // 1. Branch Override
                        if (branchChoicePrices[choice.id.toString()] !== undefined) {
                            price = branchChoicePrices[choice.id.toString()];
                        }

                        // 2. Item Link Price (try both string and number keys)
                        if (price === undefined) {
                            const strKey = choice.id.toString();
                            const numKey = choice.id;
                            if (itemLinkPrices[strKey] !== undefined) {
                                price = itemLinkPrices[strKey];
                            } else if (itemLinkPrices[numKey] !== undefined) {
                                price = itemLinkPrices[numKey];
                            }
                        }

                        // 3. Fallback to Global Option Price
                        if (price === undefined) {
                            price = choice.price_modifier;
                        }

                        return {
                            ...choice,
                            price_modifier: price ?? 0
                        };
                    });

                    return {
                        ...group,
                        choices
                    };
                })
                .filter((group: any) => group !== null);

            const processedItem: MenuItem = {
                id: item.id,
                category_id: item.category_id,
                name_ar: item.name_ar,
                name_en: item.name_en,
                description_ar: item.description_ar,
                description_en: item.description_en,
                image_url: item.image_url,
                base_price: item.base_price,
                current_price: finalPrice,
                is_available: isAvailable, // Added
                badge_text_ar: item.badge_text_ar, // Added
                badge_text_en: item.badge_text_en, // Added
                badge_text_other: item.badge_text_other, // Added
                options: itemOptions as unknown as OptionGroup[]
            };

            const cat = menu.find(c => c.id === item.category_id);
            if (cat) cat.items.push(processedItem);
        });

        // Remove empty categories
        const nonEmptyMenu = menu.filter(c => c.items.length > 0);

        res.json(nonEmptyMenu);

    } catch (err: any) {
        console.error("Menu Error:", err);
        try {
            const fs = require('fs');
            fs.writeFileSync('latest_error.log', new Date().toISOString() + '\n' + (typeof err === 'object' ? (err.message + '\n' + err.stack) : String(err)));
        } catch (e) { console.error("Log Write Failed", e); }

        res.status(500).json({ error: err.message });
    }
};
