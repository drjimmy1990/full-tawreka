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
    };

    const handleUpdate = async (item: any, newPrice: number, newActive: boolean) => {
        if (!selectedBranch) return;
        setSaving(item.id);
        try {
            await api.updateBranchPrice(selectedBranch, item.id, newPrice, newActive);

            // Update local state to reflect changes instantly
            setMenuItems(prev => prev.map(i => {
                if (i.id === item.id) {
                    return {
                        ...i,
                        branch_item_prices: [{ price: newPrice, is_available: newActive }]
                    };
                }
                return i;
            }));

        } catch (e) {
            alert(t('prices.update_failed'));
        } finally {
            setSaving(null);
        }
    };

    // Helper to get display name based on language
    const getName = (item: any) => {
        if (language === 'en' && item.name_en) return item.name_en;
        return item.name_ar;
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
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
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

                                    // Is this customized?
                                    const isCustom = override != null;

                                    return (
                                        <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!isAvailable ? 'opacity-50 bg-gray-50' : ''}`}>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {getName(item)}
                                                {isCustom && <span className="ltr:ml-2 rtl:mr-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{t('prices.custom')}</span>}
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
                                                    className="text-blue-600 hover:text-blue-800 font-bold text-xs border border-blue-200 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors"
                                                >
                                                    {saving === item.id ? t('prices.saving') : t('prices.save')}
                                                </button>
                                            </td>
                                        </tr>
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
