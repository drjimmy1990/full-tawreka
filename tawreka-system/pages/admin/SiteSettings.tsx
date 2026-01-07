import React, { useEffect, useState, useCallback, memo } from 'react';
import { api } from '../../services/api';
import { Save, Upload, Loader2, Palette, Image as ImageIcon, Phone, Globe, X } from 'lucide-react';
import { useI18n } from '../../i18n';

// Move Section outside to prevent re-creation
const Section = memo(({ title, icon: Icon, children }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4 border-b pb-3">
            <Icon className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-blue-600" /> {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
));

// Stable InputField component outside the main component
const InputField = memo(({ label, settingKey, type = 'text', fullWidth = false, value, onChange, onUpload, uploading, t }: any) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
        <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
        {type === 'color' ? (
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange(settingKey, e.target.value)}
                    className="w-10 h-10 rounded border overflow-hidden cursor-pointer"
                />
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(settingKey, e.target.value)}
                    className="flex-1 border p-2 rounded text-sm font-mono"
                    autoComplete="off"
                />
            </div>
        ) : type === 'image' ? (
            <div className="space-y-2">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(settingKey, e.target.value)}
                        placeholder="https://..."
                        className="flex-1 border p-2 rounded text-xs bg-gray-50"
                        autoComplete="off"
                    />
                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-xs font-bold flex items-center gap-1 transition-colors">
                        {uploading === settingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span className="hidden sm:inline">{t('menu.upload')}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(e, settingKey)} />
                    </label>
                </div>
                {value && (
                    <div className="relative inline-block">
                        <img src={value} className="h-16 rounded border object-contain bg-gray-100" alt="preview" />
                        <button
                            type="button"
                            onClick={() => onChange(settingKey, '')}
                            className="absolute -top-1 ltr:-right-1 rtl:-left-1 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        ) : (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(settingKey, e.target.value)}
                className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                autoComplete="off"
            />
        )}
    </div>
));

