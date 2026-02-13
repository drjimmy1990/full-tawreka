import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, MapPin, User, Phone, CheckCircle, ArrowLeft, CreditCard, Banknote, Loader2, Home, ShoppingBag } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';
import { useCartStore, useLocationStore, useSettingsStore } from '../store';
import { Button } from '../components/common/Button';
import { api } from '../lib/api';

type PaymentMethod = 'cash' | 'card';

export default function Checkout() {
    const navigate = useNavigate();
    const { t, lang } = useTranslation();
    const { items, getTotal, clearCart } = useCartStore();
    const { serviceType, branch, deliveryAddress, deliveryFee, deliveryLat, deliveryLng } = useLocationStore();
    const { getLocalizedSetting, getSetting } = useSettingsStore();

    // Get enabled payment methods from settings
    const cashEnabled = getSetting('payment_cash_enabled') !== 'false'; // default true
    const cardEnabled = getSetting('payment_card_enabled') === 'true'; // default false

    // Determine which payment methods are available
    const availablePaymentMethods = useMemo((): PaymentMethod[] => {
        const methods: PaymentMethod[] = [];
        if (cashEnabled) methods.push('cash');
        if (cardEnabled) methods.push('card');
        return methods.length > 0 ? methods : ['cash' as PaymentMethod];
    }, [cashEnabled, cardEnabled]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        floor: '',
        apartment: ''
    });
    const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(availablePaymentMethods[0]);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [showPaymentIframe, setShowPaymentIframe] = useState(false);
    const [iframeUrl, setIframeUrl] = useState('');

    // Validation functions
    const validatePhone = (phone: string) => {
        // Egyptian phone: 01XXXXXXXXX (11 digits starting with 01)
        const cleaned = phone.replace(/\D/g, '');
        if (!cleaned) return t('validation.phone_required');
        if (cleaned.length !== 11) return t('validation.phone_length');
        if (!cleaned.startsWith('01')) return t('validation.phone_format');
        return null;
    };

    const validateName = (name: string) => {
        if (!name.trim()) return t('validation.name_required');
        if (name.trim().length < 3) return t('validation.name_min');
        return null;
    };

    const validateForm = () => {
        const newErrors: typeof errors = {};
        const nameError = validateName(formData.name);
        const phoneError = validatePhone(formData.phone);
        if (nameError) newErrors.name = nameError;
        if (phoneError) newErrors.phone = phoneError;
        if (serviceType === 'delivery' && !formData.address.trim()) {
            newErrors.address = t('validation.address_required');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Update default payment method when available methods change
    useEffect(() => {
        if (!availablePaymentMethods.includes(paymentMethod)) {
            setPaymentMethod(availablePaymentMethods[0] as PaymentMethod);
        }
    }, [availablePaymentMethods, paymentMethod]);

    const Arrow = lang === 'ar' ? ArrowRight : ArrowLeft;
    const subtotal = getTotal();
    const total = subtotal + (serviceType === 'delivery' ? (deliveryFee || 0) : 0);
    const brandName = getLocalizedSetting('brand_name') || 'توريقة';
    const showPaymentSelection = availablePaymentMethods.length > 1;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branch) return;
        if (!validateForm()) return;
        setSubmitting(true);

        try {
            const orderPayload = {
                branch_id: branch.id,
                service_type: serviceType || 'pickup',
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_address: serviceType === 'delivery'
                    ? [
                        formData.address,           // Typed street details
                        deliveryAddress,            // Map-picked location (city/area)
                        formData.floor ? `Floor: ${formData.floor}` : null,
                        formData.apartment ? `Apt: ${formData.apartment}` : null
                    ].filter(Boolean).join(', ')
                    : formData.address || 'Pickup',
                delivery_lat: deliveryLat || undefined,
                delivery_lng: deliveryLng || undefined,
                payment_method: paymentMethod,
                items: items.map(item => ({
                    item_id: item.menuItemId,
                    quantity: item.quantity,
                    unit_price: item.totalPrice, // Per-unit total (already includes base + options/replacements)
                    notes: item.notes,
                    size: item.size, // Include extracted size
                    options: item.selectedOptions.map(opt => ({ ...opt, price: 0 })) // Prices already in unit_price
                }))
            };

            const result = await api.createOrder(orderPayload);

            if (result && result.order_id) {
                setOrderId(result.daily_seq || result.order_id);

                if (paymentMethod === 'card') {
                    try {
                        const paymentResult = await api.initiatePayment({
                            amount_cents: Math.round(total * 100),
                            order_id: result.order_id,
                            customer_name: formData.name,
                            customer_phone: formData.phone,
                            billing_data: {
                                first_name: formData.name.split(' ')[0] || 'Customer',
                                last_name: formData.name.split(' ').slice(1).join(' ') || 'Name',
                                email: 'customer@tawriqa.com',
                                phone_number: formData.phone,
                                // City/area from map, street details from user
                                street: formData.address || 'NA',
                                building: formData.address || 'NA',
                                floor: formData.floor || 'NA',
                                apartment: formData.apartment || 'NA',
                                city: deliveryAddress || branch?.name || 'Cairo',
                                state: deliveryAddress || branch?.name || 'Cairo',
                                country: 'EG',
                                postal_code: 'NA',
                                shipping_method: serviceType === 'delivery' ? 'Delivery' : 'Pickup'
                            }
                        });

                        if (paymentResult.iframe_url) {
                            setIframeUrl(paymentResult.iframe_url);
                            setShowPaymentIframe(true);
                            clearCart();
                        }
                    } catch (paymentError) {
                        console.error('Payment initiation failed:', paymentError);
                        alert(lang === 'ar' ? 'فشل في بدء عملية الدفع. يرجى المحاولة مرة أخرى.' : lang === 'en' ? 'Failed to initiate payment. Please try again.' : 'Не удалось начать оплату. Попробуйте еще раз.');
                    }
                } else {
                    setSuccess(true);
                    clearCart();
                }
            }
        } catch (err) {
            alert(t('common.error'));
        } finally {
            setSubmitting(false);
        }
    };

    // Show Paymob Payment Iframe
    if (showPaymentIframe && iframeUrl) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-primary/5 to-gray-50 flex flex-col">
                <Helmet>
                    <title>{t('checkout.secure_payment')} - {brandName}</title>
                </Helmet>

                <header className="bg-white shadow-sm px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => setShowPaymentIframe(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Arrow className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="font-bold text-gray-800 text-lg">{t('checkout.secure_payment')}</h1>
                        <p className="text-xs text-gray-400">{t('checkout.order_number')} #{orderId}</p>
                    </div>
                    <img src="/assets/images/logo.avif" alt={brandName} className="h-10 w-10 rounded-xl object-contain" />
                </header>

                <div className="flex-1 bg-white">
                    <iframe
                        src={iframeUrl}
                        title="Paymob Payment"
                        className="w-full h-full min-h-[600px] border-0"
                        allow="payment"
                    />
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full animate-scale-in">
                    <img src="/assets/images/logo.avif" alt={brandName} className="w-20 h-20 rounded-2xl mx-auto mb-4 object-contain" />
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('checkout.success')}</h2>
                    <p className="text-gray-500 mb-2">
                        {t('checkout.order_id')}: <span className="font-mono font-bold text-primary">#{orderId}</span>
                    </p>
                    {paymentMethod === 'cash' && (
                        <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg text-sm mb-6">
                            {t('checkout.cash_note')}
                        </div>
                    )}
                    <Button onClick={() => navigate('/')} className="w-full">
                        {t('common.back')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 via-white to-gray-50 pb-20">
            <Helmet>
                <title>{t('checkout.title') || 'إتمام الطلب'} - {brandName}</title>
            </Helmet>

            {/* Premium Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate('/menu')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Arrow className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="font-bold text-gray-800 text-lg">{t('checkout.title')}</h1>
                        <p className="text-xs text-gray-400">{items.length} منتج</p>
                    </div>
                    <img src="/assets/images/logo.avif" alt={brandName} className="h-10 w-10 rounded-xl object-contain" />
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-5">

                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">{t('cart.title')}</h3>
                            <p className="text-xs text-gray-400">{items.length} عنصر</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between items-start text-sm bg-gray-50 p-3 rounded-xl">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-primary text-white text-xs w-5 h-5 rounded flex items-center justify-center font-bold">{item.quantity}</span>
                                        <span className="font-medium text-gray-800">{item.name}</span>
                                        {item.size && (
                                            <span className="text-[10px] text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/10 mx-2">
                                                {item.size}
                                            </span>
                                        )}
                                    </div>
                                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                                        <div className="text-xs text-gray-400 ps-7 mt-1">
                                            {item.selectedOptions.map((opt, i) => (
                                                <span key={i}>• {opt.name} {opt.price > 0 && `(+${opt.price})`} </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="text-primary font-bold">{(item.totalPrice * item.quantity).toFixed(0)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{t('checkout.subtotal')}</span>
                            <span>{subtotal} {t('common.currency')}</span>
                        </div>
                        {serviceType === 'delivery' && (
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{t('checkout.delivery_fee')}</span>
                                <span>{deliveryFee} {t('common.currency')}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg text-primary pt-2 border-t border-gray-100">
                            <span>{t('checkout.total')}</span>
                            <span>{total} {t('common.currency')}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{t('checkout.contact_info')}</h3>
                                <p className="text-xs text-gray-400">{t('checkout.contact_subtitle')}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <User className={`absolute top-3.5 w-5 h-5 text-gray-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
                                <input
                                    required
                                    type="text"
                                    placeholder={t('checkout.name_placeholder')}
                                    minLength={3}
                                    value={formData.name}
                                    onChange={e => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (errors.name) setErrors({ ...errors, name: undefined });
                                    }}
                                    className={`w-full py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="relative">
                                <Phone className={`absolute top-3.5 w-5 h-5 text-gray-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
                                <input
                                    required
                                    type="tel"
                                    dir="ltr"
                                    placeholder="01XXXXXXXXX"
                                    maxLength={11}
                                    value={formData.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, phone: val });
                                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                                    }}
                                    className={`w-full py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${lang === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>

                            {/* Show map location if delivery */}
                            {deliveryAddress && serviceType === 'delivery' && (
                                <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 flex gap-3 items-center text-sm">
                                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500">{t('checkout.map_location')}</p>
                                        <p className="font-medium text-gray-700">{deliveryAddress}</p>
                                    </div>
                                </div>
                            )}

                            {/* User enters additional address details */}
                            <div className="relative">
                                <Home className={`absolute top-3.5 w-5 h-5 text-gray-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
                                <input
                                    required={serviceType === 'delivery'}
                                    type="text"
                                    placeholder={t('checkout.address_placeholder')}
                                    value={formData.address}
                                    onChange={e => {
                                        setFormData({ ...formData, address: e.target.value });
                                        if (errors.address) setErrors({ ...errors, address: undefined });
                                    }}
                                    className={`w-full py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>

                            {serviceType === 'delivery' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder={t('checkout.floor')}
                                        value={formData.floor}
                                        onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    />
                                    <input
                                        type="text"
                                        placeholder={t('checkout.apartment')}
                                        value={formData.apartment}
                                        onChange={e => setFormData({ ...formData, apartment: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Method Selection - Only show if multiple methods available */}
                    {
                        showPaymentSelection ? (
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{t('checkout.payment_method')}</h3>
                                        <p className="text-xs text-gray-400">{lang === 'ar' ? 'اختر طريقة الدفع المفضلة' : lang === 'en' ? 'Select your preferred payment method' : 'Выберите способ оплаты'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Cash Option - Only show if enabled */}
                                    {availablePaymentMethods.includes('cash') && (
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'cash'
                                                ? 'border-primary bg-primary/5 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-primary/10' : 'bg-gray-100'
                                                }`}>
                                                <Banknote className={`w-7 h-7 ${paymentMethod === 'cash' ? 'text-primary' : 'text-gray-400'}`} />
                                            </div>
                                            <div className="text-center">
                                                <span className={`font-bold text-sm block ${paymentMethod === 'cash' ? 'text-primary' : 'text-gray-700'}`}>
                                                    {t('checkout.cash')}
                                                </span>
                                                <span className="text-xs text-gray-400">{lang === 'ar' ? 'كاش' : lang === 'en' ? 'Cash' : 'Наличные'}</span>
                                            </div>
                                            {paymentMethod === 'cash' && (
                                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    )}

                                    {/* Card Option - Only show if enabled */}
                                    {availablePaymentMethods.includes('card') && (
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('card')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'card'
                                                ? 'border-primary bg-primary/5 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${paymentMethod === 'card' ? 'bg-primary/10' : 'bg-gray-100'
                                                }`}>
                                                <CreditCard className={`w-7 h-7 ${paymentMethod === 'card' ? 'text-primary' : 'text-gray-400'}`} />
                                            </div>
                                            <div className="text-center">
                                                <span className={`font-bold text-sm block ${paymentMethod === 'card' ? 'text-primary' : 'text-gray-700'}`}>
                                                    {t('checkout.card')}
                                                </span>
                                                <span className="text-xs text-gray-400">Visa / Mastercard</span>
                                            </div>
                                            {paymentMethod === 'card' && (
                                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {paymentMethod === 'card' && (
                                    <div className="mt-4 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                        <span className="text-lg">🔒</span>
                                        <span>سيتم تحويلك لصفحة الدفع الآمن</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Single payment method - show info only */
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 text-sm text-gray-600">
                                {paymentMethod === 'cash' ? (
                                    <>
                                        <Banknote className="w-5 h-5 text-primary" />
                                        <span>{t('checkout.cash_only')}</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        <span>{t('checkout.card_redirect')}</span>
                                    </>
                                )}
                            </div>
                        )
                    }

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                        isLoading={submitting}
                        disabled={items.length === 0}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                {t('checkout.processing')}
                            </>
                        ) : paymentMethod === 'card' ? (
                            <>
                                <CreditCard className="w-6 h-6" />
                                {t('checkout.pay_amount')} {total} {t('common.currency')}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-6 h-6" />
                                {t('checkout.confirm_order')} - {total} {t('common.currency')}
                            </>
                        )}
                    </Button>

                    {/* Security Badge */}
                    <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                        <span>🔐</span>
                        {t('checkout.security_badge')}
                    </div>
                </form >
            </div >
        </div >
    );
}
