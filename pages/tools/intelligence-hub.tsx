import DashboardLayout from '@/components/dashboard/DashboardLayout';
import IntelligenceHub from '@/components/IntelligenceHub';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function IntelligenceHubPage() {
    const router = useRouter();
    
    return (
        <DashboardLayout activeTool="intelligence-hub">
            <IntelligenceHub onBack={() => router.push('/dashboard')} />
        </DashboardLayout>
    );
}

export const getServerSideProps = async ({ locale }: any) => {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'vi', ['common'])),
        },
    };
};
