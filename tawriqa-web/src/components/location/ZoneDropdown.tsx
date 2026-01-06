import { useState, useEffect } from 'react';
import { api, type ZoneItem } from '../../lib/api';
import { Search, MapPin, Loader2 } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

interface ZoneDropdownProps {
    onSelect: (zone: ZoneItem) => void;
}

export default function ZoneDropdown({ onSelect }: ZoneDropdownProps) {
    const { t } = useTranslation();
    const [zones, setZones] = useState<ZoneItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            const data = await api.getAvailableZones();
            setZones(data);
            setLoading(false);
        };
        load();
    }, []);

    // Filter zones based on search
    const filteredZones = zones.filter(z =>
        z.name.toLowerCase().includes(search.toLowerCase()) ||
        z.group.toLowerCase().includes(search.toLowerCase())
    );

    // Group by City/Branch for display
    const groupedZones: Record<string, ZoneItem[]> = {};
    filteredZones.forEach(z => {
        if (!groupedZones[z.group]) groupedZones[z.group] = [];
        groupedZones[z.group].push(z);
    });

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 rtl:left-auto rtl:right-3" />
                <input
                    type="text"
                    placeholder={t('location.select_area') + "..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent rtl:pl-4 rtl:pr-10"
                />
            </div>

            {/* List */}
            <div className="h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {Object.keys(groupedZones).map(group => (
                    <div key={group}>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{group}</h3>
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            {groupedZones[group].map((zone, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelect(zone)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors text-start"
                                >
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium text-gray-700">{zone.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded">
                                            {zone.delivery_fee} {t('common.currency')}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredZones.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <p>No areas found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
