import axios from 'axios';

// API Base URL - points to your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

// Supabase direct URL for public data
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

import type { Branch, MenuCategory, MenuItem } from '../types';

export type { Branch, MenuCategory, MenuItem };

// Supabase client for direct queries (public data only)
const supabaseClient = axios.create({
    baseURL: SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : '',
    headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
    },
});

// SiteSetting moved to types (if not present, I should define it there or keep it here if not in instructions. The user instructions didn't mention SiteSetting in types/index.ts but I should check.
// User instructions for types/index.ts: Branch, MenuItem, MenuCategory, CartItem.
// SiteSetting was NOT in the user's list for types/index.ts.
// So I will keep SiteSetting here or move it? Use strictly what user said.
// User said: "Fix src/types/index.ts ... create a central type definition ... Create src/types/index.ts and move core interfaces there"
// It listed specific interfaces. SiteSetting was not one of them.
// I will keep SiteSetting here for now to avoid overstepping.
// But Branch is there.

export interface SiteSetting {
    key: string;
    value: string;
    type?: string;
}



export interface ZoneItem {
    name: string;
    branch_id: number;
    branch_name: string;
    delivery_fee: number;
    group: string;
    is_available?: boolean; // NEW: indicates if delivery is available for this zone's branch
}

export const api = {
    // ==========================================
    // SITE SETTINGS
    // ==========================================
    getSiteSettings: async (): Promise<Record<string, string>> => {
        try {
            if (!SUPABASE_URL) {
                console.warn('Supabase URL not configured, using defaults');
                return getDefaultSettings();
            }
            const { data } = await supabaseClient.get('/site_settings?select=key,value');
            const settings: Record<string, string> = {};
            (data || []).forEach((item: SiteSetting) => {
                settings[item.key] = item.value;
            });
            return settings;
        } catch (e) {
            console.error('Failed to fetch settings:', e);
            return getDefaultSettings();
        }
    },

    // ==========================================
    // GEO & ZONES
    // ==========================================

    // 1. Get Dropdown List
    getAvailableZones: async (): Promise<ZoneItem[]> => {
        try {
            const { data } = await apiClient.get('/geo/zones');
            return data || [];
        } catch (e) {
            console.error('Failed to load zones:', e);
            return [];
        }
    },

    // 2. Check Coverage (Lat/Lng)
    checkCoverage: async (lat: number, lng: number): Promise<{
        covered: boolean;
        branch_id?: number;
        branch_name?: string;
        delivery_fee?: number;
        zone_name?: string;
    }> => {
        try {
            // Note: Changed to POST as per backend controller
            const { data } = await apiClient.post('/geo/check-coverage', { lat, lng });
            return data;
        } catch (e) {
            console.error('Failed to check coverage:', e);
            return { covered: false };
        }
    },

    // ==========================================
    // BRANCHES
    // ==========================================
    getBranches: async (): Promise<Branch[]> => {
        try {
            const { data } = await apiClient.get('/branches');
            return data || [];
        } catch (e) {
            console.error('Failed to fetch branches:', e);
            return [];
        }
    },

    // ==========================================
    // MENU
    // ==========================================
    // Fetches the full menu hierarchy (Categories -> Items) for a specific branch
    getBranchMenu: async (branchId: number): Promise<MenuCategory[]> => {
        try {
            // Note: Backend endpoint /branches/:id/menu returns the full hierarchy now
            const { data } = await apiClient.get(`/branches/${branchId}/menu`);
            return data || [];
        } catch (e) {
            console.error('Failed to fetch menu:', e);
            return [];
        }
    },

    // ==========================================
    // ORDERS
    // ==========================================
    createOrder: async (orderData: {
        branch_id: number;
        service_type: 'delivery' | 'pickup';
        customer_name: string;
        customer_phone: string;
        customer_address?: string;
        delivery_lat?: number;
        delivery_lng?: number;
        items: Array<{
            item_id: number;
            quantity: number;
            unit_price: number;
            notes?: string;
            options?: any[];
        }>;
        notes?: string;
    }) => {
        const { data } = await apiClient.post('/checkout/order', orderData);
        return data;
    },

    // ==========================================
    // ABOUT PAGE GALLERY
    // ==========================================
    getAboutGallery: async (): Promise<Array<{ id: number; image_url: string; alt_text?: string; sort_order: number }>> => {
        try {
            if (!SUPABASE_URL) return [];
            const { data } = await supabaseClient.get('/about_gallery?is_active=eq.true&order=sort_order.asc');
            return data || [];
        } catch (e) {
            console.error('Failed to fetch gallery:', e);
            return [];
        }
    },

    // ==========================================
    // PAYMENTS (Paymob)
    // ==========================================
    initiatePayment: async (paymentData: {
        amount_cents: number;
        order_id: number | string;
        customer_name?: string;
        customer_email?: string;
        customer_phone?: string;
        billing_data?: {
            first_name: string;
            last_name: string;
            email: string;
            phone_number: string;
            street: string;
            building: string;
            floor: string;
            apartment: string;
            city: string;
            state: string;
            country: string;
            postal_code: string;
            shipping_method?: string;
        };
    }): Promise<{
        success: boolean;
        iframe_url: string;
        payment_token: string;
        paymob_order_id: number;
        merchant_order_id: string | number;
    }> => {
        const { data } = await apiClient.post('/payments/initiate', paymentData);
        return data;
    },

    getPaymentConfig: async (): Promise<{ iframe_id: string; integration_id: string }> => {
        const { data } = await apiClient.get('/payments/config');
        return data;
    },
};

// Default settings when API fails
function getDefaultSettings(): Record<string, string> {
    return {
        'brand_name_ar': 'توريقة',
        'brand_name_en': 'Tawriqa',
        'primary_color': '#415A3E',
        'supported_languages': '["ar", "en"]',
        'default_language': 'ar',
        'hero_title_ar': 'بين الطبقات.. حكايات',
        'hero_title_en': 'Stories between layers...',
        'hero_subtitle_ar': 'طعم أصيل بلمسة عصرية',
        'hero_subtitle_en': 'Authentic taste, modern touch',
    };
}

export default api;
