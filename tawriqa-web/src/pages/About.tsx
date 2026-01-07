import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import UserHeader from '../components/layout/UserHeader';
import Footer from '../components/layout/Footer';
import useTranslation from '../hooks/useTranslation';
import { useSettingsStore } from '../store';
import { api } from '../lib/api';

interface GalleryImage {
    id: number;
    image_url: string;
    alt_text?: string;
    sort_order: number;
}

export default function About() {
    const navigate = useNavigate();
    const { t, lang } = useTranslation();
    const { getLocalizedSetting, getSetting } = useSettingsStore();
    const [gallery, setGallery] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);

    const brandName = getLocalizedSetting('brand_name') || 'Tawriqa';

    useEffect(() => {
        loadGallery();
    }, []);

    const loadGallery = async () => {
        try {
            const data = await api.getAboutGallery();
            setGallery(data || []);
        } catch (e) {
            console.error('Error loading gallery:', e);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get setting based on language
    const getAboutSetting = (base: string) => {
        if (lang === 'ar') return getSetting(`${base}_ar`) || '';
        if (lang === 'en') return getSetting(`${base}_en`) || '';
        return getSetting(`${base}_other`) || getSetting(`${base}_ar`) || '';
    };

    return (
        <>
            <Helmet>
                <title>{t('header.about') || 'من نحن'} | {brandName}</title>
            </Helmet>

            <div className="min-h-screen bg-[#Fdfbf7]">
                <UserHeader />

                {/* Hero Section */}
                <section className="pt-24 pb-16 bg-[#Fdfbf7]">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Image */}
                            <div className="order-2 lg:order-1">
                                {getSetting('about_hero_image') ? (
                                    <img
                                        src={getSetting('about_hero_image')}
                                        alt={brandName}
                                        className="w-full rounded-2xl shadow-xl"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gray-200 rounded-2xl flex items-center justify-center">
                                        <span className="text-gray-400">Hero Image</span>
                                    </div>
                                )}
                            </div>

                            {/* Text */}
                            <div className="order-1 lg:order-2 text-right">
                                <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                                    {brandName}
                                </h1>
                                <h2 className="text-2xl text-secondary font-bold mb-6">
                                    {getLocalizedSetting('hero_title') || 'بين الطبقات.. حكايات'}
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {getLocalizedSetting('hero_subtitle') || 'في توريقة إحنا مش بنقدّم فطير وبس… إحنا بنقدّم تجربة مليانة حكايات'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Image */}
                            <div>
                                {getSetting('about_story_image') ? (
                                    <img
                                        src={getSetting('about_story_image')}
                                        alt="Story"
                                        className="w-full rounded-2xl shadow-lg"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 rounded-2xl" />
                                )}
                            </div>

                            {/* Text */}
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-primary mb-6">
                                    {getAboutSetting('about_story_title') || 'القصة وما فيها..'}
                                </h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {getAboutSetting('about_story_text')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision Section */}
                <section className="py-16 bg-[#Fdfbf7]">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Text */}
                            <div className="text-right order-2 lg:order-1">
                                <h2 className="text-3xl font-bold text-primary mb-6">
                                    {getAboutSetting('about_vision_title') || 'رؤيتنا'}
                                </h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {getAboutSetting('about_vision_text')}
                                </p>
                            </div>

                            {/* Image */}
                            <div className="order-1 lg:order-2">
                                {getSetting('about_vision_image') ? (
                                    <img
                                        src={getSetting('about_vision_image')}
                                        alt="Vision"
                                        className="w-full rounded-2xl shadow-lg"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 rounded-2xl" />
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Image */}
                            <div>
                                {getSetting('about_values_image') ? (
                                    <img
                                        src={getSetting('about_values_image')}
                                        alt="Values"
                                        className="w-full rounded-2xl shadow-lg"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 rounded-2xl" />
                                )}
                            </div>

                            {/* Text */}
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-primary mb-6">
                                    {getAboutSetting('about_values_title') || 'قيمنا'}
                                </h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {getAboutSetting('about_values_text')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Products Gallery Section */}
                <section className="py-16 bg-[#111] text-white">
                    <div className="max-w-6xl mx-auto px-6">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            {getAboutSetting('about_products_title') || 'منتجاتنا'}
                        </h2>

                        {/* Responsive Grid with Hover Descriptions */}
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="aspect-square bg-white/10 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : gallery.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                {gallery.map((img) => (
                                    <div
                                        key={img.id}
                                        className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer"
                                    >
                                        {/* Image */}
                                        <img
                                            src={img.image_url}
                                            alt={img.alt_text || 'Product'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Hover Overlay with Description */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 md:p-4">
                                            {img.alt_text && (
                                                <p className="text-white text-sm md:text-base font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    {img.alt_text}
                                                </p>
                                            )}
                                        </div>

                                        {/* Mobile Touch Indicator - always visible on mobile */}
                                        <div className="md:hidden absolute bottom-2 right-2 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">👆</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400">
                                {t('common.no_images') || 'لا توجد صور'}
                            </p>
                        )}

                        {/* Order Now Button */}
                        <div className="text-center mt-12">
                            <button
                                onClick={() => navigate('/menu')}
                                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
                            >
                                {t('about.order_now') || 'اطلب الأن'}
                            </button>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}
