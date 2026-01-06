import { Plus } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

interface MenuItemProps {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    onAdd: () => void;
}

export default function MenuItemCard({ name, description, price, image, onAdd }: MenuItemProps) {
    const { t } = useTranslation();

    return (
        <div className="group bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md hover:border-primary/20">
            {/* Image Container */}
            <div className="w-28 h-28 bg-gray-100 rounded-xl shrink-0 overflow-hidden relative">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Optional: Add badge or overlay here if needed */}
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-primary transition-colors">{name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{description}</p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-lg text-primary">{price} <span className="text-xs font-normal text-gray-400">{t('common.currency')}</span></span>

                    <button
                        onClick={onAdd}
                        className="bg-gray-50 w-10 h-10 rounded-full flex items-center justify-center text-primary font-bold shadow-sm hover:bg-primary hover:text-white hover:scale-110 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
