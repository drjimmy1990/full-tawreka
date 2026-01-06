import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import { clsx } from 'clsx';

export const LanguageSelector = ({ variant = 'light' }: { variant?: 'light' | 'dark' }) => {
    const { lang, setLanguage, supportedLanguages } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Beautiful Display Names
    const langNames: Record<string, string> = {
        ar: 'العربية',
        en: 'English',
        ru: 'Русский'
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Style logic based on Header variant
    const isLight = variant === 'light'; // White background header

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all border select-none",
                    isLight
                        ? "border-gray-200 text-gray-700 hover:border-primary hover:text-primary bg-gray-50"
                        : "border-white/30 text-white hover:bg-white/10 backdrop-blur-md"
                )}
            >
                <Globe className="w-4 h-4" />
                <span className="uppercase tracking-wider">{lang}</span>
                <ChevronDown className={clsx("w-3 h-3 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            <div className={clsx(
                "absolute top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 transition-all duration-200 origin-top-right",
                isOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible",
                lang === 'ar' ? "left-0" : "right-0" // Position based on current direction
            )}>
                {supportedLanguages.map((l) => (
                    <button
                        key={l}
                        onClick={() => {
                            setLanguage(l);
                            setIsOpen(false);
                        }}
                        className={clsx(
                            "w-full text-start px-4 py-3 text-sm font-bold flex items-center justify-between transition-colors",
                            lang === l
                                ? "text-primary bg-primary/5"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <span>{langNames[l] || l.toUpperCase()}</span>
                        {lang === l && <Check className="w-4 h-4" />}
                    </button>
                ))}
            </div>
        </div>
    );
};
