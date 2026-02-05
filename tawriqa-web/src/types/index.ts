export interface Branch {
    id: number;
    name: string;
    phone_contact?: string;
    zones?: any;
    opening_time?: string;
    closing_time?: string;
    is_active?: boolean;
    is_delivery_available?: boolean; // New
}

// Menu Options Types
export interface MenuOptionChoice {
    id: number;
    name_ar: string;
    name_en: string;
    name_other?: string;
    price_modifier: number;
    description_ar?: string; // New
    description_en?: string; // New
    description_other?: string; // New
}

export interface MenuOptionGroup {
    id: number;
    name_ar: string;
    name_en: string;
    min_selection: number;
    max_selection: number;
    is_price_replacement?: boolean;
    choices?: MenuOptionChoice[];
    option_choices?: MenuOptionChoice[]; // API returns this name from Supabase nested query
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
    name_en?: string;
    name_other?: string;
    description_ar?: string;
    description_en?: string;
    description_other?: string;
    base_price: number;
    current_price?: number;
    image_url?: string;
    is_available?: boolean;
    options?: MenuOptionGroup[];
    variations?: ItemVariations;
}

export interface MenuCategory {
    id: number;
    name_ar: string;
    name_en?: string;
    name_other?: string;
    image_url?: string;
    sort_order?: number;
    items?: MenuItem[];
}

export interface SelectedOption {
    groupId: number;
    choiceId: number;
    name: string;
    price: number;
}

export interface CartItem {
    id: string; // Unique ID (itemID + optionsHash)
    menuItemId: number;
    name: string;
    description?: string;
    image?: string;
    basePrice: number;
    totalPrice: number;
    quantity: number;
    notes?: string;
    size?: string; // Extracted distinct size selection
    selectedOptions: SelectedOption[];
}
