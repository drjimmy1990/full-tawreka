import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Edit, Trash2, Image, Save, X, Loader2, Upload, Settings2, LayoutGrid } from 'lucide-react';
import { useI18n } from '../../i18n';
import OptionsManager from '../../components/admin/OptionsManager';

// Types for hybrid approach
interface OptionChoice {
    id: number;
    name_ar: string;
    name_en?: string;
    name_other?: string;
}

interface OptionGroup {
    id: number;
    name_ar: string;
    name_en?: string;
    name_other?: string;
    min_selection: number;
    max_selection: number;
    is_price_replacement: boolean;
    option_choices?: OptionChoice[];
}

const MenuBuilder: React.FC = () => {
    const { t, language } = useI18n();
    const [categories, setCategories] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [selectedCat, setSelectedCat] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);

    // Image Upload State
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    // Language Tab State
    const [activeLang, setActiveLang] = useState<'ar' | 'en' | 'other'>('ar');

    // View Toggle: 'menu' or 'options'
    const [currentView, setCurrentView] = useState<'menu' | 'options'>('menu');

    // Hybrid Variations State
    const [allOptionGroups, setAllOptionGroups] = useState<OptionGroup[]>([]); // All available groups
    const [selectedGroups, setSelectedGroups] = useState<number[]>([]); // Which groups are linked to this item
    const [choicePrices, setChoicePrices] = useState<Record<number, Record<number, number>>>({}); // groupId -> { choiceId: price }

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const cats = await api.getCategories();
            setCategories(cats || []);
            if (cats && cats.length > 0 && !selectedCat) {
                setSelectedCat(cats[0].id);
                loadItems(cats[0].id);
            } else if (selectedCat) {
                loadItems(selectedCat);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadItems = async (catId: number) => {
        const data = await api.getMenuItems(catId);
        setItems(data || []);
    };

    const handleCatClick = (id: number) => {
        setSelectedCat(id);
        loadItems(id);
    };

    // Open modal for NEW item
    const openNewModal = async () => {
        setEditingItem(null);
        setImageUrl('');
        setActiveLang('ar');
        setSelectedGroups([]);
        setChoicePrices({});
        setIsItemModalOpen(true);

        // Load all option groups
        try {
            const groups = await api.getOptionGroups();
            setAllOptionGroups(groups || []);
        } catch (e) {
            console.error('Error loading groups', e);
        }
    };

    // Open modal for EDIT item
    const openEditModal = async (item: any) => {
        setEditingItem(item);
        setImageUrl(item.image_url || '');
        setActiveLang('ar');
        setIsItemModalOpen(true);

        // Load all option groups and item's linked groups
        try {
            const groups = await api.getOptionGroups();
            setAllOptionGroups(groups || []);

            // Load item's linked options with prices
            const linked = await api.getItemOptionGroups(item.id);
            const groupIds = linked?.map((l: any) => l.group_id) || [];
            setSelectedGroups(groupIds);

            // Build choice prices from linked data
            const prices: Record<number, Record<number, number>> = {};
            linked?.forEach((link: any) => {
                prices[link.group_id] = link.choice_prices || {};
            });
            setChoicePrices(prices);
        } catch (e) {
            console.error('Error loading options', e);
        }
    };

    // Open category modal
    const openCatModal = (cat: any = null) => {
        setEditingCategory(cat);
        setImageUrl(cat?.image_url || ''); // Set image URL or empty
        setActiveLang('ar');
        setIsCatModalOpen(true);
    };

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const url = await api.uploadImage(file);

        if (url) {
            setImageUrl(url);
        } else {
            alert(t('menu.upload_failed'));
        }
        setUploading(false);
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const catData = {
            id: editingCategory?.id,
            name_ar: formData.get('name_ar'),
            name_en: formData.get('name_en'),
            name_other: formData.get('name_other'),
            sort_order: parseInt(formData.get('sort_order') as string) || 0,
            image_url: imageUrl, // Include image URL
            is_active: true
        };

        try {
            await api.saveCategory(catData);
            setIsCatModalOpen(false);
            setEditingCategory(null);
            loadData();
        } catch (err) {
            alert(t('menu.error_save'));
        }
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCat) return;

        const formData = new FormData(e.target as HTMLFormElement);
        const itemData = {
            id: editingItem?.id,
            category_id: selectedCat,
            // All 3 languages
            name_ar: formData.get('name_ar'),
            name_en: formData.get('name_en'),
            name_other: formData.get('name_other'),
            description_ar: formData.get('description_ar'),
            description_en: formData.get('description_en') || '',
            description_other: formData.get('description_other') || '',
            base_price: parseFloat(formData.get('base_price') as string) || 0,
            image_url: imageUrl || null,
            is_active: formData.get('is_active') === 'on' // Read from checkbox
        };

        try {
            const savedItem = await api.saveMenuItem(itemData);

            // Save option links with prices
            const itemId = editingItem?.id || savedItem?.id;
            if (itemId) {
                // Filter choicePrices to only include selected groups
                const filteredPrices: Record<number, Record<number, number>> = {};
                selectedGroups.forEach(groupId => {
                    filteredPrices[groupId] = choicePrices[groupId] || {};
                });
                await api.saveItemOptionLinks(itemId, filteredPrices);
            }

            setIsItemModalOpen(false);
            setEditingItem(null);
            setImageUrl('');
            setSelectedGroups([]);
            setChoicePrices({});
            loadItems(selectedCat);
        } catch (err) {
            alert(t('menu.error_save'));
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!confirm(t('menu.delete_confirm'))) return;
        try {
            await api.deleteMenuItem(id);
            if (selectedCat) loadItems(selectedCat);
        } catch (err) {
            alert(t('menu.error_delete'));
        }
    };

    const handleDeleteCategory = async (cat: any) => {
        const confirmed = window.confirm(`Delete category "${cat.name_ar || cat.name_en}"?\n\nItems in this category will NOT be deleted, they will become uncategorized.`);
        if (!confirmed) return;
        try {
            await api.deleteCategory(cat.id);
            setSelectedCat(null);
            loadData();
        } catch (err) {
            alert(t('menu.error_delete'));
        }
    };

    // Helper to get display name based on language
    const getName = (item: any) => {
        if (language === 'en' && item.name_en) return item.name_en;
        return item.name_ar;
    };

    // Language Tab Component
    const LanguageTabs = () => (
        <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            <button
                type="button"
                onClick={() => setActiveLang('ar')}
                className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${activeLang === 'ar' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                عربي (AR)
            </button>
            <button
                type="button"
                onClick={() => setActiveLang('en')}
                className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${activeLang === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                English (EN)
            </button>
            <button
                type="button"
                onClick={() => setActiveLang('other')}
                className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${activeLang === 'other' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                Other (3rd)
            </button>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* View Toggle Header */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentView('menu')}
                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${currentView === 'menu' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        {language === 'ar' ? 'عناصر المنيو' : 'Menu Items'}
                    </button>
                    <button
                        onClick={() => setCurrentView('options')}
                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${currentView === 'options' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <Settings2 className="w-4 h-4" />
                        {language === 'ar' ? 'قوالب الخيارات' : 'Option Templates'}
                    </button>
                </div>
            </div>

            {currentView === 'options' ? (
                <OptionsManager />
            ) : (
                <div className="flex h-[calc(100vh-200px)] gap-6">

                    {/* LEFT: Categories */}
                    <div className="w-1/4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">{t('menu.categories')}</h3>
                            <button
                                onClick={() => openCatModal(null)}
                                className="p-1 hover:bg-gray-200 rounded"
                            >
                                <Plus className="w-5 h-5 text-blue-600" />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-1">
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    onClick={() => handleCatClick(cat.id)}
                                    className={`w-full text-left rtl:text-right px-4 py-3 rounded-lg text-sm font-medium transition-colors flex justify-between items-center group cursor-pointer ${selectedCat === cat.id ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <span>{getName(cat)}</span>
                                    <div className="flex items-center gap-1">
                                        {selectedCat === cat.id && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openCatModal(cat); }}
                                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded"
                                        >
                                            <Edit className="w-3 h-3 text-gray-500" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded"
                                        >
                                            <Trash2 className="w-3 h-3 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {categories.length === 0 && !loading && (
                                <div className="text-center text-gray-400 p-4 text-sm">
                                    {t('menu.no_categories')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Items */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">{t('menu.items')}</h3>
                            <button
                                onClick={openNewModal}
                                disabled={!selectedCat}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {t('menu.add_item')}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {loading ? (
                                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>
                            ) : !selectedCat ? (
                                <div className="text-center text-gray-400 mt-20">{t('menu.select_category')}</div>
                            ) : items.length === 0 ? (
                                <div className="text-center text-gray-400 mt-20">{t('menu.no_items')}</div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {items.map(item => (
                                        <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow relative group">
                                            <div className="flex gap-3">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt={getName(item)} /> : <Image className="text-gray-400 w-6 h-6" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-800 truncate">{getName(item)}</h4>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{item.description_ar || t('menu.no_description')}</p>
                                                    <p className="text-blue-600 font-bold mt-1">{item.base_price} {t('common.currency')}</p>
                                                </div>
                                            </div>
                                            <div className="absolute top-2 ltr:right-2 rtl:left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <button onClick={() => openEditModal(item)} className="p-1.5 bg-gray-100 hover:bg-blue-100 text-blue-600 rounded"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 bg-gray-100 hover:bg-red-100 text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CATEGORY MODAL - With Language Tabs */}
                    {isCatModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800">{editingCategory ? t('menu.edit_category') : t('menu.new_category')}</h3>
                                    <button onClick={() => { setIsCatModalOpen(false); setEditingCategory(null); }}><X className="text-gray-500 hover:text-red-500" /></button>
                                </div>
                                <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                                    {/* Language Tabs */}
                                    <LanguageTabs />

                                    {/* Category Name - Multi-language */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">
                                            {t('menu.name_ar').replace('(عربي)', '').replace('(Arabic)', '')} ({activeLang.toUpperCase()}) {activeLang === 'ar' && '*'}
                                        </label>
                                        <input name="name_ar" defaultValue={editingCategory?.name_ar} className={`w-full border p-2 rounded ${activeLang === 'ar' ? '' : 'hidden'}`} placeholder="اسم القسم" required />
                                        <input name="name_en" defaultValue={editingCategory?.name_en} className={`w-full border p-2 rounded ${activeLang === 'en' ? '' : 'hidden'}`} placeholder="Category Name" />
                                        <input name="name_other" defaultValue={editingCategory?.name_other} className={`w-full border p-2 rounded ${activeLang === 'other' ? '' : 'hidden'}`} placeholder="Nom de catégorie" />
                                    </div>

                                    {/* Sort Order - Always visible */}
                                    <div className="border-t pt-4">
                                        <label className="text-xs font-bold text-gray-500">{t('menu.sort_order')}</label>
                                        <input type="number" name="sort_order" defaultValue={editingCategory?.sort_order || 0} className="w-full border p-2 rounded mt-1" />
                                    </div>

                                    {/* IMAGE UPLOAD SECTION (Category) */}
                                    <div className="pt-2">
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">{t('menu.image_url')}</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="file"
                                                id="cat-file-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                            />
                                            <input
                                                name="image_url"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                className="flex-1 border p-2 rounded text-sm bg-gray-50"
                                                placeholder="https://..."
                                            />
                                            <label
                                                htmlFor="cat-file-upload"
                                                className={`p-2 rounded cursor-pointer transition-colors ${uploading ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                                            >
                                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                            </label>
                                        </div>
                                        {imageUrl && (
                                            <div className="mt-2 relative w-full h-32 bg-gray-100 rounded overflow-hidden group">
                                                <img src={imageUrl} alt="Category" className="w-full h-full object-cover" />
                                                <button
                                                    type="button" // Prevent form submission
                                                    onClick={() => setImageUrl('')}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center">
                                            <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {t('menu.save_category')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ITEM MODAL - With Language Tabs */}
                    {isItemModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
                                <div className="p-4 border-b bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                                    <h3 className="font-bold text-gray-800">{editingItem ? t('menu.edit_item') : t('menu.new_item')}</h3>
                                    <button onClick={() => { setIsItemModalOpen(false); setEditingItem(null); setImageUrl(''); }}><X className="text-gray-500 hover:text-red-500" /></button>
                                </div>
                                <form onSubmit={handleSaveItem} className="p-6 space-y-4">

                                    {/* Language Tabs */}
                                    <LanguageTabs />

                                    {/* Item Name - Multi-language */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">
                                            {t('menu.name_ar').replace('(عربي)', '').replace('(Arabic)', '')} ({activeLang.toUpperCase()}) {activeLang === 'ar' && '*'}
                                        </label>
                                        <input name="name_ar" defaultValue={editingItem?.name_ar} className={`w-full border p-2 rounded ${activeLang === 'ar' ? '' : 'hidden'}`} placeholder="اسم الصنف" required />
                                        <input name="name_en" defaultValue={editingItem?.name_en} className={`w-full border p-2 rounded ${activeLang === 'en' ? '' : 'hidden'}`} placeholder="Item Name" />
                                        <input name="name_other" defaultValue={editingItem?.name_other} className={`w-full border p-2 rounded ${activeLang === 'other' ? '' : 'hidden'}`} placeholder="Nom de l'article" />
                                    </div>

                                    {/* Description - Multi-language */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">
                                            {t('menu.description')} ({activeLang.toUpperCase()})
                                        </label>
                                        <textarea name="description_ar" defaultValue={editingItem?.description_ar} className={`w-full border p-2 rounded ${activeLang === 'ar' ? '' : 'hidden'}`} rows={3} placeholder="وصف المكونات..." />
                                        <textarea name="description_en" defaultValue={editingItem?.description_en} className={`w-full border p-2 rounded ${activeLang === 'en' ? '' : 'hidden'}`} rows={3} placeholder="Ingredients description..." />
                                        <textarea name="description_other" defaultValue={editingItem?.description_other} className={`w-full border p-2 rounded ${activeLang === 'other' ? '' : 'hidden'}`} rows={3} placeholder="Description des ingrédients..." />
                                    </div>

                                    {/* Common Fields - Always Visible */}
                                    <div className="border-t pt-4 space-y-4">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{language === 'ar' ? 'الحقول العامة' : 'Common Fields'}</div>

                                        {/* Price - Hidden if pricing group is selected */}
                                        {(() => {
                                            const hasPricingGroup = selectedGroups.some(gId =>
                                                allOptionGroups.find(g => g.id === gId)?.is_price_replacement
                                            );
                                            return hasPricingGroup ? (
                                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <p className="text-sm text-green-700">
                                                        <span className="font-bold">✓ {language === 'ar' ? 'السعر يُحدد حسب الحجم' : 'Price is set by size'}</span>
                                                        <br />
                                                        <span className="text-xs text-green-600">
                                                            {language === 'ar'
                                                                ? 'أنت تستخدم مجموعة "سعر مباشر". السعر الأساسي سيكون 0.'
                                                                : 'You\'re using a "Direct Price" group. Base price will be 0.'}
                                                        </span>
                                                    </p>
                                                    <input type="hidden" name="base_price" value="0" />
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500">{t('menu.price')} ({t('common.currency')}) *</label>
                                                    <input type="number" step="0.5" name="base_price" defaultValue={editingItem?.base_price} required className="w-full border p-2 rounded mt-1 bg-blue-50" />
                                                </div>
                                            );
                                        })()}

                                        {/* IMAGE UPLOAD SECTION */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">{t('menu.image_url')}</label>

                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="file"
                                                    id="file-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                />
                                                <input
                                                    name="image_url_display"
                                                    value={imageUrl}
                                                    onChange={(e) => setImageUrl(e.target.value)}
                                                    placeholder="https://..."
                                                    className="flex-1 border p-2 rounded text-sm bg-gray-50"
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    className={`cursor-pointer px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 flex items-center gap-2 text-sm transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                                >
                                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                    <span className="hidden sm:inline">{t('menu.upload')}</span>
                                                </label>
                                            </div>

                                            {/* Preview */}
                                            {imageUrl && (
                                                <div className="mt-2 w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setImageUrl('')}
                                                        className="absolute top-1 ltr:right-1 rtl:left-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* GLOBAL ACTIVE TOGGLE */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                id="item_is_active"
                                                defaultChecked={editingItem?.is_active !== false}
                                                className="w-4 h-4 text-green-600 rounded"
                                            />
                                            <label htmlFor="item_is_active" className="text-sm text-gray-700">
                                                {language === 'ar' ? 'نشط (ظاهر في الموقع)' : 'Active (visible on website)'}
                                            </label>
                                        </div>
                                    </div>

                                    {/* OPTION GROUPS SECTION */}
                                    <div className="border-t pt-4 mt-4">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Settings2 className="w-4 h-4" />
                                            {language === 'ar' ? 'الاختيارات والإضافات' : 'Options & Variations'}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">
                                            {language === 'ar'
                                                ? 'اختر المجموعات وحدد السعر لكل خيار. السعر 0 = مخفي لهذا الصنف.'
                                                : 'Select groups and set price per choice. Price 0 = hidden for this item.'}
                                        </p>

                                        {allOptionGroups.length === 0 ? (
                                            <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-400">
                                                {language === 'ar'
                                                    ? 'لا توجد مجموعات خيارات. أنشئ واحدة أولاً في "إدارة الخيارات".'
                                                    : 'No option groups. Create one first in "Options Manager".'}
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {allOptionGroups.map(group => {
                                                    const isSelected = selectedGroups.includes(group.id);
                                                    return (
                                                        <div key={group.id} className={`border rounded-lg overflow-hidden ${isSelected ? 'border-blue-300' : 'border-gray-200'}`}>
                                                            {/* Group Header */}
                                                            <label className={`flex items-center gap-3 p-3 cursor-pointer ${isSelected ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedGroups([...selectedGroups, group.id]);
                                                                            const initialPrices: Record<number, number> = {};
                                                                            group.option_choices?.forEach(choice => {
                                                                                initialPrices[choice.id] = 0;
                                                                            });
                                                                            setChoicePrices({ ...choicePrices, [group.id]: initialPrices });
                                                                        } else {
                                                                            setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                                                                            const updated = { ...choicePrices };
                                                                            delete updated[group.id];
                                                                            setChoicePrices(updated);
                                                                        }
                                                                    }}
                                                                    className="w-4 h-4 accent-blue-600"
                                                                />
                                                                <div className="flex-1">
                                                                    <span className="font-bold text-gray-800">
                                                                        {language === 'ar' ? group.name_ar : (group.name_en || group.name_ar)}
                                                                    </span>
                                                                    <div className="flex gap-2 mt-1">
                                                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                                            {group.min_selection > 0 ? (language === 'ar' ? 'مطلوب' : 'Required') : (language === 'ar' ? 'اختياري' : 'Optional')}
                                                                        </span>
                                                                        {group.is_price_replacement && (
                                                                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                                                {language === 'ar' ? 'سعر مباشر' : 'Direct Price'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </label>

                                                            {/* Pricing Table */}
                                                            {isSelected && group.option_choices && group.option_choices.length > 0 && (
                                                                <div className="p-3 bg-white border-t border-gray-100">
                                                                    <table className="w-full text-sm">
                                                                        <thead>
                                                                            <tr className="text-gray-500 text-xs">
                                                                                <th className="text-start pb-2">{language === 'ar' ? 'الخيار' : 'Choice'}</th>
                                                                                <th className="text-start pb-2 w-32">{language === 'ar' ? 'السعر (ج.م)' : 'Price (EGP)'}</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {group.option_choices.map(choice => (
                                                                                <tr key={choice.id} className="border-t border-gray-50">
                                                                                    <td className="py-2 font-medium text-gray-700">
                                                                                        {language === 'ar' ? choice.name_ar : (choice.name_en || choice.name_ar)}
                                                                                    </td>
                                                                                    <td className="py-2">
                                                                                        <input
                                                                                            type="number"
                                                                                            step="0.5"
                                                                                            value={choicePrices[group.id]?.[choice.id] ?? 0}
                                                                                            onChange={(e) => {
                                                                                                const price = parseFloat(e.target.value) || 0;
                                                                                                setChoicePrices({
                                                                                                    ...choicePrices,
                                                                                                    [group.id]: {
                                                                                                        ...choicePrices[group.id],
                                                                                                        [choice.id]: price
                                                                                                    }
                                                                                                });
                                                                                            }}
                                                                                            className={`w-full border p-2 rounded text-sm font-bold ${(choicePrices[group.id]?.[choice.id] ?? 0) === 0
                                                                                                ? 'bg-red-50 text-red-400'
                                                                                                : 'bg-green-50'
                                                                                                }`}
                                                                                            placeholder="0"
                                                                                        />
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                    <p className="text-[10px] text-gray-400 mt-2">
                                                                        {language === 'ar' ? '💡 السعر 0 = مخفي' : '💡 Price 0 = hidden'}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>


                                    <div className="pt-4 flex justify-end border-t mt-4">
                                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center">
                                            <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {t('menu.save_item')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default MenuBuilder;
