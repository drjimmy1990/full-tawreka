import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import type { Branch } from '../../lib/api';
import { useLocationStore } from '../../store';
import useTranslation from '../../hooks/useTranslation';

export default function BranchList() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = '/' + (searchParams.get('redirect') || 'menu');
    const { t, lang } = useTranslation();
    const { setBranch, setServiceType } = useLocationStore();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const Arrow = lang === 'ar' ? ChevronRight : ChevronRight; // Icon logic might need adjustment based on RTL, but usually chevron points 'forward'

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
        setBranch(branch);
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
            {branches.map((branch) => (
                <button
                    key={branch.id}
                    onClick={() => handleSelectBranch(branch)}
                    className="group bg-white border border-gray-100 rounded-xl p-3 hover:border-primary hover:shadow-md transition-all text-start relative overflow-hidden flex items-start gap-3"
                >
                    <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <MapPin className="w-4 h-4 text-primary group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm mb-1">{branch.name}</h3>
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
            ))}

            {branches.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">{t('common.no_data') || 'No branches available'}</p>
                </div>
            )}
        </div>
    );
}
