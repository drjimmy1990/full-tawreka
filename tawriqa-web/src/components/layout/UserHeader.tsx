import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../../hooks/useTranslation';
import { useSettingsStore } from '../../store';
import { useScrollTo } from '../../hooks/useScrollTo'; // <--- New Hook
import { LanguageSelector } from '../common/LanguageSelector'; // <--- New Component
import { Menu, X } from 'lucide-react';
import { Button } from '../common/Button';
import clsx from 'clsx';

interface UserHeaderProps {
    variant?: 'overlay' | 'default';
}

export default function UserHeader({ variant = 'default' }: UserHeaderProps) {
    const navigate = useNavigate();
    const { t, lang } = useTranslation();
    const { settings } = useSettingsStore();
    const { scrollTo } = useScrollTo(); // <--- Init Hook

    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isTransparent = variant === 'overlay' && !scrolled && !mobileMenuOpen;

    // Navigation Items Config
    const navItems = [
        {
            key: 'home', action: () => {
                if (window.location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    navigate('/');
                }
            }
        },
        { key: 'menu', action: () => navigate('/location?redirect=menu&mode=pickup') },
        { key: 'branches', action: () => navigate('/branches') },
        { key: 'about', action: () => navigate('/about') },
        { key: 'contact_us', action: () => scrollTo('contact') }
    ];

    return (
        <>
            <header className={clsx(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-4",
                isTransparent
                    ? "bg-transparent text-white border-b border-transparent"
                    : "bg-white/95 backdrop-blur-md text-gray-900 shadow-sm border-b border-gray-100"
            )}>
                <div className="max-w-7xl mx-auto flex justify-between items-center">

                    {/* Logo */}
                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
                        <img
                            src={settings?.brand_logo || '/assets/images/logo.avif'}
                            alt="Logo"
                            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
                        />
                        {!isTransparent && (
                            <span className="font-bold text-lg hidden lg:block text-primary">
                                {lang === 'ar' ? settings?.brand_name_ar : settings?.brand_name_en}
                            </span>
                        )}
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 font-bold text-sm">
                        {navItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={item.action}
                                className={clsx(
                                    "relative group py-2 transition-colors",
                                    isTransparent ? "hover:text-secondary" : "hover:text-primary"
                                )}
                            >
                                {t(`landing.${item.key}`)}
                                <span className={clsx(
                                    "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                                    isTransparent ? "bg-secondary" : "bg-primary"
                                )}></span>
                            </button>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <LanguageSelector variant={isTransparent ? 'dark' : 'light'} />

                        <button
                            className="md:hidden p-2 hover:bg-black/5 rounded-full transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white pt-24 px-6 animate-fade-in md:hidden flex flex-col gap-6">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => { item.action(); setMobileMenuOpen(false); }}
                            className="text-xl font-bold text-gray-800 text-start border-b border-gray-100 pb-4"
                        >
                            {t(`landing.${item.key}`)}
                        </button>
                    ))}
                    <Button onClick={() => { navigate('/location'); setMobileMenuOpen(false); }} className="w-full mt-4" size="lg">
                        {t('landing.order_now')}
                    </Button>
                </div>
            )}
        </>
    );
}
