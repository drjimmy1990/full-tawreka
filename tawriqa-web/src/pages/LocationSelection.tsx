import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Store, Navigation, Loader2 } from 'lucide-react';
import { useLocationStore, useSettingsStore } from '../store';
import useTranslation from '../hooks/useTranslation';
import BranchList from '../components/location/BranchList';
import DeliveryMap from '../components/location/DeliveryMap';
import ZoneDropdown from '../components/location/ZoneDropdown'; // We will create this next
import clsx from 'clsx';
import { api } from '../lib/api';

export default function LocationSelection() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { setServiceType, setBranch, setDeliveryLocation, deliveryAddress } = useLocationStore();
    const { settings } = useSettingsStore();

    // UI State
    const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
    const [deliveryMethod, setDeliveryMethod] = useState<'map' | 'dropdown'>('map');
    const [isChecking, setIsChecking] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Background
    const bgImage = settings?.hero_cover || '/assets/images/location-bg.avif';

    // Handle when user confirms a location (from Map or Dropdown)
    const handleConfirmLocation = async (lat: number, lng: number, address: string, predefinedBranchId?: number, predefinedFee?: number) => {
        setIsChecking(true);
        setErrorMsg(null);

        try {
            let result;

            // If we selected from Dropdown, we already know the branch/fee
            if (predefinedBranchId && predefinedFee !== undefined) {
                result = { covered: true, branch_id: predefinedBranchId, delivery_fee: predefinedFee, branch_name: undefined, zone_name: undefined }; // Minimal result for now, can be enriched
            } else {
                // If from Map, ask Backend to check polygon coverage
                result = await api.checkCoverage(lat, lng);
            }

            if (result.covered && result.branch_id) {
                // 1. Save Service Type
                setServiceType('delivery');

                // 2. Save Branch Info (Minimal info needed for Menu)
                setBranch({ id: result.branch_id, name: result.branch_name || 'Branch' });

                // 3. Save Delivery Details
                setDeliveryLocation(address, lat, lng, result.delivery_fee, result.zone_name);

                // 4. Go to Menu
                navigate('/menu');
            } else {
                setErrorMsg(t('location.not_covered'));
            }
        } catch (e) {
            setErrorMsg(t('common.error'));
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 text-center border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">{t('landing.choose_service')}</h2>

                    {/* Toggle Switch */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mt-4">
                        <button
                            onClick={() => setMode('delivery')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all",
                                mode === 'delivery' ? "bg-primary text-white shadow-md" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <MapPin className="w-4 h-4" /> {t('landing.delivery')}
                        </button>
                        <button
                            onClick={() => setMode('pickup')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all",
                                mode === 'pickup' ? "bg-primary text-white shadow-md" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <Store className="w-4 h-4" /> {t('landing.pickup')}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto bg-gray-50 flex-1">

                    {mode === 'delivery' ? (
                        <div className="space-y-4">
                            {/* Sub-Tabs for Delivery (Map vs List) */}
                            <div className="flex justify-center gap-4 mb-2">
                                <button
                                    onClick={() => setDeliveryMethod('map')}
                                    className={clsx("text-xs font-bold px-3 py-1 rounded-full border transition-colors", deliveryMethod === 'map' ? "bg-primary/10 border-primary text-primary" : "border-transparent text-gray-400")}
                                >
                                    Map & GPS
                                </button>
                                <button
                                    onClick={() => setDeliveryMethod('dropdown')}
                                    className={clsx("text-xs font-bold px-3 py-1 rounded-full border transition-colors", deliveryMethod === 'dropdown' ? "bg-primary/10 border-primary text-primary" : "border-transparent text-gray-400")}
                                >
                                    Select Area
                                </button>
                            </div>

                            {deliveryMethod === 'map' ? (
                                <div className="space-y-4">
                                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Navigation className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400 font-bold">Selected Location</p>
                                            <p className="text-sm font-medium truncate">{deliveryAddress || 'Pin location on map'}</p>
                                        </div>
                                    </div>

                                    <DeliveryMap
                                        onLocationSelect={(lat, lng, addr) => {
                                            setDeliveryLocation(addr, lat, lng); // Just update store, don't confirm yet
                                        }}
                                    />

                                    <button
                                        onClick={() => {
                                            const { deliveryLat, deliveryLng, deliveryAddress } = useLocationStore.getState();
                                            if (deliveryLat && deliveryLng) {
                                                handleConfirmLocation(deliveryLat, deliveryLng, deliveryAddress);
                                            } else {
                                                setErrorMsg("Please select a location on the map");
                                            }
                                        }}
                                        disabled={isChecking}
                                        className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-70 flex justify-center"
                                    >
                                        {isChecking ? <Loader2 className="animate-spin" /> : t('location.continue')}
                                    </button>
                                </div>
                            ) : (
                                // Dropdown Component
                                <ZoneDropdown onSelect={(zone) => {
                                    // Use a dummy lat/lng for dropdown zones (or the branch location if available)
                                    // The important part is we pass branch_id directly
                                    handleConfirmLocation(0, 0, zone.name, zone.branch_id, zone.delivery_fee);
                                }} />
                            )}
                        </div>
                    ) : (
                        <BranchList />
                    )}

                    {/* Error Toast */}
                    {errorMsg && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-bold text-center rounded-lg border border-red-100 animate-fade-in">
                            {errorMsg}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
