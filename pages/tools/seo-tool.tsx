import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SeoTool from '@/components/SeoTool';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function SeoToolPage() {
    const router = useRouter();
    
    return (
        <DashboardLayout activeTool="seo-tool">
            <SeoTool onBack={() => router.push('/dashboard')} />
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
