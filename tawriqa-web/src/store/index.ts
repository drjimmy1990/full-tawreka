import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==========================================
// SETTINGS STORE (Theme, Languages)
// ==========================================
interface SettingsState {
    settings: Record<string, string>;
    isLoaded: boolean;
    supportedLanguages: string[];
    currentLanguage: string;
    setSettings: (settings: Record<string, string>) => void;
    setLanguage: (lang: string) => void;
    getSetting: (key: string) => string;
    getLocalizedSetting: (keyBase: string) => string;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            settings: {},
            isLoaded: false,
            supportedLanguages: ['ar', 'en'],
            currentLanguage: 'ar',

            setSettings: (settings) => {
                // Parse supported languages
                let langs = ['ar', 'en'];
                try {
                    langs = JSON.parse(settings['supported_languages'] || '["ar", "en"]');
                } catch { }

                set({
                    settings,
                    isLoaded: true,
                    supportedLanguages: langs,
                    currentLanguage: settings['default_language'] || 'ar',
                });

                // Apply primary color to CSS variable
                if (settings['primary_color']) {
                    document.documentElement.style.setProperty('--color-primary', settings['primary_color']);
                    // Generate darker shade
                    const hex = settings['primary_color'].replace('#', '');
                    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
                    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
                    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);
                    document.documentElement.style.setProperty('--color-primary-dark', `rgb(${r},${g},${b})`);
                }
            },

            setLanguage: (lang) => {
                set({ currentLanguage: lang });
                // Update document direction
                document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = lang;
            },

            getSetting: (key) => get().settings[key] || '',

            getLocalizedSetting: (keyBase) => {
                const { settings, currentLanguage } = get();
                // Try current language first
                const langSuffix = currentLanguage === 'ru' ? 'other' : currentLanguage;
                const localKey = `${keyBase}_${langSuffix}`;
                if (settings[localKey]) return settings[localKey];
                // Fallback to Arabic
                return settings[`${keyBase}_ar`] || '';
            },
        }),
        {
            name: 'tawriqa-settings',
            partialize: (state) => ({ currentLanguage: state.currentLanguage }),
        }
    )
);

// ==========================================
// LOCATION STORE (Branch, Service Type)
// ==========================================
interface BranchInfo {
    id: number;
    name: string;
    opening_time?: string;
    closing_time?: string;
    is_active?: boolean;
    is_delivery_available?: boolean;
}

interface LocationState {
    serviceType: 'delivery' | 'pickup' | null;
    branch: BranchInfo | null;

    // Delivery Details
    deliveryAddress: string;
    deliveryLat: number | null;
    deliveryLng: number | null;
    deliveryFee: number;
    deliveryZone: string;

    setServiceType: (type: 'delivery' | 'pickup') => void;
    setBranch: (branch: BranchInfo) => void;
    setDeliveryLocation: (address: string, lat: number, lng: number, fee?: number, zone?: string) => void;
    resetLocation: () => void;
    isBranchOpen: () => boolean;
}

/**
 * Check if current time is within opening_time..closing_time.
 * Handles overnight ranges (e.g., 10:00 AM → 01:00 AM next day).
 * Times are in "HH:MM:SS" or "HH:MM" format (24h from Supabase TIME column).
 */
export function checkBranchOpen(opening?: string, closing?: string): boolean {
    if (!opening || !closing) return true; // No hours set → always open

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTime = (t: string): number => {
        const parts = t.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    const openMin = parseTime(opening);
    const closeMin = parseTime(closing);

    if (closeMin > openMin) {
        // Normal range (e.g., 10:00 → 22:00)
        return currentMinutes >= openMin && currentMinutes < closeMin;
    } else {
        // Overnight range (e.g., 10:00 → 01:00)
        return currentMinutes >= openMin || currentMinutes < closeMin;
    }
}

export const useLocationStore = create<LocationState>()(
    persist(
        (set, get) => ({
            serviceType: null,
            branch: null,
            deliveryAddress: '',
            deliveryLat: null,
            deliveryLng: null,
            deliveryFee: 0,
            deliveryZone: '',

            setServiceType: (type) => set({ serviceType: type }),
            setBranch: (branch) => set({ branch }),

            setDeliveryLocation: (address, lat, lng, fee = 0, zone = '') => set({
                deliveryAddress: address,
                deliveryLat: lat,
                deliveryLng: lng,
                deliveryFee: fee,
                deliveryZone: zone
            }),

            resetLocation: () => set({
                serviceType: null,
                branch: null,
                deliveryAddress: '',
                deliveryLat: null,
                deliveryLng: null,
                deliveryFee: 0,
                deliveryZone: ''
            }),

            isBranchOpen: () => {
                const { branch } = get();
                if (!branch) return false;
                if (branch.is_active === false) return false;
                return checkBranchOpen(branch.opening_time, branch.closing_time);
            },
        }),
        {
            name: 'tawriqa-location',
        }
    )
);

// ==========================================
// CART STORE
// ==========================================
import type { CartItem } from '../types';

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
    addToCart: (item: Omit<CartItem, 'id'>) => void; // Alias for addItem to match user request
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            // Legacy addItem if needed, but we will use addToCart logic
            addItem: (item) => get().addToCart(item),

            addToCart: (newItem) => {
                set((state) => {
                    // Generate a unique signature for this item combo
                    const optionsSignature = newItem.selectedOptions
                        .map(o => `${o.groupId}:${o.choiceId}`)
                        .sort().join('|');
                    const uniqueId = `${newItem.menuItemId}-${optionsSignature}`;

                    // Check if exact combo exists
                    const existingItemIndex = state.items.findIndex(i => i.id === uniqueId);

                    if (existingItemIndex > -1) {
                        // Update quantity
                        const updatedItems = [...state.items];
                        updatedItems[existingItemIndex].quantity += newItem.quantity;
                        return { items: updatedItems };
                    } else {
                        // Add new
                        return { items: [...state.items, { ...newItem, id: uniqueId }] };
                    }
                });
            },

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                }));
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            clearCart: () => set({ items: [] }),

            getTotal: () => {
                return get().items.reduce((total, item) => {
                    return total + item.totalPrice * item.quantity;
                }, 0);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'tawriqa-cart',
        }
    )
);
