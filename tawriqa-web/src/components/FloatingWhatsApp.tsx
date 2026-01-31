import { useEffect, useState } from 'react';
import { useSettingsStore, useCartStore } from '../store';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
    const { getSetting, currentLanguage } = useSettingsStore();
    const { getItemCount } = useCartStore();
    const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

    useEffect(() => {
        const num = getSetting('whatsapp_number');
        if (num) {
            // Remove + from start if present for link (optional, but good for wa.me)
            setWhatsappNumber(num.replace('+', ''));
        }
    }, [getSetting, currentLanguage]); // Re-run if settings/lang changes

    if (!whatsappNumber) return null;

    const positionClass = currentLanguage === 'ar' ? 'left-6' : 'right-6';
    const bottomClass = getItemCount() > 0 ? 'bottom-24' : 'bottom-6';

    return (
        <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`fixed ${bottomClass} ${positionClass} z-[60] bg-[#25D366] hover:bg-[#128C7E] text-white p-3.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center animate-bounce-slow`}
            aria-label="Contact us on WhatsApp"
        >
            <MessageCircle className="w-8 h-8" strokeWidth={2} />
        </a>
    );
}
