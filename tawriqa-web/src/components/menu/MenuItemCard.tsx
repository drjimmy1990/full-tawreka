import { Plus } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

interface MenuItemProps {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    hasOptions?: boolean;
    minPrice?: number;
    onAdd: () => void;
    isAvailable?: boolean; // New Prop
}

export default function MenuItemCard({ name, description, price, image, onAdd, hasOptions, minPrice, isAvailable }: MenuItemProps) {
    const { t } = useTranslation();

    // Default to true if undefined
    const available = isAvailable !== false;

    return (
        <div className={`group bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition-all relative overflow-hidden ${available ? 'hover:shadow-md hover:border-primary/20' : 'opacity-60 grayscale'}`}>

            {/* Out of Stock Overlay */}
            {!available && (
                <div className="absolute inset-0 z-20 bg-gray-50/50 flex items-center justify-center">
                    <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {t('menu.out_of_stock') || 'Out of Stock'}
                    </span>
                </div>
            )}

            {/* Image Container */}
            <div className="w-28 h-28 bg-gray-100 rounded-xl shrink-0 overflow-hidden relative">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-primary transition-colors">{name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{description}</p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-lg text-primary">
                        {hasOptions && <span className="text-xs font-normal opacity-70 ltr:mr-1 rtl:ml-1">{t('menu.from')}</span>}
                        {minPrice || price} <span className="text-xs font-normal text-gray-400">{t('common.currency')}</span>
                    </span>

                    <button
                        onClick={available ? onAdd : undefined}
                        disabled={!available}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all ${available
                                ? 'bg-gray-50 text-primary hover:bg-primary hover:text-white hover:scale-110 active:scale-95'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
