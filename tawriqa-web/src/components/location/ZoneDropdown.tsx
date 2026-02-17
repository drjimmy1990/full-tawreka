import { useState, useEffect } from 'react';
import { api, type ZoneItem } from '../../lib/api';
import { Search, MapPin, Loader2, ChevronDown, Clock } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';
import { checkBranchOpen } from '../../store';

interface ZoneDropdownProps {
    onSelect: (zone: ZoneItem) => void;
}

interface BranchGroup {
    branch_id: number;
    branch_name: string;
    opening_time?: string;
    closing_time?: string;
    is_available: boolean;
    zones: ZoneItem[];
}

export default function ZoneDropdown({ onSelect }: ZoneDropdownProps) {
    const { t, lang } = useTranslation();
    const [zones, setZones] = useState<ZoneItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedBranch, setExpandedBranch] = useState<number | null>(null);

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
        z.branch_name?.toLowerCase().includes(search.toLowerCase())
    );

    // Group by branch
    const branchGroups: BranchGroup[] = [];
    const branchMap = new Map<number, BranchGroup>();

    filteredZones.forEach(z => {
        if (!branchMap.has(z.branch_id)) {
            const group: BranchGroup = {
                branch_id: z.branch_id,
                branch_name: z.branch_name || z.group,
                opening_time: z.opening_time,
                closing_time: z.closing_time,
                is_available: z.is_available !== false,
                zones: [],
            };
            branchMap.set(z.branch_id, group);
            branchGroups.push(group);
        }
        branchMap.get(z.branch_id)!.zones.push(z);
    });

    const toggleBranch = (branchId: number) => {
        setExpandedBranch(prev => prev === branchId ? null : branchId);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-3">
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

            {/* Branch Accordion List */}
            <div className="h-[300px] overflow-y-auto pr-1 custom-scrollbar space-y-2">
                {branchGroups.map((branch) => {
                    const isExpanded = expandedBranch === branch.branch_id;
                    const isOpen = branch.is_available && checkBranchOpen(branch.opening_time, branch.closing_time);

                    return (
                        <div key={branch.branch_id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            {/* Branch Header (Clickable) */}
                            <button
                                onClick={() => toggleBranch(branch.branch_id)}
                                className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-start ${!isOpen ? 'opacity-70' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isOpen ? 'bg-primary/10' : 'bg-red-50'}`}>
                                        <MapPin className={`w-4 h-4 ${isOpen ? 'text-primary' : 'text-red-400'}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-800">{branch.branch_name}</span>
                                            {isOpen ? (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                                                    {lang === 'ar' ? 'مفتوح' : 'Open'}
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
                                                    {lang === 'ar' ? 'مغلق' : 'Closed'}
                                                </span>
                                            )}
                                        </div>
                                        {branch.opening_time && (
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                <span>{branch.opening_time} - {branch.closing_time}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Expanded Zone List */}
                            {isExpanded && (
                                <div className="border-t border-gray-100 bg-gray-50/50">
                                    {branch.zones.map((zone, idx) => {
                                        const zoneAvailable = zone.is_available !== false;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => zoneAvailable && onSelect(zone)}
                                                disabled={!zoneAvailable}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-0 transition-colors text-start ${zoneAvailable
                                                        ? 'hover:bg-primary/5 cursor-pointer'
                                                        : 'opacity-50 cursor-not-allowed'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                                    <span className="text-sm text-gray-700">{zone.name}</span>
                                                </div>
                                                {zoneAvailable ? (
                                                    <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded">
                                                        {zone.delivery_fee} {t('common.currency')}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1 rounded">
                                                        {t('location.delivery_unavailable')}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {branchGroups.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <p>{lang === 'ar' ? 'لا توجد مناطق' : 'No areas found'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
