import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Home, FileText } from 'lucide-react';
import { Button } from '../components/common/Button';

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [paymentDetails, setPaymentDetails] = useState<{
        orderId?: string;
        transactionId?: string;
        amount?: string;
        success?: boolean;
    }>({});

    useEffect(() => {
        // Check if payment actually failed - Paymob sends all results to one URL
        const successParam = searchParams.get('success');
        const txnCode = searchParams.get('txn_response_code');

        // If success=false or declined, redirect to failed page
        if (successParam === 'false' || txnCode === 'DECLINED') {
            navigate('/checkout/failed?' + searchParams.toString(), { replace: true });
            return;
        }

        // Extract payment details from URL params (sent by Paymob redirect)
        const details = {
            orderId: searchParams.get('merchant_order_id') || searchParams.get('order') || '',
            transactionId: searchParams.get('id') || searchParams.get('transaction_id') || '',
            amount: searchParams.get('amount_cents') || '',
            success: successParam === 'true' || txnCode === 'APPROVED'
        };
        setPaymentDetails(details);

        // Log for debugging (you can remove this in production)
        console.log('Payment Success - URL Params:', Object.fromEntries(searchParams.entries()));
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6" dir="rtl">
            <Helmet>
                <title>تم الدفع بنجاح</title>
            </Helmet>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-md w-full animate-[slideUp_0.5s_ease-out]">
                {/* Success Icon with Animation */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                    تم الدفع بنجاح! 🎉
                </h1>
                <p className="text-gray-500 mb-6">
                    شكراً لك! تم استلام طلبك وجاري تحضيره الآن.
                </p>

                {/* Order Details Card */}
                {paymentDetails.orderId && (
                    <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">رقم الطلب</span>
                                <span className="font-bold text-gray-800 font-mono bg-white px-3 py-1 rounded-lg">
                                    #{paymentDetails.orderId}
                                </span>
                            </div>
                            {paymentDetails.transactionId && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">رقم العملية</span>
                                    <span className="font-mono text-xs text-gray-600">
                                        {paymentDetails.transactionId}
                                    </span>
                                </div>
                            )}
                            {paymentDetails.amount && (
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="text-gray-500">المبلغ المدفوع</span>
                                    <span className="font-bold text-green-600 text-lg">
                                        {(parseInt(paymentDetails.amount) / 100).toFixed(2)} ج.م
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    تم تأكيد الطلب
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={() => navigate('/')}
                        className="w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        العودة للرئيسية
                    </Button>

                    <button
                        onClick={() => navigate('/menu')}
                        className="w-full py-3 text-primary hover:bg-primary/5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <FileText className="w-5 h-5" />
                        طلب جديد
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-gray-400 mt-6">
                    في حالة وجود أي استفسار، يرجى التواصل معنا
                </p>
            </div>

            {/* Background Decoration */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