const SiteSettings: React.FC = () => {
    const { t, language } = useI18n();
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await api.getSiteSettings();
            const settingsMap: any = {};
            data.forEach((item: any) => {
                settingsMap[item.key] = item.value;
            });
            if (!settingsMap['supported_languages']) settingsMap['supported_languages'] = '["ar", "en"]';
            if (!settingsMap['default_language']) settingsMap['default_language'] = 'ar';
            setSettings(settingsMap);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = useCallback((key: string, value: string) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    }, []);

    const handleLanguageToggle = useCallback((langCode: string) => {
        setSettings((prev: any) => {
            try {
                let currentLangs: string[] = JSON.parse(prev['supported_languages'] || '[]');
                if (currentLangs.includes(langCode)) {
                    if (currentLangs.length > 1) {
                        currentLangs = currentLangs.filter(l => l !== langCode);
                    }
                } else {
                    currentLangs.push(langCode);
                }
                return { ...prev, supported_languages: JSON.stringify(currentLangs) };
            } catch (e) {
                return { ...prev, supported_languages: JSON.stringify([langCode]) };
            }
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const promises = Object.keys(settings).map(key =>
                api.updateSiteSetting(key, settings[key])
            );
            await Promise.all(promises);
            alert(language === 'ar' ? 'تم حفظ الإعدادات!' : 'Settings Saved!');
        } catch (e) {
            alert(language === 'ar' ? 'خطأ في الحفظ' : 'Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(key);
        const url = await api.uploadImage(e.target.files[0]);
        if (url) handleInputChange(key, url);
        setUploading(null);
    };

    const isLangEnabled = useCallback((code: string) => {
        try {
            return JSON.parse(settings['supported_languages'] || '[]').includes(code);
        } catch { return false; }
    }, [settings]);

    // Helper to render InputField with props
    const renderInput = (label: string, settingKey: string, type = 'text', fullWidth = false) => (
        <InputField
            key={settingKey}
            label={label}
            settingKey={settingKey}
            type={type}
            fullWidth={fullWidth}
            value={settings[settingKey]}
            onChange={handleInputChange}
            onUpload={handleFileUpload}
            uploading={uploading}
            t={t}
        />
    );

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

    return (
        <div className="pb-10 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{t('nav.site_settings')}</h2>
                    <p className="text-sm text-gray-500">{language === 'ar' ? 'تخصيص موقع المطعم' : 'Customize your restaurant website'}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 flex items-center disabled:opacity-50 shadow-md transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin ltr:mr-2 rtl:ml-2" /> : <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" />}
                    {t('menu.save')}
                </button>
            </div>

            {/* LANGUAGE CONTROL */}
            <Section title={language === 'ar' ? 'إعدادات اللغات' : 'Localization'} icon={Globe}>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-2">
                        {language === 'ar' ? 'اللغات المفعّلة' : 'Enabled Languages'}
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { code: 'ar', label: 'عربي (AR)', labelEn: 'Arabic (AR)' },
                            { code: 'en', label: 'English (EN)', labelEn: 'English (EN)' },
                            { code: 'ru', label: 'Русский (RU)', labelEn: 'Russian (RU)' }
                        ].map(lang => (
                            <label
                                key={lang.code}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer select-none transition-all ${isLangEnabled(lang.code)
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                                    : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isLangEnabled(lang.code)}
                                    onChange={() => handleLanguageToggle(lang.code)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="font-bold">{language === 'ar' ? lang.label : lang.labelEn}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        {language === 'ar' ? 'اللغة الافتراضية' : 'Default Language'}
                    </label>
                    <select
                        value={settings['default_language'] || 'ar'}
                        onChange={(e) => handleInputChange('default_language', e.target.value)}
                        className="w-full border p-2.5 rounded-lg bg-white"
                    >
                        {isLangEnabled('ar') && <option value="ar">عربي (Arabic)</option>}
                        {isLangEnabled('en') && <option value="en">English</option>}
                        {isLangEnabled('ru') && <option value="ru">Русский (Russian)</option>}
                    </select>
                </div>
            </Section>

            {/* BRANDING */}
            <Section title={language === 'ar' ? 'الهوية والألوان' : 'Branding & Colors'} icon={Palette}>
                {isLangEnabled('ar') && renderInput(language === 'ar' ? 'اسم المطعم (عربي)' : 'Brand Name (Arabic)', 'brand_name_ar')}
                {isLangEnabled('en') && renderInput(language === 'ar' ? 'اسم المطعم (إنجليزي)' : 'Brand Name (English)', 'brand_name_en')}
                {isLangEnabled('ru') && renderInput(language === 'ar' ? 'اسم المطعم (روسي)' : 'Brand Name (Russian)', 'brand_name_other')}
                <div className="md:col-span-2 border-t pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInput(language === 'ar' ? 'اللون الأساسي' : 'Primary Color', 'primary_color', 'color')}
                    {renderInput(language === 'ar' ? 'شعار الموقع' : 'Website Logo', 'logo_url', 'image')}
                </div>
            </Section>

            {/* HERO */}
            <Section title={language === 'ar' ? 'القسم الرئيسي (Hero)' : 'Hero Section'} icon={ImageIcon}>
                {renderInput(language === 'ar' ? 'صورة الخلفية' : 'Background Image', 'hero_image_url', 'image', true)}
                {isLangEnabled('ar') && (
                    <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border border-green-100">
                        <h4 className="font-bold text-xs mb-3 text-green-700">{language === 'ar' ? 'المحتوى العربي' : 'Arabic Content'}</h4>
                        <div className="space-y-3">
                            {renderInput(language === 'ar' ? 'العنوان الرئيسي' : 'Hero Title', 'hero_title_ar')}
                            {renderInput(language === 'ar' ? 'العنوان الفرعي' : 'Hero Subtitle', 'hero_subtitle_ar')}
                        </div>
                    </div>
                )}
                {isLangEnabled('en') && (
                    <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-xs mb-3 text-blue-700">{language === 'ar' ? 'المحتوى الإنجليزي' : 'English Content'}</h4>
                        <div className="space-y-3">
                            {renderInput(language === 'ar' ? 'العنوان الرئيسي' : 'Hero Title', 'hero_title_en')}
                            {renderInput(language === 'ar' ? 'العنوان الفرعي' : 'Hero Subtitle', 'hero_subtitle_en')}
                        </div>
                    </div>
                )}
                {isLangEnabled('ru') && (
                    <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border border-purple-100">
                        <h4 className="font-bold text-xs mb-3 text-purple-700">{language === 'ar' ? 'المحتوى الروسي' : 'Russian Content'}</h4>
                        <div className="space-y-3">
                            {renderInput(language === 'ar' ? 'العنوان الرئيسي' : 'Hero Title', 'hero_title_other')}
                            {renderInput(language === 'ar' ? 'العنوان الفرعي' : 'Hero Subtitle', 'hero_subtitle_other')}
                        </div>
                    </div>
                )}
            </Section>

            {/* CONTACT & SOCIAL */}
            <Section title={language === 'ar' ? 'التواصل والسوشيال ميديا' : 'Contact & Social Media'} icon={Phone}>
                {renderInput(language === 'ar' ? 'رقم الهاتف' : 'Phone Number', 'phone_number')}
                {renderInput(language === 'ar' ? 'رقم واتساب' : 'WhatsApp Number', 'whatsapp_number')}
                {renderInput(language === 'ar' ? 'البريد الإلكتروني' : 'Email', 'email')}
                {renderInput(language === 'ar' ? 'رابط خرائط جوجل' : 'Google Maps URL', 'google_maps_link')}
                <div className="md:col-span-2 border-t pt-4 mt-2">
                    <h4 className="font-medium text-sm text-gray-600 mb-3">{language === 'ar' ? 'روابط السوشيال ميديا' : 'Social Media Links'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderInput('Facebook', 'facebook_link')}
                        {renderInput('Instagram', 'instagram_link')}
                        {renderInput('TikTok', 'tiktok_link')}
                        {renderInput('Twitter / X', 'twitter_link')}
                    </div>
                </div>
            </Section>

            {/* BUSINESS INFO */}
            <Section title={language === 'ar' ? 'معلومات العمل' : 'Business Information'} icon={Globe}>
                {isLangEnabled('ar') && (
                    <>
                        {renderInput(language === 'ar' ? 'العنوان (عربي)' : 'Address (Arabic)', 'address_ar')}
                        {renderInput(language === 'ar' ? 'ساعات العمل (عربي)' : 'Working Hours (Arabic)', 'working_hours_ar')}
                    </>
                )}
                {isLangEnabled('en') && (
                    <>
                        {renderInput(language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (English)', 'address_en')}
                        {renderInput(language === 'ar' ? 'ساعات العمل (إنجليزي)' : 'Working Hours (English)', 'working_hours_en')}
                    </>
                )}
                {isLangEnabled('ru') && (
                    <>
                        {renderInput(language === 'ar' ? 'العنوان (روسي)' : 'Address (Russian)', 'address_other')}
                        {renderInput(language === 'ar' ? 'ساعات العمل (روسي)' : 'Working Hours (Russian)', 'working_hours_other')}
                    </>
                )}
            </Section>

            {/* SEO */}
            <Section title={language === 'ar' ? 'تحسين محركات البحث (SEO)' : 'SEO & Meta Tags'} icon={Globe}>
                {renderInput(language === 'ar' ? 'صورة المشاركة (OG Image)' : 'Social Share Image', 'og_image_url', 'image', true)}
                {renderInput(language === 'ar' ? 'أيقونة الموقع (Favicon)' : 'Favicon', 'favicon_url', 'image')}
                {isLangEnabled('ar') && (
                    <>
                        {renderInput(language === 'ar' ? 'وصف الموقع (عربي)' : 'Meta Description (Arabic)', 'meta_description_ar')}
                        {renderInput(language === 'ar' ? 'الكلمات المفتاحية (عربي)' : 'Keywords (Arabic)', 'meta_keywords_ar')}
                    </>
                )}
                {isLangEnabled('en') && (
                    <>
                        {renderInput(language === 'ar' ? 'وصف الموقع (إنجليزي)' : 'Meta Description (English)', 'meta_description_en')}
                        {renderInput(language === 'ar' ? 'الكلمات المفتاحية (إنجليزي)' : 'Keywords (English)', 'meta_keywords_en')}
                    </>
                )}
                {isLangEnabled('ru') && (
                    <>
                        {renderInput(language === 'ar' ? 'وصف الموقع (روسي)' : 'Meta Description (Russian)', 'meta_description_other')}
                        {renderInput(language === 'ar' ? 'الكلمات المفتاحية (روسي)' : 'Keywords (Russian)', 'meta_keywords_other')}
                    </>
                )}
            </Section>

            {/* PAGE TITLES */}
            <Section title={language === 'ar' ? 'عناوين الصفحات' : 'Page Titles'} icon={Globe}>
                {isLangEnabled('ar') && (
                    <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border border-green-100 md:col-span-2">
                        <h4 className="font-bold text-xs mb-3 text-green-700">{language === 'ar' ? 'عربي' : 'Arabic'}</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {renderInput(language === 'ar' ? 'الرئيسية' : 'Home', 'page_title_home_ar')}
                            {renderInput(language === 'ar' ? 'المنيو' : 'Menu', 'page_title_menu_ar')}
                            {renderInput(language === 'ar' ? 'اختيار الموقع' : 'Location', 'page_title_location_ar')}
                            {renderInput(language === 'ar' ? 'إتمام الطلب' : 'Checkout', 'page_title_checkout_ar')}
                        </div>
                    </div>
                )}
                {isLangEnabled('en') && (
                    <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100 md:col-span-2">
                        <h4 className="font-bold text-xs mb-3 text-blue-700">English</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {renderInput('Home', 'page_title_home_en')}
                            {renderInput('Menu', 'page_title_menu_en')}
                            {renderInput('Location', 'page_title_location_en')}
                            {renderInput('Checkout', 'page_title_checkout_en')}
                        </div>
                    </div>
                )}
                {isLangEnabled('ru') && (
                    <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border border-purple-100 md:col-span-2">
                        <h4 className="font-bold text-xs mb-3 text-purple-700">Русский</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {renderInput('Главная', 'page_title_home_other')}
                            {renderInput('Меню', 'page_title_menu_other')}
                            {renderInput('Локация', 'page_title_location_other')}
                            {renderInput('Оформление', 'page_title_checkout_other')}
                        </div>
                    </div>
                )}
            </Section>

            {/* FOOTER */}
            <Section title={language === 'ar' ? 'الفوتر' : 'Footer'} icon={Globe}>
                {isLangEnabled('ar') && (
                    <>
                        {renderInput(language === 'ar' ? 'شعار الفوتر (عربي)' : 'Footer Tagline (Arabic)', 'footer_tagline_ar')}
                        {renderInput(language === 'ar' ? 'حقوق النشر (عربي)' : 'Copyright (Arabic)', 'footer_copyright_ar')}
                    </>
                )}
                {isLangEnabled('en') && (
                    <>
                        {renderInput(language === 'ar' ? 'شعار الفوتر (إنجليزي)' : 'Footer Tagline (English)', 'footer_tagline_en')}
                        {renderInput(language === 'ar' ? 'حقوق النشر (إنجليزي)' : 'Copyright (English)', 'footer_copyright_en')}
                    </>
                )}
                {isLangEnabled('ru') && (
                    <>
                        {renderInput(language === 'ar' ? 'شعار الفوتر (روسي)' : 'Footer Tagline (Russian)', 'footer_tagline_other')}
                        {renderInput(language === 'ar' ? 'حقوق النشر (روسي)' : 'Copyright (Russian)', 'footer_copyright_other')}
                    </>
                )}
            </Section>

            {/* LEGAL */}
            <Section title={language === 'ar' ? 'الصفحات القانونية' : 'Legal Pages'} icon={Globe}>
                {renderInput(language === 'ar' ? 'رابط الشروط والأحكام' : 'Terms & Conditions URL', 'terms_url')}
                {renderInput(language === 'ar' ? 'رابط سياسة الخصوصية' : 'Privacy Policy URL', 'privacy_url')}
                {renderInput(language === 'ar' ? 'رابط من نحن' : 'About Us URL', 'about_url')}
            </Section>
        </div>
    );
};

export default SiteSettings;
