import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Edit, Trash2, Save, X, Loader2, ChevronDown, ChevronUp, DollarSign, ListChecks } from 'lucide-react';
import { useI18n } from '../../i18n';

interface OptionChoice {
    id?: number;
    group_id: number;
    name_ar: string;
    name_en?: string;
    name_other?: string;
    description_ar?: string;  // NEW
    description_en?: string;  // NEW
    description_other?: string; // NEW
    price_modifier: number;
    is_available: boolean;
}

interface OptionGroup {
    id?: number;
    name_ar: string;
    name_en?: string;
    name_other?: string;
    min_selection: number;
    max_selection: number;
    is_price_replacement: boolean;
    is_active: boolean;
    option_choices?: OptionChoice[];
}

const OptionsManager: React.FC = () => {
    const { t, language } = useI18n();
    const [groups, setGroups] = useState<OptionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

    // Modal State
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);

    const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
    const [editingChoice, setEditingChoice] = useState<OptionChoice | null>(null);
    const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);

    // Language Tab State
    const [activeLang, setActiveLang] = useState<'ar' | 'en' | 'other'>('ar');

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        setLoading(true);
        try {
            const data = await api.getOptionGroups();
            setGroups(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const openGroupModal = (group: OptionGroup | null = null) => {
        setEditingGroup(group);
        setActiveLang('ar');
        setIsGroupModalOpen(true);
    };

    const openChoiceModal = (groupId: number, choice: OptionChoice | null = null) => {
        setCurrentGroupId(groupId);
        setEditingChoice(choice);
        setActiveLang('ar');
        setIsChoiceModalOpen(true);
    };

    const handleSaveGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const groupData: OptionGroup = {
            id: editingGroup?.id,
            name_ar: formData.get('name_ar') as string,
            name_en: formData.get('name_en') as string,
            name_other: formData.get('name_other') as string,
            min_selection: parseInt(formData.get('min_selection') as string) || 0,
            max_selection: parseInt(formData.get('max_selection') as string) || 1,
            is_price_replacement: formData.get('is_price_replacement') === 'on',
            is_active: true
        };

        try {
            await api.saveOptionGroup(groupData);
            setIsGroupModalOpen(false);
            setEditingGroup(null);
            loadGroups();
        } catch (err) {
            alert('Error saving group');
        }
    };

    const handleDeleteGroup = async (id: number) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
        try {
            await api.deleteOptionGroup(id);
            loadGroups();
        } catch (err) {
            alert('Error deleting group');
        }
    };

    const handleSaveChoice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentGroupId) return;

        const formData = new FormData(e.target as HTMLFormElement);
        const choiceData: OptionChoice = {
            id: editingChoice?.id,
            group_id: currentGroupId,
            name_ar: formData.get('name_ar') as string,
            name_en: formData.get('name_en') as string,
            name_other: formData.get('name_other') as string,
            description_ar: formData.get('description_ar') as string, // NEW
            description_en: formData.get('description_en') as string, // NEW
            description_other: formData.get('description_other') as string, // NEW
            price_modifier: parseFloat(formData.get('price_modifier') as string) || 0,
            is_available: true
        };

        try {
            await api.saveOptionChoice(choiceData);
            setIsChoiceModalOpen(false);
            setEditingChoice(null);
            loadGroups();
        } catch (err) {
            alert('Error saving choice');
        }
    };

    const handleDeleteChoice = async (id: number) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
        try {
            await api.deleteOptionChoice(id);
            loadGroups();
        } catch (err) {
            alert('Error deleting choice');
        }
    };

    const handleMoveChoice = async (group: OptionGroup, index: number, direction: number) => {
        if (!group.option_choices) return;
        const newChoices = [...group.option_choices];
        if (index + direction < 0 || index + direction >= newChoices.length) return;

        const itemA = newChoices[index];
        const itemB = newChoices[index + direction];

        // Swap order in array
        newChoices[index] = itemB;
        newChoices[index + direction] = itemA;

        // Update local state (Optimistic)
        const updatedGroups = groups.map(g => {
            if (g.id === group.id) {
                return { ...g, option_choices: newChoices };
            }
            return g;
        });
        setGroups(updatedGroups);

        // Calculate sort orders
        // Note: We update both to ensure consistency, using their new array indices as base
        // But better to swap their existing sort_orders if they exist, or assign based on index

        // Actually, best specific persistence:
        if (itemA.id && itemB.id) {
            // We need valid sort orders. If they are 0/null, we might need a full re-sort.
            // Let's assume we just want to execute the swap.
            // We will use the ARRAY INDEX as the truth for sort_order.

            await api.updateOptionChoiceSortOrder(itemA.id, index + direction); // New pos
            await api.updateOptionChoiceSortOrder(itemB.id, index); // New pos
        }
        // If there's an error, loadGroups() will revert the optimistic update.
    };

    const getName = (item: any) => {
        if (language === 'en' && item.name_en) return item.name_en;
        return item.name_ar;
    };

    const LanguageTabs = () => (
        <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            <button type="button" onClick={() => setActiveLang('ar')} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${activeLang === 'ar' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                عربي (AR)
            </button>
            <button type="button" onClick={() => setActiveLang('en')} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${activeLang === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                English (EN)
            </button>
            <button type="button" onClick={() => setActiveLang('other')} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${activeLang === 'other' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                Other (3rd)
            </button>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-blue-600" />
                    {language === 'ar' ? 'إدارة الاختيارات (الحجم، الإضافات)' : 'Options Manager (Size, Extras)'}
                </h3>
                <button
                    onClick={() => openGroupModal(null)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                    {language === 'ar' ? 'إضافة مجموعة' : 'Add Group'}
                </button>
            </div>

            {/* Groups List */}
            <div className="p-4 space-y-3">
                {groups.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        {language === 'ar' ? 'لا توجد مجموعات خيارات بعد' : 'No option groups yet'}
                    </div>
                ) : (
                    groups.map(group => (
                        <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Group Header */}
                            <div
                                className="p-3 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                                onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id!)}
                            >
                                <div className="flex items-center gap-3">
                                    {expandedGroup === group.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    <div>
                                        <h4 className="font-bold text-gray-800">{getName(group)}</h4>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                {group.min_selection > 0 ? (language === 'ar' ? 'مطلوب' : 'Required') : (language === 'ar' ? 'اختياري' : 'Optional')}
                                            </span>
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                {group.max_selection === 1
                                                    ? (language === 'ar' ? 'اختيار واحد' : 'Single Choice')
                                                    : (language === 'ar' ? `حد أقصى: ${group.max_selection}` : `Max: ${group.max_selection}`)}
                                            </span>
                                            {group.is_price_replacement && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    {language === 'ar' ? 'سعر مباشر' : 'Direct Price'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => openGroupModal(group)} className="p-2 hover:bg-blue-100 text-blue-600 rounded"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteGroup(group.id!)} className="p-2 hover:bg-red-100 text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Choices (Expanded) */}
                            {expandedGroup === group.id && (
                                <div className="p-3 border-t border-gray-200 bg-white">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-gray-500">{language === 'ar' ? 'الخيارات:' : 'Choices:'}</span>
                                        <button
                                            onClick={() => openChoiceModal(group.id!, null)}
                                            className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-lg hover:bg-green-100 flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> {language === 'ar' ? 'إضافة خيار' : 'Add Choice'}
                                        </button>
                                    </div>
                                    {group.option_choices && group.option_choices.length > 0 ? (
                                        <div className="space-y-2">
                                            {group.option_choices.map((choice, index) => (
                                                <div key={choice.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-gray-800">{getName(choice)}</span>
                                                        <span className="text-sm text-green-600 font-bold">
                                                            {group.is_price_replacement ? '' : '+'}{choice.price_modifier} {language === 'ar' ? 'ج.م' : 'EGP'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <div className="flex flex-col mr-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMoveChoice(group, index, -1);
                                                                }}
                                                                className="text-gray-400 hover:text-blue-600 p-0.5"
                                                                title="Move Up"
                                                            >
                                                                <ChevronUp className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMoveChoice(group, index, 1);
                                                                }}
                                                                className="text-gray-400 hover:text-blue-600 p-0.5"
                                                                title="Move Down"
                                                            >
                                                                <ChevronDown className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <button onClick={() => openChoiceModal(group.id!, choice)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"><Edit className="w-3 h-3" /></button>
                                                        <button onClick={() => handleDeleteChoice(choice.id!)} className="p-1.5 hover:bg-red-100 text-red-600 rounded"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 text-center py-4">{language === 'ar' ? 'لا توجد خيارات' : 'No choices yet'}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Group Modal */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">{editingGroup ? (language === 'ar' ? 'تعديل المجموعة' : 'Edit Group') : (language === 'ar' ? 'إضافة مجموعة جديدة' : 'Add New Group')}</h3>
                            <button onClick={() => { setIsGroupModalOpen(false); setEditingGroup(null); }}><X className="text-gray-500 hover:text-red-500" /></button>
                        </div>
                        <form onSubmit={handleSaveGroup} className="p-6 space-y-4">
                            <LanguageTabs />

                            {/* Name */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">{language === 'ar' ? 'اسم المجموعة' : 'Group Name'} ({activeLang.toUpperCase()}) {activeLang === 'ar' && '*'}</label>
                                <input name="name_ar" defaultValue={editingGroup?.name_ar} className={`w-full border p-2 rounded ${activeLang === 'ar' ? '' : 'hidden'}`} placeholder="الحجم" required />
                                <input name="name_en" defaultValue={editingGroup?.name_en} className={`w-full border p-2 rounded ${activeLang === 'en' ? '' : 'hidden'}`} placeholder="Size" />
                                <input name="name_other" defaultValue={editingGroup?.name_other} className={`w-full border p-2 rounded ${activeLang === 'other' ? '' : 'hidden'}`} placeholder="Размер" />
                            </div>

                            {/* Selection Rules */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">{language === 'ar' ? 'الحد الأدنى' : 'Min Selection'}</label>
                                    <input type="number" name="min_selection" defaultValue={editingGroup?.min_selection || 0} min="0" className="w-full border p-2 rounded mt-1" />
                                    <p className="text-xs text-gray-400 mt-1">{language === 'ar' ? '0 = اختياري' : '0 = Optional'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">{language === 'ar' ? 'الحد الأقصى للاختيارات' : 'Max Selections Allowed'}</label>
                                    <input type="number" name="max_selection" defaultValue={editingGroup?.max_selection || 1} min="1" className="w-full border p-2 rounded mt-1" />
                                    <p className="text-xs text-gray-400 mt-1">{language === 'ar' ? 'أقصى عدد يمكن للعميل اختياره (مثلاً 3 صوصات)' : 'Max total items user can pick from this group'}</p>
                                </div>
                            </div>

                            {/* Price Replacement Toggle */}
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <input type="checkbox" name="is_price_replacement" id="is_price_replacement" defaultChecked={editingGroup?.is_price_replacement} className="w-5 h-5 accent-green-600" />
                                <label htmlFor="is_price_replacement" className="flex-1">
                                    <span className="font-bold text-green-700">{language === 'ar' ? 'السعر المباشر' : 'Direct Price Mode'}</span>
                                    <p className="text-xs text-green-600 mt-0.5">{language === 'ar' ? 'السعر المدخل هو سعر البيع الكامل (للأحجام)' : 'Choice price IS the selling price (for Sizes)'}</p>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center">
                                    <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {language === 'ar' ? 'حفظ' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Choice Modal */}
            {isChoiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">{editingChoice ? (language === 'ar' ? 'تعديل الخيار' : 'Edit Choice') : (language === 'ar' ? 'إضافة خيار جديد' : 'Add New Choice')}</h3>
                            <button onClick={() => { setIsChoiceModalOpen(false); setEditingChoice(null); }}><X className="text-gray-500 hover:text-red-500" /></button>
                        </div>
                        <form onSubmit={handleSaveChoice} className="p-6 space-y-4">
                            <LanguageTabs />

                            {/* Name */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">{language === 'ar' ? 'اسم الخيار' : 'Choice Name'} ({activeLang.toUpperCase()}) {activeLang === 'ar' && '*'}</label>
                                <input name="name_ar" defaultValue={editingChoice?.name_ar} className={`w-full border p-2 rounded ${activeLang === 'ar' ? '' : 'hidden'}`} placeholder="كبير" required />
                                <input name="name_en" defaultValue={editingChoice?.name_en} className={`w-full border p-2 rounded ${activeLang === 'en' ? '' : 'hidden'}`} placeholder="Large" />
                                <input name="name_other" defaultValue={editingChoice?.name_other} className={`w-full border p-2 rounded ${activeLang === 'other' ? '' : 'hidden'}`} placeholder="Большой" />
                            </div>

                            {/* Price Note */}
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-xs text-yellow-700">
                                    <span className="font-bold">{language === 'ar' ? 'ملاحظة:' : 'Note:'}</span>{' '}
                                    {language === 'ar'
                                        ? 'الأسعار تُحدد لكل صنف في إدارة المنيو. هنا فقط لتعريف الأسماء.'
                                        : 'Prices are set per-item in Menu Builder. Here we only define names.'}
                                </p>
                            </div>
                            <input type="hidden" name="price_modifier" value="0" />

                            <div className="pt-4 flex justify-end">
                                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center">
                                    <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {language === 'ar' ? 'حفظ' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OptionsManager;
