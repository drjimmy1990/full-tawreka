import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from './lib/api';
import { useSettingsStore } from './store';

// Pages
import Landing from './pages/Landing';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import LocationSelection from './pages/LocationSelection';

function App() {
    const { setSettings, getLocalizedSetting, getSetting } = useSettingsStore();
    // const { branch } = useLocationStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await api.getSiteSettings();
            setSettings(settings);
        } catch (e) {
            console.error('Failed to load settings:', e);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    // Loading Screen
    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#Fdfbf7] flex flex-col items-center justify-center z-[100]">
                {/* Logo Pulse */}
                <div className="w-24 h-24 mb-6 relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div className="relative z-10 w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl p-4">
                        {/* Fallback to simple icon if no logo loaded yet */}
                        <div className="w-10 h-10 bg-primary rounded-full animate-bounce"></div>
                    </div>
                </div>
                <p className="text-primary font-bold text-lg tracking-widest animate-pulse">TAWRIQA</p>
            </div>
        );
    }

    // Error screen
    if (error) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-[#415A3E] text-white px-6 py-2 rounded-lg"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    const brandName = getLocalizedSetting('brand_name') || 'Restaurant';
    const logoUrl = getSetting('logo_url');

    return (
        <>
            <Helmet>
                <title>{brandName}</title>
                <meta name="description" content={getLocalizedSetting('hero_subtitle')} />
                {logoUrl && <link rel="icon" href={logoUrl} />}
            </Helmet>

            <BrowserRouter>
                <Routes>
                    {/* Landing - Service Selection */}
                    <Route path="/" element={<Landing />} />

                    {/* Menu - Allow access even without branch for testing */}
                    <Route path="/location" element={<LocationSelection />} />
                    <Route path="/menu" element={<Menu />} />

                    {/* Checkout */}
                    <Route path="/checkout" element={<Checkout />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
