import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import UserHeader from '../components/layout/UserHeader';
import Footer from '../components/layout/Footer';
import { useSettingsStore } from '../store';

export default function RefundPolicy() {
    const [lang, setLang] = useState<'en' | 'ar'>('ar');
    const { getSetting } = useSettingsStore();
    const brandName = lang === 'ar' ? (getSetting('brand_name_ar') || 'توريقة') : (getSetting('brand_name_en') || 'Tawriqa');

    return (
        <>
            <Helmet>
                <title>{lang === 'ar' ? 'سياسة الاسترجاع والإلغاء' : 'Refund & Cancellation Policy'} | {brandName}</title>
                <meta name="description" content={lang === 'ar' ? 'سياسة الاسترجاع والإلغاء الخاصة بتوريقة' : 'Tawriqa Online Order Refund & Cancellation Policy'} />
            </Helmet>

            <div className="min-h-screen bg-[#FDFBF7] font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <UserHeader />

                {/* Hero Banner */}
                <section className="pt-28 pb-14 bg-gradient-to-b from-[#111] to-[#1a1a1a] text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/images/landing-hero.avif')] bg-cover bg-center opacity-10" />
                    <div className="relative z-10 max-w-3xl mx-auto px-6">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            {lang === 'ar' ? 'سياسة الاسترجاع والإلغاء' : 'Refund & Cancellation Policy'}
                        </h1>
                        <p className="text-gray-400">
                            {lang === 'ar' ? 'نقوم بالاسترجاع في حالة الخطأ فقط — وليس بسبب تغيير الرأي.' : 'We refund service failures — not change of mind.'}
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
            <PolicySection num="1" title="Our Promise">
                <p>At Tawriqa, we prepare every order fresh and on demand. Because our food is perishable and made specifically for you, we only offer refunds when a service failure occurs.</p>
                <p className="font-bold text-primary mt-2">We refund service failures — not change of mind.</p>
            </PolicySection>

            <PolicySection num="2" title="Order Cancellation">
                <p>Orders may be cancelled within <strong>5 minutes</strong> of placing the order.</p>
                <p>After this time, food preparation begins and the order cannot be cancelled or refunded.</p>
            </PolicySection>

            <PolicySection num="3" title="Non-Refundable Situations">
                <p>Refunds are not provided in the following cases:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>Customer changed their mind after ordering</li>
                    <li>Wrong item selected by the customer</li>
                    <li>Incorrect delivery address entered by the customer</li>
                    <li>Customer unavailable to receive the order</li>
                    <li>Taste preferences or personal dislike of the product</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">All menu descriptions and images are provided to help customers make informed choices before ordering.</p>
            </PolicySection>

            <PolicySection num="4" title="Refund Eligible Situations">
                <p>You may request a refund or replacement if:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>Items are missing from the order</li>
                    <li>Wrong items were delivered</li>
                    <li>Food arrived damaged or spilled due to packaging failure</li>
                    <li>Food quality is unsafe or spoiled</li>
                    <li>Order was not delivered (when delivery is handled by Tawriqa)</li>
                </ul>
                <p className="mt-3">Tawriqa reserves the right to determine the appropriate resolution:</p>
                <ul className="list-disc pr-6 space-y-1 mt-1">
                    <li>Replacement of items</li>
                    <li>Partial refund</li>
                    <li>Full refund</li>
                </ul>
            </PolicySection>

            <PolicySection num="5" title="Evidence Requirement">
                <p>To ensure fairness and prevent fraud:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>Complaints must be reported within <strong>60 minutes</strong> of delivery</li>
                    <li>Clear photo evidence must be provided showing the issue</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">Requests submitted without evidence or outside the time window may not be eligible for refund.</p>
            </PolicySection>

            <PolicySection num="6" title="Delivery Responsibility">
                <p>If delivery is handled by third-party delivery partners, <strong>Tawriqa is responsible for:</strong></p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>Food quality</li>
                    <li>Order accuracy</li>
                </ul>
                <p className="mt-3"><strong>Delivery partners are responsible for:</strong></p>
                <ul className="list-disc pr-6 space-y-1 mt-1">
                    <li>Delivery delays</li>
                    <li>Rider behavior</li>
                    <li>Delivery handling after pickup</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">In cases of delivery delay, Tawriqa may offer store credit or a discount coupon as a goodwill gesture.</p>
            </PolicySection>

            <PolicySection num="7" title="Refund Method">
                <p>Approved refunds are issued as follows:</p>
                <ol className="list-decimal pr-6 space-y-1 mt-2">
                    <li>Store credit / voucher (preferred method)</li>
                    <li>Refund to original payment method (when necessary)</li>
                </ol>
                <p className="text-gray-500 text-sm mt-3">Refund processing time may vary depending on payment provider.</p>
            </PolicySection>

            <PolicySection num="8" title="How to Contact Us">
                <p>To report an issue, please contact us via:</p>
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
                <p className="mt-5 font-medium text-gray-700">Include:</p>
                <ul className="list-disc pr-6 space-y-1 mt-1">
                    <li>Order number</li>
                    <li>Description of issue</li>
                    <li>Photo evidence</li>
                </ul>
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
            <PolicySection num="١" title="وعدنا">
                <p>في توريقة يتم تجهيز جميع الطلبات طازجة خصيصًا لكل عميل. ونظرًا لأن الطعام منتج سريع التلف ويتم تحضيره فور الطلب، فإن الاسترجاع يتم فقط في حالة حدوث خطأ أو تقصير من جانبنا.</p>
                <p className="font-bold text-primary mt-2">نقوم بالاسترجاع في حالة الخطأ فقط — وليس بسبب تغيير الرأي.</p>
            </PolicySection>

            <PolicySection num="٢" title="إلغاء الطلب">
                <p>يمكن إلغاء الطلب خلال <strong>٥ دقائق</strong> من وقت إتمام الطلب.</p>
                <p>بعد مرور هذه المدة يبدأ تجهيز الطلب، وبالتالي لا يمكن إلغاؤه أو استرجاع قيمته.</p>
            </PolicySection>

            <PolicySection num="٣" title="حالات لا يشملها الاسترجاع">
                <p>لا يتم الاسترجاع في الحالات التالية:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>تغيير العميل رأيه بعد إتمام الطلب</li>
                    <li>اختيار صنف بالخطأ من قبل العميل</li>
                    <li>إدخال عنوان توصيل غير صحيح</li>
                    <li>عدم تواجد العميل لاستلام الطلب</li>
                    <li>عدم الإعجاب بالطعم أو التفضيلات الشخصية</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">نوفر وصفًا وصورًا واضحة للمنتجات لمساعدة العميل على الاختيار الصحيح قبل الطلب.</p>
            </PolicySection>

            <PolicySection num="٤" title="حالات الاسترجاع أو التعويض">
                <p>يحق للعميل طلب استرجاع أو تعويض في الحالات التالية:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>وجود أصناف ناقصة من الطلب</li>
                    <li>استلام أصناف خاطئة</li>
                    <li>وصول الطلب بحالة متضررة أو مسكوبة بسبب التغليف</li>
                    <li>وجود مشكلة في سلامة أو جودة الطعام</li>
                    <li>عدم استلام الطلب (في حالة التوصيل بواسطة توريقة)</li>
                </ul>
                <p className="mt-3">ويحق لتوريقة تحديد الحل المناسب:</p>
                <ul className="list-disc pr-6 space-y-1 mt-1">
                    <li>استبدال المنتج</li>
                    <li>استرجاع جزئي</li>
                    <li>استرجاع كامل</li>
                </ul>
            </PolicySection>

            <PolicySection num="٥" title="شرط تقديم دليل">
                <p>لضمان العدالة ومنع إساءة الاستخدام:</p>
                <ul className="list-disc pr-6 space-y-1 mt-2">
                    <li>يجب الإبلاغ عن المشكلة خلال <strong>٦٠ دقيقة</strong> من استلام الطلب</li>
                    <li>يجب إرسال صور واضحة توضح المشكلة</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">أي طلب بدون دليل أو بعد انتهاء المدة قد لا يكون مؤهلًا للاسترجاع.</p>
            </PolicySection>

            <PolicySection num="٦" title="مسؤولية التوصيل">
                <p>في حال تم التوصيل عبر شركة توصيل خارجية:</p>
                <p className="mt-2"><strong>تكون مسؤولية توريقة:</strong></p>
                <ul className="list-disc pr-6 space-y-1 mt-1">
                    <li>جودة الطعام</li>
                    <li>دقة الطلب</li>
                </ul>
                <p className="mt-3"><strong>وتكون مسؤولية شركة التوصيل:</strong></p>
                <ul className="list-disc pr-6 space-y-1 mt-1">
                    <li>تأخير التوصيل</li>
                    <li>سلوك المندوب</li>
                    <li>التعامل مع الطلب بعد الاستلام</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">في حالات التأخير، قد يتم تقديم رصيد بالمحفظة أو كوبون خصم كتعويض.</p>
            </PolicySection>

            <PolicySection num="٧" title="طريقة الاسترجاع">
                <p>يتم تنفيذ الاسترجاع كالتالي:</p>
                <ol className="list-decimal pr-6 space-y-1 mt-2">
                    <li>رصيد داخل الحساب أو كوبون شراء (الخيار المفضل)</li>
                    <li>استرجاع على وسيلة الدفع الأصلية عند الحاجة</li>
                </ol>
                <p className="text-gray-500 text-sm mt-3">مدة تنفيذ الاسترجاع تعتمد على مزود خدمة الدفع.</p>
            </PolicySection>

            <PolicySection num="٨" title="التواصل معنا">
                <p>للإبلاغ عن أي مشكلة يرجى التواصل عبر:</p>
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
                <p className="mt-5 font-medium text-gray-700">يرجى إرسال:</p>
                <ul className="list-disc pr-6 space-y-1 mt-1">
                    <li>رقم الطلب</li>
                    <li>وصف المشكلة</li>
                    <li>صور توضح المشكلة</li>
                </ul>
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
