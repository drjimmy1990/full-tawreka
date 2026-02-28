import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import UserHeader from '../components/layout/UserHeader';
import Footer from '../components/layout/Footer';
import { useSettingsStore } from '../store';

export default function PrivacyPolicy() {
    const [lang, setLang] = useState<'en' | 'ar'>('ar');
    const { getSetting } = useSettingsStore();
    const brandName = lang === 'ar' ? (getSetting('brand_name_ar') || 'توريقة') : (getSetting('brand_name_en') || 'Tawriqa');

    return (
        <>
            <Helmet>
                <title>{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'} | {brandName}</title>
                <meta name="description" content={lang === 'ar' ? 'سياسة الخصوصية الخاصة بتوريقة' : 'Tawriqa Privacy Policy'} />
            </Helmet>

            <div className="min-h-screen bg-[#FDFBF7] font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <UserHeader />

                {/* Hero Banner */}
                <section className="pt-28 pb-14 bg-gradient-to-b from-[#111] to-[#1a1a1a] text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/images/landing-hero.avif')] bg-cover bg-center opacity-10" />
                    <div className="relative z-10 max-w-3xl mx-auto px-6">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                        </h1>
                        <p className="text-gray-400">
                            {lang === 'ar'
                                ? 'نلتزم بحماية بياناتك الشخصية وخصوصيتك'
                                : 'We are committed to protecting your personal data and privacy'}
                        </p>

                        {/* Language Toggle */}
                        <div className="mt-8 inline-flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                            <button
                                onClick={() => setLang('ar')}
                                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${lang === 'ar' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                العربية
                            </button>
                            <button
                                onClick={() => setLang('en')}
                                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${lang === 'en' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                English
                            </button>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16">
                    <div className="max-w-3xl mx-auto px-6">
                        {lang === 'en' ? <EnglishContent /> : <ArabicContent />}
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}

/* =================== ENGLISH =================== */
function EnglishContent() {
    const { settings } = useSettingsStore();
    const whatsapp = settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '';
    const phone = settings?.phone_number || '';

    return (
        <div className="space-y-10">
            <PolicySection num="1" title="Introduction">
                <p>This Privacy Policy explains how Tawriqa ("we", "our", "us") collects, uses, and protects your personal information when you use our website, mobile ordering services, or contact us through any digital channel.</p>
                <p className="text-gray-500 text-sm mt-2">By using our services, you agree to the practices described in this policy.</p>
            </PolicySection>

            <PolicySection num="2" title="Information We Collect">
                <p className="font-bold text-gray-800">Information You Provide Directly</p>
                <p className="mt-1">When placing an order or contacting us, we may collect:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>Full name</li>
                    <li>Phone number</li>
                    <li>Email address</li>
                    <li>Delivery address</li>
                    <li>Order details and preferences</li>
                    <li>Payment information (processed securely via payment providers)</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">We do not store full credit/debit card details on our servers.</p>

                <p className="font-bold text-gray-800 mt-6">Information Collected Automatically</p>
                <p className="mt-1">When using our website/app, we may automatically collect:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>IP address</li>
                    <li>Device and browser type</li>
                    <li>Pages visited and time spent</li>
                    <li>Cookies and usage analytics</li>
                    <li>Location data (for delivery services)</li>
                </ul>
            </PolicySection>

            <PolicySection num="3" title="How We Use Your Information">
                <p>We use your information to:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>Process and deliver orders</li>
                    <li>Communicate about orders and customer support</li>
                    <li>Improve our website and services</li>
                    <li>Prevent fraud and abuse</li>
                    <li>Send promotions and offers (only if you opt-in)</li>
                    <li>Comply with legal obligations</li>
                </ul>
            </PolicySection>

            <PolicySection num="4" title="Marketing Communications">
                <p>We may send promotional messages via:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>SMS</li>
                    <li>WhatsApp</li>
                    <li>Email</li>
                    <li>Social media ads</li>
                </ul>
                <p className="mt-3">You may opt-out at any time by:</p>
                <ul className="list-disc pr-6 space-y-1 mt-1">
                    <li>Unsubscribing from emails</li>
                    <li>Replying STOP to SMS</li>
                    <li>Contacting customer support</li>
                </ul>
            </PolicySection>

            <PolicySection num="5" title="Sharing Your Information">
                <p>We only share data when necessary with trusted partners:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>Payment gateways and banks</li>
                    <li>Delivery partners and drivers</li>
                    <li>IT and website service providers</li>
                    <li>Marketing and analytics platforms (Google, Meta)</li>
                </ul>
                <p className="font-bold text-primary mt-3">We do not sell or rent your personal data to third parties.</p>
            </PolicySection>

            <PolicySection num="6" title="Cookies & Tracking Technologies">
                <p>We use cookies to:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>Improve website performance</li>
                    <li>Understand user behavior</li>
                    <li>Personalize ads and offers</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">You may disable cookies in your browser settings.</p>
            </PolicySection>

            <PolicySection num="7" title="Data Security">
                <p>We implement technical and organizational security measures to protect your data from unauthorized access, loss, or misuse.</p>
                <p className="text-gray-500 text-sm mt-2">However, no online system is 100% secure.</p>
            </PolicySection>

            <PolicySection num="8" title="Data Retention">
                <p>We keep personal data only as long as necessary to:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>Fulfill orders</li>
                    <li>Provide customer support</li>
                    <li>Meet legal and tax requirements</li>
                </ul>
            </PolicySection>

            <PolicySection num="9" title="Your Rights">
                <p>You have the right to:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>Request access to your personal data</li>
                    <li>Request correction of inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Withdraw marketing consent</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">To exercise your rights, contact us using the details below.</p>
            </PolicySection>

            <PolicySection num="10" title="Children's Privacy">
                <p>Our services are not intended for individuals under 18.</p>
                <p>We do not knowingly collect data from minors.</p>
            </PolicySection>

            <PolicySection num="11" title="Updates to This Policy">
                <p>We may update this Privacy Policy periodically.</p>
                <p>The latest version will always be published on our website.</p>
            </PolicySection>

            <PolicySection num="12" title="Contact Us">
                <p>For privacy questions or requests, contact:</p>
                <div className="mt-4 space-y-3">
                    <a href="mailto:contact@tawriqa.com" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <span className="text-lg">✉️</span>
                        <span className="text-primary font-medium">contact@tawriqa.com</span>
                    </a>
                    {whatsapp && (
                        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <span className="text-lg">💬</span>
                            <span className="text-green-600 font-medium">WhatsApp</span>
                        </a>
                    )}
                    {phone && (
                        <a href={`tel:${phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <span className="text-lg">📞</span>
                            <span className="text-primary font-medium" dir="ltr">{phone}</span>
                        </a>
                    )}
                    <div className="flex items-center gap-3 pt-2">
                        {settings?.facebook_link && (
                            <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50 text-blue-600 font-medium transition-colors text-sm">Facebook</a>
                        )}
                        {settings?.instagram_link && (
                            <a href={settings.instagram_link} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 hover:bg-pink-50 text-pink-500 font-medium transition-colors text-sm">Instagram</a>
                        )}
                        {settings?.tiktok_link && (
                            <a href={settings.tiktok_link} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium transition-colors text-sm">TikTok</a>
                        )}
                    </div>
                </div>
            </PolicySection>
        </div>
    );
}

/* =================== ARABIC =================== */
function ArabicContent() {
    const { settings } = useSettingsStore();
    const whatsapp = settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '';
    const phone = settings?.phone_number || '';

    return (
        <div className="space-y-10">
            <PolicySection num="١" title="مقدمة">
                <p>توضح سياسة الخصوصية هذه كيفية قيام توريقة بجمع واستخدام وحماية بياناتك الشخصية عند استخدام موقعنا أو خدمات الطلب أونلاين أو التواصل معنا عبر أي قناة رقمية.</p>
                <p className="text-gray-500 text-sm mt-2">باستخدامك لخدماتنا فإنك توافق على ما ورد في هذه السياسة.</p>
            </PolicySection>

            <PolicySection num="٢" title="البيانات التي نقوم بجمعها">
                <p className="font-bold text-gray-800">البيانات التي يقدمها العميل</p>
                <p className="mt-1">عند إجراء طلب أو التواصل معنا قد نقوم بجمع:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>الاسم الكامل</li>
                    <li>رقم الهاتف</li>
                    <li>البريد الإلكتروني</li>
                    <li>عنوان التوصيل</li>
                    <li>تفاصيل الطلب والتفضيلات</li>
                    <li>بيانات الدفع (تتم معالجتها عبر مزودي الدفع بشكل آمن)</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">نحن لا نقوم بتخزين بيانات البطاقات البنكية بالكامل على خوادمنا.</p>

                <p className="font-bold text-gray-800 mt-6">البيانات التي يتم جمعها تلقائيًا</p>
                <p className="mt-1">عند استخدام الموقع أو التطبيق قد يتم جمع:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>عنوان IP</li>
                    <li>نوع الجهاز والمتصفح</li>
                    <li>الصفحات التي تمت زيارتها ومدة التصفح</li>
                    <li>ملفات تعريف الارتباط (Cookies)</li>
                    <li>بيانات الموقع لتسهيل التوصيل</li>
                </ul>
            </PolicySection>

            <PolicySection num="٣" title="كيفية استخدام البيانات">
                <p>نستخدم البيانات من أجل:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>تنفيذ الطلبات والتوصيل</li>
                    <li>التواصل وخدمة العملاء</li>
                    <li>تحسين الموقع والخدمات</li>
                    <li>منع الاحتيال وإساءة الاستخدام</li>
                    <li>إرسال العروض التسويقية (بعد موافقتك)</li>
                    <li>الالتزام بالمتطلبات القانونية</li>
                </ul>
            </PolicySection>

            <PolicySection num="٤" title="الرسائل التسويقية">
                <p>قد نرسل عروضًا عبر:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>الرسائل النصية</li>
                    <li>واتساب</li>
                    <li>البريد الإلكتروني</li>
                    <li>إعلانات مواقع التواصل</li>
                </ul>
                <p className="mt-3">يمكنك إلغاء الاشتراك في أي وقت عبر:</p>
                <ul className="list-disc pr-6 space-y-1 mt-1">
                    <li>إلغاء الاشتراك من البريد</li>
                    <li>الرد بكلمة STOP على الرسائل</li>
                    <li>التواصل مع خدمة العملاء</li>
                </ul>
            </PolicySection>

            <PolicySection num="٥" title="مشاركة البيانات">
                <p>نشارك البيانات فقط مع شركاء موثوقين عند الحاجة:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>بوابات الدفع والبنوك</li>
                    <li>شركات التوصيل</li>
                    <li>مزودي خدمات الموقع والتقنية</li>
                    <li>منصات التسويق والتحليل (جوجل – ميتا)</li>
                </ul>
                <p className="font-bold text-primary mt-3">نحن لا نبيع أو نؤجر بيانات العملاء لأي طرف ثالث.</p>
            </PolicySection>

            <PolicySection num="٦" title="ملفات تعريف الارتباط (Cookies)">
                <p>نستخدم الكوكيز من أجل:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>تحسين أداء الموقع</li>
                    <li>فهم سلوك المستخدم</li>
                    <li>تخصيص الإعلانات والعروض</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">يمكنك تعطيل الكوكيز من إعدادات المتصفح.</p>
            </PolicySection>

            <PolicySection num="٧" title="حماية البيانات">
                <p>نطبق إجراءات أمنية تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به أو سوء الاستخدام.</p>
                <p className="text-gray-500 text-sm mt-2">مع ذلك، لا يوجد نظام إلكتروني آمن بنسبة ١٠٠٪.</p>
            </PolicySection>

            <PolicySection num="٨" title="مدة الاحتفاظ بالبيانات">
                <p>نحتفظ بالبيانات فقط للفترة اللازمة من أجل:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>تنفيذ الطلبات</li>
                    <li>خدمة العملاء</li>
                    <li>الالتزامات القانونية والضريبية</li>
                </ul>
            </PolicySection>

            <PolicySection num="٩" title="حقوق المستخدم">
                <p>يحق لك:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>طلب الاطلاع على بياناتك</li>
                    <li>طلب تصحيح البيانات</li>
                    <li>طلب حذف البيانات</li>
                    <li>إلغاء الموافقة على التسويق</li>
                </ul>
            </PolicySection>

            <PolicySection num="١٠" title="خصوصية الأطفال">
                <p>خدماتنا غير موجهة لمن هم دون ١٨ عامًا، ولا نقوم بجمع بياناتهم بشكل مقصود.</p>
            </PolicySection>

            <PolicySection num="١١" title="تحديث السياسة">
                <p>قد يتم تحديث سياسة الخصوصية من وقت لآخر وسيتم نشر النسخة المحدثة على الموقع.</p>
            </PolicySection>

            <PolicySection num="١٢" title="التواصل">
                <p>لأي استفسار يتعلق بالخصوصية:</p>
                <div className="mt-4 space-y-3">
                    <a href="mailto:contact@tawriqa.com" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <span className="text-lg">✉️</span>
                        <span className="text-primary font-medium">contact@tawriqa.com</span>
                    </a>
                    {whatsapp && (
                        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <span className="text-lg">💬</span>
                            <span className="text-green-600 font-medium">واتساب</span>
                        </a>
                    )}
                    {phone && (
                        <a href={`tel:${phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <span className="text-lg">📞</span>
                            <span className="text-primary font-medium" dir="ltr">{phone}</span>
                        </a>
                    )}
                    <div className="flex items-center gap-3 pt-2">
                        {settings?.facebook_link && (
                            <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50 text-blue-600 font-medium transition-colors text-sm">فيسبوك</a>
                        )}
                        {settings?.instagram_link && (
                            <a href={settings.instagram_link} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 hover:bg-pink-50 text-pink-500 font-medium transition-colors text-sm">انستجرام</a>
                        )}
                        {settings?.tiktok_link && (
                            <a href={settings.tiktok_link} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium transition-colors text-sm">تيك توك</a>
                        )}
                    </div>
                </div>
            </PolicySection>
        </div>
    );
}

/* =================== Shared Section Card =================== */
function PolicySection({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {num}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-2">
                {children}
            </div>
        </div>
    );
}
