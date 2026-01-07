import { Helmet } from 'react-helmet-async';
import UserHeader from '../components/layout/UserHeader';
import Footer from '../components/layout/Footer';
import BranchesSection from '../components/landing/BranchesSection';
import useTranslation from '../hooks/useTranslation';
import { useSettingsStore } from '../store';

export default function Branches() {
    const { t } = useTranslation();
    const { getLocalizedSetting } = useSettingsStore();
    const brandName = getLocalizedSetting('brand_name') || 'Tawriqa';

    return (
        <>
            <Helmet>
                <title>{t('header.branches') || 'فروعنا'} | {brandName}</title>
            </Helmet>

            <div className="min-h-screen bg-[#Fdfbf7]">
                <UserHeader />

                {/* Hero Banner */}
                <div className="pt-24 pb-12 bg-[#Fdfbf7]">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                            {t('landing.branches_title') || 'فروعنا'}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {t('landing.branches_subtitle') || 'زورنا في أي فرع'}
                        </p>
                    </div>
                </div>

                {/* Branches List */}
                <BranchesSection lightTheme />

                <Footer />
            </div>
        </>
    );
}

