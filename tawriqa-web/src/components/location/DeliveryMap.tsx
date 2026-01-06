import { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useTranslation from '../../hooks/useTranslation';
import { useLocationStore } from '../../store';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Constants
const DEFAULT_CENTER = { lat: 30.0444, lng: 31.2357 }; // Cairo
const ZOOM_LEVEL = 13;

interface DeliveryMapProps {
    onLocationSelect: (lat: number, lng: number, address: string) => void;
}

// Sub-component to handle map clicks/drags and updates
function LocationMarker({ position, setPosition, onLocationSelect }: {
    position: L.LatLng,
    setPosition: (pos: L.LatLng) => void,
    onLocationSelect: (lat: number, lng: number, address: string) => void
}) {
    const markerRef = useRef<L.Marker>(null);
    const { t } = useTranslation();

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker) {
                    const newPos = marker.getLatLng();
                    setPosition(newPos);

                    // Basic coords first
                    onLocationSelect(newPos.lat, newPos.lng, "Loading address...");

                    // Call OSM API for address (Free, no key needed)
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&accept-language=en`) // or 'ar' based on lang
                        .then(res => res.json())
                        .then(data => {
                            const addr = data.display_name?.split(',')[0] + ', ' + (data.address?.city || data.address?.state || '');
                            onLocationSelect(newPos.lat, newPos.lng, addr);
                        })
                        .catch(() => {
                            onLocationSelect(newPos.lat, newPos.lng, `${newPos.lat.toFixed(4)}, ${newPos.lng.toFixed(4)}`);
                        });
                }
            },
        }),
        [setPosition, onLocationSelect],
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        >
            <Popup minWidth={90}>
                <span className="font-sans font-bold text-center block text-primary">
                    {t('location.delivery_location')}
                </span>
            </Popup>
        </Marker>
    );
}

// Sub-component to fly to location
function FlyToLocation({ coords }: { coords: { lat: number; lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 16);
        }
    }, [coords, map]);
    return null;
}

export default function DeliveryMap({ onLocationSelect }: DeliveryMapProps) {
    const { t } = useTranslation();
    const { deliveryLat, deliveryLng } = useLocationStore();

    // Initial position preference: Saved store location -> Cairo
    const [position, setPosition] = useState<L.LatLng>(
        deliveryLat && deliveryLng
            ? new L.LatLng(deliveryLat, deliveryLng)
            : new L.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
    );

    const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const handleLocateMe = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = new L.LatLng(latitude, longitude);
                    setPosition(newPos);
                    setFlyToCoords({ lat: latitude, lng: longitude });
                    onLocationSelect(latitude, longitude, "Current Location");
                    setIsLoadingLocation(false);
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    alert(t('location.not_covered')); // Reuse fallback msg
                    setIsLoadingLocation(false);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
            setIsLoadingLocation(false);
        }
    };

    return (
        <div className="relative w-full h-[300px] rounded-xl overflow-hidden border border-gray-200 shadow-inner group">
            <MapContainer
                center={position}
                zoom={ZOOM_LEVEL}
                scrollWheelZoom={false}
                className="w-full h-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    position={position}
                    setPosition={setPosition}
                    onLocationSelect={onLocationSelect}
                />
                <FlyToLocation coords={flyToCoords} />
            </MapContainer>

            {/* Locate Me Button Overlay */}
            <button
                onClick={handleLocateMe}
                disabled={isLoadingLocation}
                className="absolute bottom-4 right-4 z-[400] bg-white p-3 rounded-full shadow-lg text-gray-600 hover:text-primary transition-all active:scale-95 disabled:opacity-50"
                title={t('location.detect')}
            >
                <Navigation className={`w-5 h-5 ${isLoadingLocation ? 'animate-spin text-primary' : ''}`} />
            </button>

            {/* Center Pin Helper (Optional visual cue) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[400] bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {t('location.delivery_subtitle')}
            </div>
        </div>
    );
}
