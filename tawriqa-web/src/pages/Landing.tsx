import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import UserHeader from '../components/layout/UserHeader';
import Footer from '../components/layout/Footer';
import ContactForm from '../components/common/ContactForm';
import { Facebook, Instagram, Phone, MapPin, UtensilsCrossed, MessageSquare } from 'lucide-react';
import TikTokIcon from '../components/common/TikTokIcon';
import { Button } from '../components/common/Button';
import useTranslation from '../hooks/useTranslation';
import { useSettingsStore } from '../store';
import { useScrollTo } from '../hooks/useScrollTo';

export default function Landing() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings } = useSettingsStore();


    // Placeholders
    // Placeholders
    const heroBg = '/assets/images/landing-hero.avif';
    const storyImage = '/assets/images/about-story.avif';

    // Feature Images
    const feat1 = '/assets/images/feature-1.avif';
    const feat2 = '/assets/images/feature-2.avif';
    const feat3 = '/assets/images/feature-3.avif';

    const { scrollTo } = useScrollTo();

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans">
            {/* SEO Helmet */}
            <Helmet>
                <title>{settings?.brand_name_ar || 'توريقة'} - {settings?.page_title_home_ar || 'الرئيسية'}</title>
                <meta name="description" content={settings?.meta_description_ar || settings?.hero_subtitle_ar} />
                {settings?.og_image_url && <meta property="og:image" content={settings.og_image_url} />}
            </Helmet>

            {/* --- Navbar (Simple Overlay) --- */}
            {/* --- Navbar (Reusable) --- */}
            <UserHeader variant="overlay" />

            {/* --- Hero Section --- */}
            <section className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden group">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[20s] ease-linear group-hover:scale-110"
                    style={{ backgroundImage: `url(${heroBg})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>
                </div>

                <div className="relative z-10 px-4 max-w-5xl mx-auto flex flex-col items-center animate-in fade-in zoom-in duration-1000 delay-200">
                    <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight drop-shadow-2xl">
                        بين الطبقات حكايات
                    </h1>
                    <p className="text-xl md:text-3xl mb-12 text-gray-100 max-w-3xl font-light leading-relaxed drop-shadow-md">
                        في توريقة، هتاكل الفطير المصري اللي بتحبه، اللي عمرك ما أكلت زيه في مكان تاني، بس بطريقة جديدة ومبتكرة!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <Button
                            size="lg"
                            onClick={() => navigate('/location')}
                            className="min-w-[200px] shadow-[0_0_20px_rgba(61,90,52,0.6)]"
                            rightIcon={<MapPin className="w-5 h-5" />}
                        >
                            {t('landing.order_now') || 'اطلب دلوقتى'}
                        </Button>

                        <Button
                            variant="outline" // Used outline but with white text handling manually below
                            size="lg"
                            onClick={() => navigate('/location?redirect=menu')}
                            className="min-w-[200px] border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm bg-white/5"
                            rightIcon={<UtensilsCrossed className="w-5 h-5" />}
                        >
                            {t('landing.menu') || 'المنيو'}
                        </Button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                {/* Scroll Indicator */}
                {/* Scroll Indicator */}
                <div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer text-white/80 hover:text-white transition-colors z-20"
                    onClick={() => scrollTo('story')}
                >
                    <div className="w-8 h-12 border-2 border-white rounded-full flex justify-center p-1">
                        <div className="w-1 h-3 bg-white rounded-full animate-scroll"></div>
                    </div>
                </div>
            </section>

            {/* --- REDESIGNED: Story Section (About) --- */}
            <section id="story" className="py-24 px-4 relative overflow-hidden bg-[#FDFBF7]">
                {/* Decorative Background Blobs */}
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10"></div>

                <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-16">
                    {/* Text Content */}
                    <div className="flex-1 space-y-8 text-center md:text-start">
                        <div className="inline-flex items-center gap-3 bg-secondary/10 px-4 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-secondary"></span>
                            <span className="text-secondary font-bold text-xs uppercase tracking-widest">{t('landing.about')}</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.2]">
                            {t('landing.story_title')}
                        </h2>

                        <p className="text-lg text-gray-600 leading-loose max-w-xl mx-auto md:mx-0">
                            {t('landing.story_body')}
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="p-6 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#eaddd0]">
                                <h4 className="font-bold text-3xl text-primary mb-1">100%</h4>
                                <p className="text-sm text-gray-500 font-bold">Natural Ingredients</p>
                            </div>
                            <div className="p-6 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#eaddd0]">
                                <h4 className="font-bold text-3xl text-secondary mb-1">+50</h4>
                                <p className="text-sm text-gray-500 font-bold">Unique Flavors</p>
                            </div>
                        </div>
                    </div>

                    {/* Image Composition */}
                    <div className="flex-1 w-full relative">
                        <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white transform rotate-2 hover:rotate-0 transition-transform duration-700">
                            <img src={storyImage} alt="About Us" className="w-full h-[550px] object-cover" />
                        </div>
                        {/* Decorative Frame */}
                        <div className="absolute top-10 -right-4 md:-right-10 w-full h-full border-2 border-secondary rounded-[3rem] -z-10 rotate-2"></div>
                    </div>
                </div>
            </section>

            {/* --- Features Section --- */}
            <section id="features" className="py-24 bg-[#111] text-white text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-700 via-transparent to-transparent"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-20">{t('landing.features_title')}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {/* Card 1 */}
                        <div className="bg-[#1A1A1A] rounded-[2rem] overflow-hidden group hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition-all duration-500 border border-white/5">
                            <div className="h-64 overflow-hidden relative">
                                <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                                <img src={feat1} alt="Feature 1" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="p-10 text-start">
                                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#415A3E] transition-colors">{t('landing.feature_1_title')}</h3>
                                <p className="text-gray-400 leading-relaxed">{t('landing.feature_1_desc')}</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[#1A1A1A] rounded-[2rem] overflow-hidden group hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(61,90,52,0.2)] transition-all duration-500 transform scale-100 md:scale-105 border-2 border-[#3D5A34] relative z-20">
                            <div className="h-72 overflow-hidden relative">
                                <div className="absolute top-4 right-4 bg-[#3D5A34] text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-lg">مميز</div>
                                <img src={feat2} alt="Feature 2" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="p-10 text-start bg-gradient-to-b from-[#3D5A34]/10 to-transparent">
                                <h3 className="text-2xl font-bold mb-4 text-[#3D5A34]">{t('landing.feature_2_title')}</h3>
                                <p className="text-gray-300 leading-relaxed">{t('landing.feature_2_desc')}</p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[#1A1A1A] rounded-[2rem] overflow-hidden group hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition-all duration-500 border border-white/5">
                            <div className="h-64 overflow-hidden relative">
                                <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                                <img src={feat3} alt="Feature 3" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="p-10 text-start">
                                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#415A3E] transition-colors">{t('landing.feature_3_title')}</h3>
                                <p className="text-gray-400 leading-relaxed">{t('landing.feature_3_desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- REDESIGNED: Contact Section --- */}
            <section id="contact" className="py-24 bg-[#111] text-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-secondary font-bold uppercase tracking-widest text-xs">{t('landing.contact_us')}</span>
                        <h2 className="text-4xl md:text-5xl font-bold">{t('landing.contact_title')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card 1: Contact Info */}
                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all hover:-translate-y-2 group">
                            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <Phone className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">{t('contact.call_title')}</h3>
                            <p className="text-gray-400 text-sm mb-6">{t('contact.call_subtitle')}</p>
                            <a href="tel:+20248832036" className="text-2xl font-bold text-white hover:text-secondary transition-colors">+20 24 883 2036</a>
                        </div>

                        {/* Card 2: Social Media */}
                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:border-secondary/50 transition-all hover:-translate-y-2 group">
                            <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                                <Instagram className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">{t('contact.social_title')}</h3>
                            <p className="text-gray-400 text-sm mb-6">{t('contact.social_subtitle')}</p>
                            <div className="flex gap-4">
                                <a href={settings?.facebook_link || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Facebook className="w-5 h-5" /></a>
                                <a href={settings?.instagram_link || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Instagram className="w-5 h-5" /></a>
                                <a href={settings?.tiktok_link || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"><TikTokIcon className="w-5 h-5" /></a>
                            </div>
                        </div>

                        {/* Card 3: Contact Form (spans full width on mobile, half on desktop) */}
                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 md:col-span-2">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                                    <MessageSquare className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">{t('contact.form_title')}</h3>
                                    <p className="text-gray-400 text-sm">{t('contact.form_subtitle')}</p>
                                </div>
                            </div>
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <Footer />

        </div>
    );
}
