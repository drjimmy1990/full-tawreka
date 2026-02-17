import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import type { Branch } from '../../lib/api';
import { useLocationStore, checkBranchOpen } from '../../store';
import useTranslation from '../../hooks/useTranslation';

export default function BranchList() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = '/' + (searchParams.get('redirect') || 'menu');
    const { t, lang } = useTranslation();
    const { setBranch, setServiceType } = useLocationStore();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const Arrow = ChevronRight;

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            const data = await api.getBranches();
            setBranches(data);
        } catch (error) {
            console.error('Failed to load branches', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBranch = (branch: Branch) => {
        setServiceType('pickup');
        setBranch({
            id: branch.id,
            name: branch.name,
            opening_time: branch.opening_time,
            closing_time: branch.closing_time,
            is_active: branch.is_active,
            is_delivery_available: branch.is_delivery_available,
        });
        navigate(redirectTo);
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse h-24"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {branches.map((branch) => {
                const isOpen = (branch.is_active !== false) && checkBranchOpen(branch.opening_time, branch.closing_time);

                return (
                    <button
                        key={branch.id}
                        onClick={() => handleSelectBranch(branch)}
                        className={`group bg-white border border-gray-100 rounded-xl p-3 hover:border-primary hover:shadow-md transition-all text-start relative overflow-hidden flex items-start gap-3 ${!isOpen ? 'opacity-70' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-primary/5 group-hover:bg-primary group-hover:text-white' : 'bg-red-50'}`}>
                            <MapPin className={`w-4 h-4 ${isOpen ? 'text-primary group-hover:text-white' : 'text-red-400'}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-800 text-sm">{branch.name}</h3>
                                {isOpen ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                                        {lang === 'ar' ? 'مفتوح' : 'Open'}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
                                        {lang === 'ar' ? 'مغلق' : 'Closed'}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mb-1 line-clamp-2">{branch.phone_contact || ''}</p>

                            {branch.opening_time && (
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{branch.opening_time} - {branch.closing_time}</span>
                                </div>
                            )}
                        </div>
                        <div className="self-center">
                            <Arrow className={`w-4 h-4 text-gray-300 group-hover:text-primary ${lang === 'ar' ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                );
            })}

            {branches.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">{t('common.no_data') || 'No branches available'}</p>
                </div>
            )}
        </div>
    );
}
