import { useEffect, useState } from 'react';
import { Phone, Clock, MapPin, Navigation } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import { api } from '../../lib/api';
import type { Branch } from '../../lib/api';

export default function BranchesSection() {
    const { t, lang } = useTranslation();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            const data = await api.getBranches();
            // Filter only active branches
            setBranches(data.filter(b => b.is_active));
        } catch (e) {
            console.error('Error loading branches:', e);
        } finally {
            setLoading(false);
        }
    };

    // Format time from HH:MM:SS to readable format
    const formatTime = (time?: string) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Get localized name
    const getBranchName = (branch: Branch) => {
        if (lang === 'ar') return (branch as any).name_ar || branch.name;
        if (lang === 'en') return (branch as any).name_en || branch.name;
        return branch.name;
    };

    // Get localized address
    const getAddress = (branch: Branch) => {
        if (lang === 'ar') return (branch as any).address_ar;
        if (lang === 'en') return (branch as any).address_en;
        return (branch as any).address_ar;
    };

    if (loading) {
        return (
            <section className="py-24 bg-[#111]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="animate-pulse space-y-8">
                        {[1, 2].map(i => (
                            <div key={i} className="h-64 bg-white/5 rounded-3xl"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (branches.length === 0) return null;

    return (
        <section id="branches" className="py-24 bg-[#111] text-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <span className="text-secondary font-bold uppercase tracking-widest text-xs">
                        {t('landing.branches_subtitle') || 'زورنا في أي فرع'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold">
                        {t('landing.branches_title') || 'فروعنا'}
                    </h2>
                </div>

                {/* Branches List */}
                <div className="space-y-8">
                    {branches.map((branch) => (
                        <div
                            key={branch.id}
                            className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden hover:border-primary/50 transition-all"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                {/* Map Section */}
                                <div className="h-64 lg:h-80 bg-gray-800 relative">
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
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                            <MapPin className="w-12 h-12 opacity-30" />
                                        </div>
                                    )}
                                </div>

                                {/* Details Section */}
                                <div className="p-8 flex flex-col justify-center space-y-6">
                                    {/* Branch Name */}
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {getBranchName(branch)}
                                        </h3>
                                        {getAddress(branch) && (
                                            <p className="text-gray-400 flex items-start gap-2">
                                                <MapPin className="w-4 h-4 mt-1 shrink-0 text-primary" />
                                                {getAddress(branch)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    {branch.phone_contact && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">
                                                    {t('branches.phone') || 'رقم التليفون'}
                                                </p>
                                                <a
                                                    href={`tel:${branch.phone_contact}`}
                                                    className="text-lg font-bold text-white hover:text-primary transition-colors"
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
                                            <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-secondary" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">
                                                    {t('branches.hours') || 'ساعات العمل'}
                                                </p>
                                                <p className="text-lg font-bold text-white" dir="ltr">
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
