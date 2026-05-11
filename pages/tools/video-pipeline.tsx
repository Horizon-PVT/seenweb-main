import DashboardLayout from '@/components/dashboard/DashboardLayout';
import VideoPipeline from '@/components/VideoPipeline';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function VideoPipelinePage() {
    const router = useRouter();
    
    return (
        <DashboardLayout activeTool="video-pipeline">
            <VideoPipeline onBack={() => router.push('/dashboard')} />
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
