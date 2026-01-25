// ==========================================
// ENUMS & TYPES
// ==========================================

export type OrderStatus = 'pending' | 'accepted' | 'in_kitchen' | 'out_for_delivery' | 'done' | 'cancelled';
export type UserRole = 'super_admin' | 'branch_manager';

// ==========================================
// GEOSPATIAL TYPES
// ==========================================
export interface Point {
    lat: number;
    lng: number;
}

export interface Zone {
    name: string;
    delivery_fee: number;
    polygon: Point[];
}

// ==========================================
// DATABASE TABLES
// ==========================================

export interface Branch {
    id: number;
    name: string;
    phone_contact?: string;
    zones: Zone[];
    is_active: boolean;
    is_delivery_available?: boolean; // New: Controls delivery status
    created_at: string;
}

export interface OrderItem {
    name: string;
    qty: number;
    price: number;
    size?: string;
    options?: string[];
}

export interface ModificationRequest {
    items: OrderItem[];
    notes?: string;
    requested_at: string;
}

export interface Order {
    id: number;
    daily_seq: number;
    branch_id: number;
    customer_id: number;
    address_id: number;

    // Content
    items: OrderItem[];
    kitchen_notes?: string;

    // Financials
    subtotal: number;
    delivery_fee: number;
    total_price: number;

    status: OrderStatus;

    // Exception Handling
    cancellation_reason?: string;
    customer_alert_message?: string;
    modification_pending?: boolean;
    modification_request?: ModificationRequest | null;

    // Timestamps
    created_at: string;
    accepted_at?: string;
    in_kitchen_at?: string;
    out_for_delivery_at?: string;
    done_at?: string;
    cancelled_at?: string;
}

// ==========================================
// API REQUEST/RESPONSE TYPES
// ==========================================

export interface CoverageRequest {
    lat: number;
    lng: number;
}

export interface CoverageResponse {
    covered: boolean;
    branch_id?: number;
    branch_name?: string;
    zone_name?: string;
    delivery_fee?: number;
    message?: string;
}

// ==========================================
// NEW: MENU & CMS TYPES
// ==========================================

export interface SiteSetting {
    key: string;
    value: string;
    type: 'text' | 'image' | 'color' | 'boolean';
}

export interface OptionChoice {
    id: number;
    name_ar: string;
    name_en: string;
    price_modifier: number;
}

export interface OptionGroup {
    id: number;
    name_ar: string;
    name_en: string;
    min_selection: number;
    max_selection: number;
    choices: OptionChoice[];
}

// Variations Types (Item-specific sizes and extras)
export interface SizeItem {
    id: number;
    name_ar: string;
    name_en: string;
    price: number;
}

export interface ExtraItem {
    id: number;
    name_ar: string;
    name_en: string;
    price: number;
}

export interface ItemVariations {
    sizes: SizeItem[];
    extras: ExtraItem[];
}

export interface MenuItem {
    id: number;
    category_id: number;
    name_ar: string;
    name_en: string;
    description_ar?: string;
    description_en?: string;
    base_price: number;
    image_url?: string;

    // Dynamic Fields (Calculated by Backend Logic)
    current_price: number;
    is_available?: boolean; // New: Controls "Out of Stock" visibility
    options: OptionGroup[];

    // Badge support
    badge_text_ar?: string;
    badge_text_en?: string;
    badge_text_other?: string;

    // Item-specific variations (sizes and extras)
    variations?: ItemVariations;
}

export interface MenuCategory {
    id: number;
    name_ar: string;
    name_en: string;
    items: MenuItem[];
}