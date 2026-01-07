import { Facebook, Instagram, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store';
import useTranslation from '../../hooks/useTranslation';
import TikTokIcon from '../common/TikTokIcon';

export default function Footer() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings, getLocalizedSetting } = useSettingsStore();

    const brandName = getLocalizedSetting('brand_name') || 'Tawriqa';
    const tagline = getLocalizedSetting('footer_tagline') || getLocalizedSetting('hero_title');
    const copyright = getLocalizedSetting('footer_copyright') || `© 2026 ${brandName}`;
    const address = getLocalizedSetting('address');
    const workingHours = getLocalizedSetting('working_hours');

    // Quick links
    const quickLinks = [
        { label: t('landing.home') || 'الرئيسية', action: () => navigate('/') },
        { label: t('landing.menu') || 'المنيو', action: () => navigate('/location?redirect=menu') },
        { label: t('landing.about') || 'عن توريقة', action: () => navigate('/#story') },
        { label: t('landing.contact_us') || 'اتصل بنا', action: () => navigate('/#contact') },
    ];

    // Legal links
    const legalLinks = [
        { label: t('footer.terms') || 'الشروط والأحكام', url: settings?.terms_url },
        { label: t('footer.privacy') || 'سياسة الخصوصية', url: settings?.privacy_url },
        { label: t('footer.about') || 'عن توريقة', url: settings?.about_url },
    ].filter(link => link.url);

    return (
        <footer className="bg-[#111] text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

                    {/* Column 1: Brand */}
                    <div className="space-y-4">
                        <img
                            src={settings?.logo_url || '/assets/images/logo.avif'}
                            alt={brandName}
                            className="h-14 w-auto object-contain opacity-90"
                        />
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {tagline}
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-white">
                            {t('footer.quick_links') || 'روابط سريعة'}
                        </h4>
                        <ul className="space-y-2">
                            {quickLinks.map((link, i) => (
                                <li key={i}>
                                    <button
                                        onClick={link.action}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                            {legalLinks.map((link, i) => (
                                <li key={`legal-${i}`}>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-white">
                            {t('footer.contact') || 'تواصل معنا'}
                        </h4>
                        <ul className="space-y-3">
                            {settings?.phone_number && (
                                <li className="flex items-center gap-3 text-gray-400">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <a href={`tel:${settings.phone_number}`} className="text-sm hover:text-white transition-colors">
                                        {settings.phone_number}
                                    </a>
                                </li>
                            )}
                            {settings?.email && (
                                <li className="flex items-center gap-3 text-gray-400">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <a href={`mailto:${settings.email}`} className="text-sm hover:text-white transition-colors">
                                        {settings.email}
                                    </a>
                                </li>
                            )}
                            {address && (
                                <li className="flex items-start gap-3 text-gray-400">
                                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm">{address}</span>
                                </li>
                            )}
                            {workingHours && (
                                <li className="flex items-center gap-3 text-gray-400">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{workingHours}</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Column 4: Social Media */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-white">
                            {t('footer.follow_us') || 'تابعنا'}
                        </h4>
                        <div className="flex gap-3">
                            <a
                                href={settings?.facebook_link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href={settings?.instagram_link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href={settings?.tiktok_link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all"
                            >
                                <TikTokIcon className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 pt-6">
                    <p className="text-center text-gray-500 text-sm">
                        {copyright}
                    </p>
                </div>
            </div>
        </footer>
    );
}
