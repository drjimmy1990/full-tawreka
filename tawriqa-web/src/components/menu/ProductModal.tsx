import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '../common/Button';
import useTranslation from '../../hooks/useTranslation';
import { useCartStore } from '../../store';
import clsx from 'clsx';
import type { MenuItem, MenuOptionGroup, MenuOptionChoice } from '../../types';

interface ProductModalProps {
    item: MenuItem;
    onClose: () => void;
    initialSelections?: Record<number, number[]>;
    initialQuantity?: number;
    initialNotes?: string;
    editingCartItemId?: string;
    onUpdate?: (oldId: string, newItem: any) => void;
}

export default function ProductModal({ item, onClose, initialSelections, initialQuantity, initialNotes, editingCartItemId, onUpdate }: ProductModalProps) {
    const { t, lang } = useTranslation();
    const { addToCart } = useCartStore();

    // Helper: Get choices from either .choices or .option_choices (API returns option_choices)
    const getChoices = (group: any) => group.choices || group.option_choices || [];

    // Form State
    const [quantity, setQuantity] = useState(initialQuantity || 1);
    const [notes, setNotes] = useState(initialNotes || '');
    const [selections, setSelections] = useState<Record<number, number[]>>(() => {
        if (initialSelections) return initialSelections;

        // Auto-select first choice for price replacement (single-select) groups
        const initial: Record<number, number[]> = {};
        item.options?.forEach(group => {
            const choices = group.choices || group.option_choices || [];
            if (group.is_price_replacement && group.max_selection === 1 && choices.length > 0) {
                initial[group.id] = [choices[0].id];
            }
        });
        return initial;
    });

    // Calculate Dynamic Price
    const calculateTotal = () => {
        let replacementPriceTotal = 0;
        let hasReplacementPrice = false;
        let modifiersTotal = 0;

        // Process options
        item.options?.forEach((group: MenuOptionGroup) => {
            const selectedIds = selections[group.id] || [];
            const choices = group.choices || group.option_choices || [];
            selectedIds.forEach(id => {
                const choice = choices.find((c: MenuOptionChoice) => c.id === id);
                if (choice) {
                    if (group.is_price_replacement) {
                        hasReplacementPrice = true;
                        replacementPriceTotal += choice.price_modifier;
                    } else {
                        modifiersTotal += choice.price_modifier;
                    }
                }
            });
        });

        let total = 0;
        if (hasReplacementPrice) {
            total = replacementPriceTotal + modifiersTotal;
        } else {
            total = (item.current_price || item.base_price) + modifiersTotal;
        }

        return total * quantity;
    };

    const handleOptionToggle = (groupId: number, choiceId: number, maxSelection: number) => {
        setSelections(prev => {
            const current = prev[groupId] || [];

            if (maxSelection === 1) {
                return { ...prev, [groupId]: [choiceId] };
            }

            if (current.includes(choiceId)) {
                return { ...prev, [groupId]: current.filter(id => id !== choiceId) };
            } else {
                if (current.length < maxSelection || maxSelection === 0) {
                    return { ...prev, [groupId]: [...current, choiceId] };
                }
                return prev;
            }
        });
    };

    const handleAddToCart = () => {
        // Validation: Check required groups
        const missingRequired = item.options?.filter((g: MenuOptionGroup) =>
            g.min_selection > 0 && (!selections[g.id] || selections[g.id].length < g.min_selection)
        );
        if (missingRequired && missingRequired.length > 0) {
            alert(lang === 'ar' ? 'يرجى اختيار الخيارات المطلوبة' : 'Please select required options');
            return;
        }

        // Build selected options array for cart
        const selectedOptionsList: any[] = [];
        Object.keys(selections).forEach(gId => {
            const groupId = parseInt(gId);
            const group = item.options?.find((g: MenuOptionGroup) => g.id === groupId);
            const choices = group?.choices || group?.option_choices || [];
            selections[groupId].forEach(cId => {
                const choice = choices.find((c: MenuOptionChoice) => c.id === cId);
                if (choice) {
                    selectedOptionsList.push({
                        groupId,
                        choiceId: cId,
                        name: lang === 'ar' ? choice.name_ar : choice.name_en,
                        price: choice.price_modifier
                    });
                }
            });
        });

        if (editingCartItemId && onUpdate) {
            onUpdate(editingCartItemId, {
                menuItemId: item.id,
                name: lang === 'ar' ? item.name_ar : (item.name_en || item.name_ar),
                basePrice: item.current_price || item.base_price,
                quantity,
                notes,
                totalPrice: calculateTotal() / quantity,
                selectedOptions: selectedOptionsList,
                image: item.image_url
            });
        } else {
            addToCart({
                menuItemId: item.id,
                name: lang === 'ar' ? item.name_ar : (item.name_en || item.name_ar),
                basePrice: item.current_price || item.base_price,
                quantity,
                notes,
                totalPrice: calculateTotal() / quantity,
                selectedOptions: selectedOptionsList,
                image: item.image_url
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">

                {/* Header Image */}
                <div className="relative h-48 md:h-56 bg-gray-100 shrink-0">
                    <img
                        src={item.image_url || 'https://via.placeholder.com/400'}
                        className="w-full h-full object-cover"
                        alt={item.name_en}
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-gray-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {lang === 'ar' ? item.name_ar : item.name_en}
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            {lang === 'ar' ? item.description_ar : item.description_en}
                        </p>
                    </div>

                    {/* Option Groups */}
                    <div className="space-y-6">
                        {item.options?.map((group: MenuOptionGroup) => (
                            <div key={group.id}>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-gray-800">
                                        {lang === 'ar' ? group.name_ar : group.name_en}
                                    </h3>
                                    {group.min_selection > 0 && (
                                        <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-bold">
                                            {lang === 'ar' ? 'مطلوب' : 'Required'}
                                        </span>
                                    )}
                                    {group.max_selection > 1 && (
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${(group.max_selection - (selections[group.id]?.length || 0)) <= 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {lang === 'ar'
                                                ? `متبقي: ${Math.max(0, group.max_selection - (selections[group.id]?.length || 0))}`
                                                : `Remaining: ${Math.max(0, group.max_selection - (selections[group.id]?.length || 0))}`}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {getChoices(group)
                                        .filter((choice: MenuOptionChoice) => !(group.is_price_replacement && choice.price_modifier === 0))
                                        .map((choice: MenuOptionChoice) => {
                                            const currentGroupSelections = selections[group.id] || [];
                                            const qty = currentGroupSelections.filter(id => id === choice.id).length;
                                            const isSelected = qty > 0;
                                            const isMulti = group.max_selection > 1;
                                            const totalSelected = currentGroupSelections.length;

                                            if (isMulti) {
                                                // MULTI-SELECT COUNTER UI
                                                return (
                                                    <div key={choice.id} className={clsx(
                                                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                                                        isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100"
                                                    )}>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-medium text-gray-700">
                                                                {lang === 'ar' ? choice.name_ar : choice.name_en}
                                                            </span>
                                                            <span className="text-sm text-gray-500 font-bold">
                                                                {group.is_price_replacement ? '' : '+'}{choice.price_modifier} {lang === 'ar' ? 'ج.م' : 'EGP'}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent bubble
                                                                    if (qty > 0) {
                                                                        setSelections(prev => {
                                                                            const current = prev[group.id] || [];
                                                                            const idx = current.indexOf(choice.id);
                                                                            if (idx > -1) {
                                                                                const newArr = [...current];
                                                                                newArr.splice(idx, 1);
                                                                                return { ...prev, [group.id]: newArr };
                                                                            }
                                                                            return prev;
                                                                        });
                                                                    }
                                                                }}
                                                                disabled={qty === 0}
                                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <Minus className="w-4 h-4 text-gray-600" />
                                                            </button>
                                                            <span className="w-6 text-center font-bold text-gray-800">{qty}</span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (totalSelected < group.max_selection || group.max_selection === 0) {
                                                                        setSelections(prev => ({
                                                                            ...prev,
                                                                            [group.id]: [...(prev[group.id] || []), choice.id]
                                                                        }));
                                                                    }
                                                                }}
                                                                disabled={(group.max_selection > 0 && totalSelected >= group.max_selection)}
                                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <Plus className="w-4 h-4 text-blue-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                // SINGLE SELECT RADIO UI (Existing Logic)
                                                return (
                                                    <label
                                                        key={choice.id}
                                                        className={clsx(
                                                            "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                                                            isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100 hover:border-gray-200"
                                                        )}
                                                        onClick={() => handleOptionToggle(group.id, choice.id, group.max_selection)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={clsx(
                                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                                isSelected ? "border-primary bg-primary" : "border-gray-300"
                                                            )}>
                                                                {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                            </div>
                                                            <span className={clsx("font-medium", isSelected ? "text-primary" : "text-gray-700")}>
                                                                {lang === 'ar' ? choice.name_ar : choice.name_en}
                                                            </span>
                                                        </div>
                                                        <span className={clsx("font-bold", isSelected ? "text-primary" : "text-gray-500")}>
                                                            {group.is_price_replacement ? '' : '+'}{choice.price_modifier} {lang === 'ar' ? 'ج.م' : 'EGP'}
                                                        </span>
                                                    </label>
                                                );
                                            }
                                        })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Notes */}
                    <div className="mt-6">
                        <label className="block font-bold text-gray-800 mb-2">
                            {t('menu.special_instructions')}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                            rows={2}
                            placeholder={lang === 'ar' ? 'أي ملاحظات خاصة؟' : 'Any special requests?'}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        {/* Quantity */}
                        <div className="flex items-center gap-3 bg-white rounded-xl border px-2">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="p-2 text-gray-500 hover:text-primary"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="p-2 text-gray-500 hover:text-primary"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Total Price */}
                        <div className="text-end">
                            <div className="text-xs text-gray-400">{t('menu.total')}</div>
                            <div className="text-2xl font-bold text-primary">
                                {calculateTotal().toFixed(2)} <span className="text-sm">{lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleAddToCart} className="w-full py-4 gap-2">
                        {editingCartItemId ? (
                            <>
                                <ShoppingBag className="w-5 h-5" />
                                {lang === 'ar' ? 'تحديث الطلب' : 'Update Order'}
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="w-5 h-5" />
                                {t('menu.add_to_cart')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
