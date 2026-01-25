import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store';
import { Button } from '../common/Button';
import useTranslation from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onEditItem?: (item: any) => void;
}

export default function CartDrawer({ isOpen, onClose, onEditItem }: CartDrawerProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { items, updateQuantity, removeItem, getTotal } = useCartStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-up md:animate-in md:slide-in-from-right duration-300">

                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-lg text-gray-800">{t('cart.title')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p>{t('cart.empty')}</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm cursor-pointer hover:border-primary transition-colors group"
                                onClick={() => onEditItem && onEditItem(item)}
                            >
                                {/* Quantity Controls */}
                                <div className="flex flex-col justify-between items-center bg-gray-50 rounded-lg w-8 py-1">
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }} className="p-1 hover:text-primary"><Plus className="w-3 h-3" /></button>
                                    <span className="text-xs font-bold">{item.quantity}</span>
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }} className="p-1 hover:text-red-500"><Minus className="w-3 h-3" /></button>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-sm text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                                        <span className="font-bold text-sm text-primary">{(item.totalPrice * item.quantity).toFixed(0)}</span>
                                    </div>

                                    {/* Options Display */}
                                    <div className="text-xs text-gray-500 space-y-0.5">
                                        {item.selectedOptions?.map((opt, i) => (
                                            <span key={i} className="flex justify-between">
                                                <span>• {opt.name}</span>
                                                {opt.price > 0 && <span className="text-gray-400">+{opt.price}</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} className="self-center text-red-500 bg-red-50 hover:bg-red-100 transition-colors p-2 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4">
                        <div className="flex justify-between font-bold text-lg text-gray-800">
                            <span>{t('cart.total')}</span>
                            <span>{getTotal().toFixed(0)} {t('common.currency')}</span>
                        </div>
                        <Button
                            className="w-full py-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 mb-3"
                            onClick={onClose}
                        >
                            {t('common.back_to_menu') || 'Back to Menu'}
                        </Button>
                        <Button className="w-full py-4" onClick={() => navigate('/checkout')}>
                            {t('cart.checkout')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
