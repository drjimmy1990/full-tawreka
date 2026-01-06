import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import CategoryBar from '../components/menu/CategoryBar';
import MenuItemCard from '../components/menu/MenuItemCard';
import ProductModal from '../components/menu/ProductModal';
import CartDrawer from '../components/menu/CartDrawer';
import UserHeader from '../components/layout/UserHeader';
import { useLocationStore, useSettingsStore, useCartStore } from '../store';
import api from '../lib/api';
import type { MenuItem } from '../types';

export default function Menu() {
    const navigate = useNavigate();
    const { t, lang } = useTranslation();
    const { settings } = useSettingsStore();
    const { serviceType, branch } = useLocationStore();
    const { getItemCount, getTotal } = useCartStore();

    // Guard: Redirect to location if no branch selected
    useEffect(() => {
        if (!branch) {
            navigate('/location?redirect=menu');
        }
    }, [branch, navigate]);

    // State
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<number>(0);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Background from settings or fallback
    const heroImage = settings?.hero_cover || '/assets/images/menu-cover.avif';

    // Fetch Menu Data
    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                // Use selected branch or default to 1 (Main Branch)
                const branchId = branch?.id || 1;
                const data = await api.getBranchMenu(branchId);

                if (data && data.length > 0) {
                    setCategories(data);
                    setActiveCategory(data[0].id);
                }
            } catch (error) {
                console.error("Failed to load menu", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [branch]);

    // Derived state: Active Category Object and its Items
    const currentCategory = categories.find(c => c.id === activeCategory);
    const currentItems = currentCategory?.items || [];
    const cartCount = getItemCount();

    // Helper to calculate "From" price for items with variations
    const calculateMinPrice = (item: any) => {
        if (!item.options || item.options.length === 0) return 0;

        // Check for price replacement groups (Sizes)
        const sizeGroup = item.options.find((g: any) => g.is_price_replacement);
        if (sizeGroup && sizeGroup.choices?.length > 0) {
            // Return the lowest price among sizes
            return Math.min(...sizeGroup.choices.map((c: any) => c.price_modifier));
        }

        return 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Shared Header (Overlay) - Disappears on scroll naturally */}
            <UserHeader variant="overlay" />

            {/* Hero Section */}
            <div className="relative h-[30vh] min-h-[250px] bg-gray-900">
                <img
                    src={heroImage}
                    alt="Cover"
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute -bottom-10 left-0 right-0 px-4">
                    <div className="bg-white rounded-3xl p-4 shadow-xl flex items-center gap-4 mx-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full border-4 border-white shadow-sm shrink-0 overflow-hidden">
                            <img
                                src={settings?.brand_logo || '/assets/images/logo.avif'}
                                alt="Brand"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex-1">
                            <h1 className="font-bold text-lg text-gray-900">{settings?.brand_name_ar || 'توريقة'}</h1>
                            <p className="text-xs text-gray-500">
                                {branch?.name && <span className="text-primary font-bold">{branch.name} • </span>}
                                {serviceType === 'delivery' ? t('landing.delivery') : t('landing.pickup')} • 35-45 {t('common.minutes')}
                            </p>
                        </div>
                        <div className="text-center bg-green-50 px-3 py-1 rounded-lg">
                            <span className="block text-lg font-bold text-green-600">4.8</span>
                            <span className="text-[10px] text-green-600">★★★★★</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer for Hero Content overlapping */}
            <div className="h-14"></div>

            {/* Sticky Category Bar */}
            <CategoryBar
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
                categories={categories} // Now passing real categories
            />

            {/* Menu Items (Real Components) */}
            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-xl text-gray-800 animate-in slide-in-from-start-4">
                        {lang === 'ar' ? currentCategory?.name_ar : (currentCategory?.name_en || currentCategory?.name_ar)}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    {currentItems.length > 0 ? (
                        currentItems.map((item: any) => (
                            <MenuItemCard
                                key={item.id}
                                id={item.id}
                                name={lang === 'ar' ? item.name_ar : (item.name_en || item.name_ar)}
                                description={lang === 'ar' ? item.description_ar : (item.description_en || item.description_ar)}
                                price={item.current_price || item.base_price}
                                image={item.image_url || `https://source.unsplash.com/random/400x400?food,plate&sig=${item.id}`}
                                hasOptions={item.options && item.options.length > 0}
                                minPrice={calculateMinPrice(item)}
                                onAdd={() => setSelectedItem(item)}
                            /> // item passed to onAdd is used to set selectedItem
                        ))
                    ) : (
                        <div className="col-span-full py-10 text-center text-gray-400">
                            No items found in this category.
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Cart Button */}
            {cartCount > 0 && (
                <div className="fixed bottom-6 left-4 right-4 z-50">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-between font-bold animate-in slide-in-from-bottom-5"
                    >
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                            <span className="text-sm">{cartCount}</span>
                        </div>
                        <span>{t('cart.view')}</span>
                        <span>{getTotal().toFixed(2)} {t('common.currency')}</span>
                    </button>
                </div>
            )}

            {/* Product Modal */}
            {selectedItem && (
                <ProductModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
        </div>
    );
}
