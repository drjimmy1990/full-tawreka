import { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import clsx from 'clsx';

interface ContactFormProps {
    onSubmit?: (data: ContactFormData) => Promise<boolean>;
}

export interface ContactFormData {
    name: string;
    phone: string;
    email: string;
    message: string;
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        phone: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
            setError(t('contact.required_fields'));
            return;
        }

        setIsSubmitting(true);
        try {
            if (onSubmit) {
                // Keep existing prop logic just in case
                const success = await onSubmit(formData);
                if (success) {
                    setIsSuccess(true);
                    setFormData({ name: '', phone: '', email: '', message: '' });
                } else {
                    setError(t('common.error'));
                }
            } else {
                // n8n Webhook Integration
                const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

                if (webhookUrl) {
                    const response = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            ...formData,
                            timestamp: new Date().toISOString(),
                            source: 'tawriqa-web'
                        }),
                    });

                    if (response.ok) {
                        setIsSuccess(true);
                        setFormData({ name: '', phone: '', email: '', message: '' });
                    } else {
                        throw new Error('Failed to submit');
                    }
                } else {
                    // Fallback simulation if no webhook is simulating
                    console.warn('VITE_N8N_WEBHOOK_URL is not set');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setIsSuccess(true);
                    setFormData({ name: '', phone: '', email: '', message: '' });
                }
            }
        } catch (err) {
            console.error('Contact form error:', err);
            setError(t('common.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-8 space-y-4 animate-fade-in">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-white">{t('contact.success_title')}</h3>
                <p className="text-gray-400">{t('contact.success_message')}</p>
                <button
                    onClick={() => setIsSuccess(false)}
                    className="text-primary hover:underline text-sm font-bold"
                >
                    {t('contact.send_another')}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name - Required */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    {t('contact.name_placeholder')} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    dir="auto"
                    className={clsx(
                        "w-full px-4 py-3 rounded-xl border bg-white/5 text-white placeholder:text-gray-500 text-end",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        "border-white/10 hover:border-white/20 transition-colors"
                    )}
                />
            </div>

            {/* Phone - Required */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    {t('contact.phone_placeholder')} <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    dir="auto"
                    className={clsx(
                        "w-full px-4 py-3 rounded-xl border bg-white/5 text-white placeholder:text-gray-500 text-end",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        "border-white/10 hover:border-white/20 transition-colors"
                    )}
                />
            </div>

            {/* Email (Optional) */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    {t('contact.email_placeholder')}
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    dir="auto"
                    className={clsx(
                        "w-full px-4 py-3 rounded-xl border bg-white/5 text-white placeholder:text-gray-500 text-end",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        "border-white/10 hover:border-white/20 transition-colors"
                    )}
                />
            </div>

            {/* Message - Required */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    {t('contact.message_placeholder')} <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    dir="auto"
                    rows={4}
                    className={clsx(
                        "w-full px-4 py-3 rounded-xl border bg-white/5 text-white placeholder:text-gray-500 resize-none text-end",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        "border-white/10 hover:border-white/20 transition-colors"
                    )}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 px-4 py-2 rounded-lg animate-fade-in">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={clsx(
                    "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                    "bg-primary text-white hover:bg-primary-dark",
                    "disabled:opacity-70 disabled:cursor-not-allowed"
                )}
            >
                {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        {t('contact.submit')}
                    </>
                )}
            </button>
        </form>
    );
}
