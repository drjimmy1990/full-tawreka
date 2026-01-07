import { useEffect, useState } from 'react';
import { Phone, Clock, MapPin, Navigation } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import { api } from '../../lib/api';
import type { Branch } from '../../lib/api';

interface BranchesSectionProps {
    lightTheme?: boolean;
}

export default function BranchesSection({ lightTheme = false }: BranchesSectionProps) {
    const { t, lang } = useTranslation();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);

    // For Arabic: Map on visual LEFT, Text on visual RIGHT
    // For English: Text on visual LEFT, Map on visual RIGHT
    const isArabic = lang === 'ar';

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            const data = await api.getBranches();
            setBranches(data.filter(b => b.is_active));
        } catch (e) {
            console.error('Error loading branches:', e);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time?: string) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getBranchName = (branch: Branch) => {
        if (lang === 'ar') return (branch as any).name_ar || branch.name;
        if (lang === 'en') return (branch as any).name_en || branch.name;
        if (lang === 'ru') return (branch as any).name_ru || branch.name;
        return branch.name;
    };

    const getAddress = (branch: Branch) => {
        if (lang === 'ar') return (branch as any).address_ar;
        if (lang === 'en') return (branch as any).address_en;
        if (lang === 'ru') return (branch as any).address_ru;
        return (branch as any).address_ar;
    };

    // Theme colors
    const bgColor = lightTheme ? 'bg-[#Fdfbf7]' : 'bg-[#111]';
    const cardBg = lightTheme ? 'bg-white shadow-lg border-gray-100' : 'bg-white/5 backdrop-blur-sm border-white/10';
    const textColor = lightTheme ? 'text-gray-900' : 'text-white';
    const subTextColor = lightTheme ? 'text-gray-600' : 'text-gray-400';
    const labelColor = lightTheme ? 'text-gray-500' : 'text-gray-500';

    if (loading) {
        return (
            <section className={`py-16 ${bgColor}`}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="animate-pulse space-y-8">
                        {[1, 2].map(i => (
                            <div key={i} className={`h-64 ${lightTheme ? 'bg-gray-200' : 'bg-white/5'} rounded-3xl`}></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (branches.length === 0) {
        return (
            <section id="branches" className={`py-16 ${bgColor}`}>
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className={subTextColor}>
                        {lang === 'ar' ? 'لا توجد فروع متاحة حالياً' : 'No branches available at the moment'}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section id="branches" className={`py-12 ${bgColor}`}>
            <div className="max-w-6xl mx-auto px-6">
                {/* Branches List */}
                <div className="space-y-8">
                    {branches.map((branch) => (
                        <div
                            key={branch.id}
                            className={`rounded-2xl border overflow-hidden hover:shadow-xl transition-all ${cardBg}`}
                        >
                            {/* Use flex with explicit ordering for correct visual position */}
                            <div className="flex flex-col lg:flex-row" dir="ltr">
                                {/* Map Section - Always first in DOM, use order for visual position */}
                                {/* Arabic: order-1 (LEFT), English: order-2 (RIGHT) */}
                                <div className={`h-64 lg:h-80 lg:w-1/2 bg-gray-200 relative ${isArabic ? 'lg:order-1' : 'lg:order-2'}`}>
                                    {(branch as any).google_maps_embed ? (
                                        <iframe
                                            src={(branch as any).google_maps_embed}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title={getBranchName(branch)}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <MapPin className="w-12 h-12 opacity-30" />
                                        </div>
                                    )}
                                </div>

                                {/* Details Section */}
                                {/* Arabic: order-2 (RIGHT), English: order-1 (LEFT) */}
                                <div
                                    className={`p-6 lg:p-8 lg:w-1/2 flex flex-col justify-center space-y-5 ${isArabic ? 'lg:order-2' : 'lg:order-1'}`}
                                    dir={isArabic ? 'rtl' : 'ltr'}
                                >
                                    {/* Branch Name */}
                                    <div>
                                        <h3 className={`text-2xl font-bold mb-2 ${textColor}`}>
                                            {getBranchName(branch)}
                                        </h3>
                                        {getAddress(branch) && (
                                            <p className={`flex items-center gap-2 ${subTextColor}`}>
                                                <MapPin className="w-4 h-4 shrink-0 text-primary" />
                                                {getAddress(branch)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    {branch.phone_contact && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className={`text-xs ${labelColor} mb-0.5`}>
                                                    {t('branches.phone') || 'رقم التليفون'}
                                                </p>
                                                <a
                                                    href={`tel:${branch.phone_contact}`}
                                                    className={`text-lg font-bold ${textColor} hover:text-primary transition-colors`}
                                                    dir="ltr"
                                                >
                                                    {branch.phone_contact}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Working Hours */}
                                    {(branch.opening_time || branch.closing_time) && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-secondary" />
                                            </div>
                                            <div>
                                                <p className={`text-xs ${labelColor} mb-0.5`}>
                                                    {t('branches.hours') || 'ساعات العمل'}
                                                </p>
                                                <p className={`text-lg font-bold ${textColor}`} dir="ltr">
                                                    {formatTime(branch.opening_time)} - {formatTime(branch.closing_time)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Directions Button */}
                                    {(branch as any).google_maps_link && (
                                        <a
                                            href={(branch as any).google_maps_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-colors w-fit"
                                        >
                                            <Navigation className="w-5 h-5" />
                                            {t('branches.directions') || 'الاتجاهات'}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
