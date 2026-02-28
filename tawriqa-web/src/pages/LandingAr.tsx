import { Helmet } from 'react-helmet-async';
import { Facebook, Instagram, Phone, Mail, MessageCircle, ShoppingCart, MapPin } from 'lucide-react';
import TikTokIcon from '../components/common/TikTokIcon';
import { useSettingsStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function LandingAr() {
    const { settings, getSetting } = useSettingsStore();
    const navigate = useNavigate();

    const brandName = getSetting('brand_name_ar') || 'توريقة';
    const phone = settings?.phone_number || '';
    const whatsapp = settings?.whatsapp_number || '';
    const email = 'contact@tawriqa.com';
    const logoUrl = settings?.logo_url || '/assets/images/logo.avif';

    return (
        <>
            <Helmet>
                <title>{brandName} - تواصل معنا</title>
                <meta name="description" content={`${brandName} - تواصل معنا عبر الهاتف أو واتساب أو مواقع التواصل الاجتماعي`} />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-b from-[#111] via-[#1a1a1a] to-[#0d0d0d] font-sans flex flex-col items-center" dir="rtl">

                {/* Profile Section */}
                <div className="pt-14 pb-6 text-center w-full max-w-md mx-auto px-6">
                    <div className="relative mx-auto mb-5 w-36">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-125" />
                        <img
                            src={logoUrl}
                            alt={brandName}
                            className="relative z-10 w-36 h-auto mx-auto drop-shadow-2xl"
                        />
                    </div>
                    <h1 className="text-white text-2xl font-bold">
                        توريقة .. <span className="text-secondary">بين الطبقات.. حكايات</span>
                    </h1>
                </div>

                {/* Links Stack */}
                <div className="w-full max-w-md mx-auto px-6 pb-12 space-y-3">

                    {/* Order Now */}
                    <LinkButton
                        onClick={() => navigate('/location?redirect=menu&mode=delivery')}
                        icon={<ShoppingCart className="w-5 h-5" />}
                        label="🛒  اطلب أونلاين"
                        variant="primary"
                    />

                    {/* Branches */}
                    <LinkButton
                        onClick={() => navigate('/branches')}
                        icon={<MapPin className="w-5 h-5" />}
                        label="📍  فروعنا"
                    />

                    {/* WhatsApp */}
                    {whatsapp && (
                        <LinkButton
                            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                            icon={<MessageCircle className="w-5 h-5" />}
                            label="💬  واتساب"
                            hoverColor="hover:border-green-500/50 hover:bg-green-500/10"
                        />
                    )}

                    {/* Call */}
                    {phone && (
                        <LinkButton
                            href={`tel:${phone}`}
                            icon={<Phone className="w-5 h-5" />}
                            label={`📞  اتصل بينا`}
                        />
                    )}

                    {/* Email */}
                    <LinkButton
                        href={`mailto:${email}`}
                        icon={<Mail className="w-5 h-5" />}
                        label={`✉️  ${email}`}
                    />

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-2">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">تابعنا</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Social Media Row */}
                    <div className="flex justify-center gap-4">
                        {settings?.facebook_link && (
                            <a
                                href={settings.facebook_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-14 h-14 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:scale-110 transition-all"
                            >
                                <Facebook className="w-6 h-6" />
                            </a>
                        )}
                        {settings?.instagram_link && (
                            <a
                                href={settings.instagram_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-14 h-14 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center text-gray-400 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-pink-500 hover:scale-110 transition-all"
                            >
                                <Instagram className="w-6 h-6" />
                            </a>
                        )}
                        {settings?.tiktok_link && (
                            <a
                                href={settings.tiktok_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-14 h-14 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white hover:border-white/30 hover:scale-110 transition-all"
                            >
                                <TikTokIcon className="w-6 h-6" />
                            </a>
                        )}
                    </div>



                </div>

                {/* Footer */}
                <div className="mt-auto pb-8 text-center">
                    <p className="text-gray-600 text-xs">© 2026 {brandName}</p>
                </div>
            </div>
        </>
    );
}

/* ========== Reusable Link Button ========== */
function LinkButton({
    href,
    onClick,
    icon,
    label,
    variant,
    hoverColor,
    small,
}: {
    href?: string;
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    variant?: 'primary';
    hoverColor?: string;
    small?: boolean;
}) {
    const base = small
        ? 'w-full flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-medium transition-all'
        : 'w-full flex items-center gap-3 px-5 py-4 rounded-2xl border text-base font-bold transition-all';

    const style = variant === 'primary'
        ? 'bg-primary text-white border-primary/50 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5'
        : `bg-white/5 backdrop-blur-sm text-white border-white/10 ${hoverColor || 'hover:border-white/30 hover:bg-white/10'} hover:-translate-y-0.5`;

    if (href) {
        return (
            <a
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`${base} ${style}`}
            >
                <span className="opacity-70">{icon}</span>
                <span className="flex-1 text-center">{label}</span>
            </a>
        );
    }

    return (
        <button onClick={onClick} className={`${base} ${style}`}>
            <span className="opacity-70">{icon}</span>
            <span className="flex-1 text-center">{label}</span>
        </button>
    );
}
