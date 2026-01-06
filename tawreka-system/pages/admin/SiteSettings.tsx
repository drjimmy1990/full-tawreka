import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Save, Upload, Loader2, Palette, Image as ImageIcon, Phone, Globe, X } from 'lucide-react';
import { useI18n } from '../../i18n';

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

            // Ensure defaults if missing
            if (!settingsMap['supported_languages']) settingsMap['supported_languages'] = '["ar", "en"]';
            if (!settingsMap['default_language']) settingsMap['default_language'] = 'ar';

            setSettings(settingsMap);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setSettings({ ...settings, [key]: value });
    };

    const handleLanguageToggle = (langCode: string) => {
        try {
            let currentLangs: string[] = JSON.parse(settings['supported_languages'] || '[]');
            if (currentLangs.includes(langCode)) {
                // Remove (prevent removing if it's the last one)
                if (currentLangs.length > 1) {
                    currentLangs = currentLangs.filter(l => l !== langCode);
                }
            } else {
                // Add
                currentLangs.push(langCode);
            }
            handleInputChange('supported_languages', JSON.stringify(currentLangs));
        } catch (e) {
            handleInputChange('supported_languages', JSON.stringify([langCode]));
        }
    };

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

    // Helper to check if lang is enabled
    const isLangEnabled = (code: string) => {
        try {
            return JSON.parse(settings['supported_languages'] || '[]').includes(code);
        } catch { return false; }
    };

    const Section = ({ title, icon: Icon, children }: any) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4 border-b pb-3">
                <Icon className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-blue-600" /> {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {children}
            </div>
        </div>
    );

    const InputField = ({ label, settingKey, type = 'text', fullWidth = false }: any) => (
        <div className={fullWidth ? 'md:col-span-2' : ''}>
            <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
            {type === 'color' ? (
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={settings[settingKey] || '#000000'}
                        onChange={(e) => handleInputChange(settingKey, e.target.value)}
                        className="w-10 h-10 rounded border overflow-hidden cursor-pointer"
                    />
                    <input
                        type="text"
                        value={settings[settingKey] || ''}
                        onChange={(e) => handleInputChange(settingKey, e.target.value)}
                        className="flex-1 border p-2 rounded text-sm font-mono"
                    />
                </div>
            ) : type === 'image' ? (
                <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={settings[settingKey] || ''}
                            onChange={(e) => handleInputChange(settingKey, e.target.value)}
                            placeholder="https://..."
                            className="flex-1 border p-2 rounded text-xs bg-gray-50"
                        />
                        <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-xs font-bold flex items-center gap-1 transition-colors">
                            {uploading === settingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            <span className="hidden sm:inline">{t('menu.upload')}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, settingKey)} />
                        </label>
                    </div>
                    {settings[settingKey] && (
                        <div className="relative inline-block">
                            <img src={settings[settingKey]} className="h-16 rounded border object-contain bg-gray-100" alt="preview" />
                            <button
                                type="button"
                                onClick={() => handleInputChange(settingKey, '')}
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
                    value={settings[settingKey] || ''}
                    onChange={(e) => handleInputChange(settingKey, e.target.value)}
                    className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            )}
        </div>
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

            {/* LANGUAGE CONTROL SECTION */}
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
                    <p className="text-xs text-gray-400 mt-2">
                        {language === 'ar'
                            ? 'اللغات المحددة فقط ستظهر في الموقع للزوار'
                            : 'Only checked languages will appear in the website toggle for visitors'
                        }
                    </p>
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

            {/* BRANDING SECTION */}
            <Section title={language === 'ar' ? 'الهوية والألوان' : 'Branding & Colors'} icon={Palette}>
                {/* Conditional Rendering based on Enabled Languages */}
                {isLangEnabled('ar') && <InputField label={language === 'ar' ? 'اسم المطعم (عربي)' : 'Brand Name (Arabic)'} settingKey="brand_name_ar" />}
                {isLangEnabled('en') && <InputField label={language === 'ar' ? 'اسم المطعم (إنجليزي)' : 'Brand Name (English)'} settingKey="brand_name_en" />}
                {isLangEnabled('ru') && <InputField label={language === 'ar' ? 'اسم المطعم (روسي)' : 'Brand Name (Russian)'} settingKey="brand_name_other" />}

                <div className="md:col-span-2 border-t pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label={language === 'ar' ? 'اللون الأساسي' : 'Primary Color'} settingKey="primary_color" type="color" />
                    <InputField label={language === 'ar' ? 'شعار الموقع' : 'Website Logo'} settingKey="logo_url" type="image" />
                </div>
            </Section>

            {/* HERO SECTION */}
            <Section title={language === 'ar' ? 'القسم الرئيسي (Hero)' : 'Hero Section'} icon={ImageIcon}>
                <InputField label={language === 'ar' ? 'صورة الخلفية' : 'Background Image'} settingKey="hero_image_url" type="image" fullWidth />

                {isLangEnabled('ar') && (
                    <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border border-green-100">
                        <h4 className="font-bold text-xs mb-3 text-green-700 uppercase flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full ltr:mr-2 rtl:ml-2"></span>
                            {language === 'ar' ? 'المحتوى العربي' : 'Arabic Content'}
                        </h4>
                        <div className="space-y-3">
                            <InputField label={language === 'ar' ? 'العنوان الرئيسي' : 'Hero Title'} settingKey="hero_title_ar" />
                            <InputField label={language === 'ar' ? 'العنوان الفرعي' : 'Hero Subtitle'} settingKey="hero_subtitle_ar" />
                        </div>
                    </div>
                )}

                {isLangEnabled('en') && (
                    <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-xs mb-3 text-blue-700 uppercase flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full ltr:mr-2 rtl:ml-2"></span>
                            {language === 'ar' ? 'المحتوى الإنجليزي' : 'English Content'}
                        </h4>
                        <div className="space-y-3">
                            <InputField label={language === 'ar' ? 'العنوان الرئيسي' : 'Hero Title'} settingKey="hero_title_en" />
                            <InputField label={language === 'ar' ? 'العنوان الفرعي' : 'Hero Subtitle'} settingKey="hero_subtitle_en" />
                        </div>
                    </div>
                )}

                {isLangEnabled('ru') && (
                    <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border border-purple-100">
                        <h4 className="font-bold text-xs mb-3 text-purple-700 uppercase flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full ltr:mr-2 rtl:ml-2"></span>
                            {language === 'ar' ? 'المحتوى الروسي' : 'Russian Content'}
                        </h4>
                        <div className="space-y-3">
                            <InputField label={language === 'ar' ? 'العنوان الرئيسي' : 'Hero Title'} settingKey="hero_title_other" />
                            <InputField label={language === 'ar' ? 'العنوان الفرعي' : 'Hero Subtitle'} settingKey="hero_subtitle_other" />
                        </div>
                    </div>
                )}
            </Section>

            {/* CONTACT SECTION */}
            <Section title={language === 'ar' ? 'معلومات التواصل' : 'Contact Information'} icon={Phone}>
                <InputField label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} settingKey="phone_number" />
                <InputField label={language === 'ar' ? 'رقم واتساب' : 'WhatsApp Number'} settingKey="whatsapp_number" />
                <InputField label={language === 'ar' ? 'رابط فيسبوك' : 'Facebook URL'} settingKey="facebook_link" />
                <InputField label={language === 'ar' ? 'رابط انستجرام' : 'Instagram URL'} settingKey="instagram_link" />
            </Section>

        </div>
    );
};

export default SiteSettings;
