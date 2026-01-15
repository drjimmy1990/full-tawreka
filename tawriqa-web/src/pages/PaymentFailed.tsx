import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { XCircle, Home, RefreshCcw, MessageCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useSettingsStore } from '../store';

export default function PaymentFailed() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { getSetting } = useSettingsStore();
    const [errorDetails, setErrorDetails] = useState<{
        orderId?: string;
        errorCode?: string;
        message?: string;
    }>({});

    useEffect(() => {
        // Extract error details from URL params
        const details = {
            orderId: searchParams.get('merchant_order_id') || searchParams.get('order') || '',
            errorCode: searchParams.get('txn_response_code') || searchParams.get('error_code') || '',
            message: searchParams.get('data.message') || searchParams.get('message') || ''
        };
        setErrorDetails(details);

        // Log for debugging
        console.log('Payment Failed - URL Params:', Object.fromEntries(searchParams.entries()));
    }, [searchParams]);

    // Map common error codes to user-friendly messages
    const getErrorMessage = (code: string) => {
        const errorMessages: Record<string, string> = {
            'DECLINED': 'تم رفض البطاقة. يرجى استخدام بطاقة أخرى.',
            'INSUFFICIENT_FUNDS': 'رصيد غير كافٍ في البطاقة.',
            'EXPIRED_CARD': 'البطاقة منتهية الصلاحية.',
            'INVALID_CARD': 'بيانات البطاقة غير صحيحة.',
            'CANCELLED': 'تم إلغاء العملية.',
        };
        return errorMessages[code] || 'حدث خطأ أثناء معالجة الدفع.';
    };

    const whatsappNumber = getSetting('whatsapp_number') || '';

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-6" dir="rtl">
            <Helmet>
                <title>فشل الدفع</title>
            </Helmet>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-md w-full animate-[slideUp_0.5s_ease-out]">
                {/* Error Icon with Animation */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <XCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                    فشل الدفع 😔
                </h1>
                <p className="text-gray-500 mb-6">
                    {getErrorMessage(errorDetails.errorCode || '')}
                </p>

                {/* Error Details Card */}
                {(errorDetails.orderId || errorDetails.errorCode) && (
                    <div className="bg-red-50 rounded-2xl p-5 mb-6 border border-red-100">
                        <div className="space-y-3 text-sm">
                            {errorDetails.orderId && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">رقم الطلب</span>
                                    <span className="font-bold text-gray-800 font-mono">
                                        #{errorDetails.orderId}
                                    </span>
                                </div>
                            )}
                            {errorDetails.errorCode && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">كود الخطأ</span>
                                    <span className="font-mono text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                        {errorDetails.errorCode}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={() => navigate('/checkout')}
                        className="w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        المحاولة مرة أخرى
                    </Button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        العودة للرئيسية
                    </button>
                </div>

                {/* Help Link */}
                {whatsappNumber && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <button
                            onClick={() => {
                                window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`, '_blank');
                            }}
                            className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                        >
                            <MessageCircle className="w-4 h-4" />
                            تحتاج مساعدة؟ تواصل معنا
                        </button>
                    </div>
                )}
            </div>

            {/* Background Decoration */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200/30 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
