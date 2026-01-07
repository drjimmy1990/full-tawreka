import { useRef } from 'react';
import { clsx } from 'clsx';
import useTranslation from '../../hooks/useTranslation';

interface CategoryBarProps {
    activeCategory: number;
    onSelect: (id: number) => void;
    categories: any[];
}

export default function CategoryBar({ activeCategory, onSelect, categories }: CategoryBarProps) {
    const { lang } = useTranslation();
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="sticky top-16 z-30 bg-white shadow-sm border-b border-gray-100">
            <div
                ref={scrollRef}
                className="flex items-center gap-3 overflow-x-auto p-4 scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={clsx(
                                "flex flex-col items-center gap-2 min-w-[70px] shrink-0 transition-all duration-300",
                                isActive ? "opacity-100 scale-105" : "opacity-60 hover:opacity-100"
                            )}
                        >
                            <div className={clsx(
                                "w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all p-1 bg-white",
                                isActive ? "border-primary shadow-md" : "border-gray-100"
                            )}>
                                <img
                                    src={cat.image_url || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNmM2YzZjMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5IiBkeT0iLjNlbSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1nPC90ZXh0Pjwvc3ZnPg=='}
                                    alt={lang === 'ar' ? cat.name_ar : (cat.name_en || cat.name_ar)}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className={clsx(
                                "text-xs font-bold whitespace-nowrap",
                                isActive ? "text-primary" : "text-gray-500"
                            )}>
                                {lang === 'ar' ? cat.name_ar : (cat.name_en || cat.name_ar)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
