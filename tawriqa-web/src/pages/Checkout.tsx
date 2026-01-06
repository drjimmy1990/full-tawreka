import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, User, Phone, CheckCircle, ArrowLeft } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';
import { useCartStore, useLocationStore } from '../store';
import { Button } from '../components/common/Button';
import { api } from '../lib/api';

export default function Checkout() {
    const navigate = useNavigate();
    const { t, lang } = useTranslation();
    const { items, getTotal, clearCart } = useCartStore();
    const { serviceType, branch, deliveryAddress, deliveryFee, deliveryLat, deliveryLng } = useLocationStore();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        notes: '',
        floor: '',
        apartment: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState<number | null>(null);

    const Arrow = lang === 'ar' ? ArrowRight : ArrowLeft;
    const subtotal = getTotal();
    const total = subtotal + (serviceType === 'delivery' ? (deliveryFee || 0) : 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branch) return;
        setSubmitting(true);

        try {
            // Prepare Payload for Backend
            const orderPayload = {
                branch_id: branch.id,
                service_type: serviceType || 'pickup', // Fallback to satisfy type, though checked via flow
                customer_name: formData.name,
                customer_phone: formData.phone,
                // Combine address details
                customer_address: serviceType === 'delivery'
                    ? `${deliveryAddress}, Floor: ${formData.floor}, Apt: ${formData.apartment}`
                    : 'Pickup',
                delivery_lat: deliveryLat || undefined,
                delivery_lng: deliveryLng || undefined,
                notes: formData.notes,
                items: items.map(item => ({
                    item_id: item.menuItemId,
                    quantity: item.quantity,
                    unit_price: item.basePrice, // Backend can verify this
                    notes: item.notes,
                    // Transform options for backend storage
                    options: item.selectedOptions
                }))
            };

            const result = await api.createOrder(orderPayload);
            if (result && result.order_id) {
                setOrderId(result.order_id);
                setSuccess(true);
                clearCart();
            }
        } catch (err) {
            alert(t('common.error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full animate-scale-in">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('checkout.success')}</h2>
                    <p className="text-gray-500 mb-6">
                        {t('checkout.order_id')}: <span className="font-mono font-bold text-gray-800">#{orderId}</span>
                    </p>
                    <Button onClick={() => navigate('/')} className="w-full">
                        {t('common.back')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white shadow-sm px-4 py-4 flex items-center gap-4">
                <button onClick={() => navigate('/menu')} className="p-2 hover:bg-gray-100 rounded-full">
                    <Arrow className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="font-bold text-gray-800 text-lg">{t('checkout.title')}</h1>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-6">

                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="bg-primary/10 text-primary w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
                        {t('cart.title')}
                    </h3>
                    <div className="space-y-3 mb-4">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <div>
                                    <span className="font-bold text-gray-700">{item.quantity}x</span> {item.name}
                                </div>
                                <span className="text-gray-900 font-medium">{(item.totalPrice * item.quantity).toFixed(0)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-dashed border-gray-200 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>{subtotal} {t('common.currency')}</span>
                        </div>
                        {serviceType === 'delivery' && (
                            <div className="flex justify-between text-gray-500">
                                <span>Delivery Fee</span>
                                <span>{deliveryFee} {t('common.currency')}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg text-primary pt-2">
                            <span>Total</span>
                            <span>{total} {t('common.currency')}</span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="bg-primary/10 text-primary w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
                        {t('checkout.name')} & {t('checkout.address')}
                    </h3>

                    <div className="relative">
                        <User className="absolute top-3.5 left-3 w-5 h-5 text-gray-400 rtl:right-3 rtl:left-auto" />
                        <input
                            required
                            type="text"
                            placeholder={t('checkout.name')}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none rtl:pr-10 rtl:pl-4"
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute top-3.5 left-3 w-5 h-5 text-gray-400 rtl:right-3 rtl:left-auto" />
                        <input
                            required
                            type="tel"
                            placeholder={t('checkout.phone')}
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none rtl:pr-10 rtl:pl-4"
                        />
                    </div>

                    {serviceType === 'delivery' && (
                        <>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex gap-3 items-start text-sm text-gray-600">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <p>{deliveryAddress}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder={t('checkout.floor')}
                                    value={formData.floor}
                                    onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder={t('checkout.apartment')}
                                    value={formData.apartment}
                                    onChange={e => setFormData({ ...formData, apartment: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </>
                    )}

                    <textarea
                        rows={2}
                        placeholder={t('checkout.notes')}
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />

                    <Button
                        type="submit"
                        className="w-full py-4 text-lg mt-4"
                        isLoading={submitting}
                        disabled={items.length === 0}
                    >
                        {t('checkout.submit')}
                    </Button>
                </form>
            </div>
        </div>
    );
}
