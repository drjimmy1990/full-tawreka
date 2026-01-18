import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Store, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n';

const BranchPriceManager: React.FC = () => {
    const { t, language } = useI18n();
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState<number | null>(null); // track which item is saving
    const [expandedItem, setExpandedItem] = useState<number | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<number | null>(null); // track which item just saved

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        const data = await api.getBranches();
        setBranches(data || []);
        if (data && data.length > 0) {
            setSelectedBranch(data[0].id);
            loadBranchMenu(data[0].id);
        }
    };

    const loadBranchMenu = async (branchId: number) => {
        setLoading(true);
        try {
            const data = await api.getBranchMenuSettings(branchId);
            setMenuItems(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleBranchChange = (branchId: number) => {
        setSelectedBranch(branchId);
        loadBranchMenu(branchId);
        setExpandedItem(null);
        setSaveSuccess(null);
    };

    const handleUpdate = async (item: any, newPrice: number, newActive: boolean) => {
        if (!selectedBranch) return;
        setSaving(item.id);
        setSaveSuccess(null);

        // Gather choice prices if expanded - FIXED: use option_choices instead of choices
        const choicePrices: Record<string, number> = {};
        if (item.options && item.options.length > 0) {
            item.options.forEach((group: any) => {
                // Use option_choices which is what the data structure actually provides
                const choices = group.option_choices || group.choices || [];
                choices.forEach((choice: any) => {
                    const inputId = `price-choice-${item.id}-${choice.id}`;
                    const customInput = document.getElementById(inputId) as HTMLInputElement;
                    if (customInput && customInput.value) {
                        choicePrices[choice.id.toString()] = parseFloat(customInput.value);
                    }
                });
            });
        }

        console.log('Saving choice prices:', choicePrices); // Debug log

        try {
            await api.updateBranchPrice(selectedBranch, item.id, newPrice, newActive, choicePrices);

            // Update local state to reflect changes instantly
            setMenuItems(prev => prev.map(i => {
                if (i.id === item.id) {
                    const existingOverride = i.branch_item_prices?.[0] || {};
                    return {
                        ...i,
                        branch_item_prices: [{
                            ...existingOverride,
                            price: newPrice,
                            is_available: newActive,
                            choice_prices: choicePrices
                        }]
                    };
                }
                return i;
            }));

            // Show success feedback
            setSaveSuccess(item.id);
            setTimeout(() => setSaveSuccess(null), 2000);

        } catch (e) {
            alert(t('prices.update_failed'));
        } finally {
            setSaving(null);
        }
    };

    // Helper to get display name based on language
    const getName = (obj: any) => {
        if (language === 'en' && obj.name_en) return obj.name_en;
        return obj.name_ar;
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">

            {/* LEFT: Branch Selector */}
            <div className="w-1/4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-bold text-gray-700 flex items-center">
                        <Store className="w-4 h-4 ltr:mr-2 rtl:ml-2 text-blue-600" /> {t('prices.select_branch')}
                    </h3>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {branches.map(branch => (
                        <button
                            key={branch.id}
                            onClick={() => handleBranchChange(branch.id)}
                            className={`w-full text-left rtl:text-right px-4 py-3 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${selectedBranch === branch.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50 text-gray-600'
                                }`}
                        >
                            <span>{branch.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT: Price Editor */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-gray-800">{t('prices.title')}</h3>
                        <p className="text-xs text-gray-500">{t('prices.subtitle')}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
                ) : menuItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        {t('prices.no_items')}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-sm text-left rtl:text-right">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3">{t('prices.item_name')}</th>
                                    <th className="px-6 py-3 text-center">{t('prices.base_price')}</th>
                                    <th className="px-6 py-3 text-center">{t('prices.branch_price')}</th>
                                    <th className="px-6 py-3 text-center">{t('prices.availability')}</th>
                                    <th className="px-6 py-3 text-center">{t('prices.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {menuItems.map(item => {
                                    // Logic: Did we find an override row?
                                    const override = item.branch_item_prices && item.branch_item_prices.length > 0
                                        ? item.branch_item_prices[0]
                                        : null;

                                    const currentPrice = override ? override.price : item.base_price;
                                    const isAvailable = override ? override.is_available : true;
                                    const branchChoicePrices = override ? override.choice_prices || {} : {};

                                    // Is this customized?
                                    const isCustom = override != null;
                                    const hasOptions = item.options && item.options.length > 0;
                                    const isExpanded = expandedItem === item.id;

                                    return (
                                        <React.Fragment key={item.id}>
                                            <tr className={`hover:bg-gray-50 transition-colors ${!isAvailable ? 'opacity-50 bg-gray-50' : ''} ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    <div className="flex items-center">
                                                        {hasOptions && (
                                                            <button
                                                                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                                                className="ltr:mr-2 rtl:ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                                                            >
                                                                {isExpanded ?
                                                                    <div className="w-4 h-4 text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg></div> :
                                                                    <div className="w-4 h-4 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></div>
                                                                }
                                                            </button>
                                                        )}
                                                        <div>
                                                            {getName(item)}
                                                            {isCustom && <span className="ltr:ml-2 rtl:mr-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{t('prices.custom')}</span>}
                                                            {!item.is_active && (
                                                                <span className="ltr:ml-2 rtl:mr-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                    <XCircle className="w-3 h-3" /> Global Hidden
                                                                </span>
                                                            )}
                                                            {hasOptions && <div className="text-[10px] text-gray-400 mt-0.5">{item.options.length} {t('menu.groups')}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-400">
                                                    {item.base_price} {t('common.currency')}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="number"
                                                            defaultValue={currentPrice}
                                                            className={`w-24 text-center border rounded p-1.5 font-bold outline-none focus:ring-2 focus:ring-blue-500 ${currentPrice !== item.base_price ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-gray-700'}`}
                                                            id={`price-${item.id}`}
                                                        />
                                                        <span className="ltr:ml-1 rtl:mr-1 text-gray-400 text-xs">{t('common.currency')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        id={`toggle-${item.id}`}
                                                        data-available={isAvailable ? "true" : "false"}
                                                        onClick={(e) => {
                                                            const btn = e.currentTarget;
                                                            const currentValue = btn.getAttribute('data-available');
                                                            const newValue = currentValue === "true" ? "false" : "true";
                                                            btn.setAttribute('data-available', newValue);
                                                            // Toggle visual
                                                            const icon = btn.querySelector('svg');
                                                            if (icon) {
                                                                icon.classList.toggle('text-green-500');
                                                                icon.classList.toggle('text-gray-300');
                                                            }
                                                        }}
                                                        className="focus:outline-none hover:scale-110 transition-transform"
                                                    >
                                                        {isAvailable
                                                            ? <CheckCircle className="w-6 h-6 text-green-500" />
                                                            : <XCircle className="w-6 h-6 text-gray-300" />
                                                        }
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => {
                                                            const priceInput = document.getElementById(`price-${item.id}`) as HTMLInputElement;
                                                            const toggleBtn = document.getElementById(`toggle-${item.id}`) as HTMLButtonElement;

                                                            handleUpdate(
                                                                item,
                                                                parseFloat(priceInput.value),
                                                                toggleBtn.getAttribute('data-available') === "true"
                                                            );
                                                        }}
                                                        disabled={saving === item.id}
                                                        className={`font-bold text-xs px-3 py-1.5 rounded transition-all ${saveSuccess === item.id
                                                            ? 'text-green-600 border border-green-200 bg-green-50'
                                                            : 'text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 hover:bg-blue-100'
                                                            } disabled:opacity-50`}
                                                    >
                                                        {saving === item.id ? (
                                                            <span className="flex items-center gap-1">
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                                {t('prices.saving')}
                                                            </span>
                                                        ) : saveSuccess === item.id ? (
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" />
                                                                {t('prices.saved') || 'تم الحفظ'}
                                                            </span>
                                                        ) : (
                                                            t('prices.save')
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {/* EXPANDED ROW FOR VARIATIONS */}
                                            {isExpanded && hasOptions && (
                                                <tr className="bg-gray-50/50">
                                                    <td colSpan={5} className="px-6 pt-0 pb-6">
                                                        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-inner mx-8">
                                                            <div className="flex items-center mb-3">
                                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('menu.variations')}</h4>
                                                                <div className="ml-2 h-px bg-gray-100 flex-1"></div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {item.options.map((group: any) => (
                                                                    <div key={group.id} className="border border-gray-100 rounded p-3">
                                                                        <div className="font-medium text-sm text-gray-800 mb-2 border-b border-gray-50 pb-1">
                                                                            {getName(group)}
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            {group.option_choices.map((choice: any) => {
                                                                                // Determine current price
                                                                                // 1. Branch specific?
                                                                                const branchPrice = branchChoicePrices[choice.id.toString()];
                                                                                // 2. Global item specific?
                                                                                const globalPrice = group.base_choice_prices?.[choice.id.toString()];

                                                                                const currentChoicePrice = branchPrice !== undefined ? branchPrice : (globalPrice || 0);
                                                                                const isOverridden = branchPrice !== undefined;

                                                                                return (
                                                                                    <div key={choice.id} className="flex justify-between items-center text-sm">
                                                                                        <span className="text-gray-600">{getName(choice)}</span>
                                                                                        <div className="flex items-center space-x-2 space-x-reverse">
                                                                                            {isOverridden && (
                                                                                                <span className="text-[10px] text-blue-600 bg-blue-50 px-1 rounded flex items-center" title="Custom branch price">
                                                                                                    Custom
                                                                                                </span>
                                                                                            )}
                                                                                            <span className="text-xs text-gray-400">
                                                                                                Global: {globalPrice || 0}
                                                                                            </span>
                                                                                            <div className="relative">
                                                                                                <input
                                                                                                    type="number"
                                                                                                    id={`price-choice-${item.id}-${choice.id}`}
                                                                                                    defaultValue={currentChoicePrice}
                                                                                                    className={`w-16 text-center border rounded py-1 px-1 text-xs font-bold focus:ring-1 focus:ring-blue-500 ${isOverridden ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200'}`}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-3 text-right">
                                                                <p className="text-[10px] text-gray-400 italic">
                                                                    {t('prices.variations_note')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchPriceManager;
