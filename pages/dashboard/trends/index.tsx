import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TrendGallery from '@/components/TrendGallery';

import { GetServerSideProps } from 'next';

export default function TrendsPage({ user }: any) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch public trends list
        fetch('/api/trends')
            .then(res => res.json())
            .then(data => {
                setVideos(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <DashboardLayout userRole={user?.role}>
            <Head>
                <title>Khám phá Xu hướng | SeenYT</title>
            </Head>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CDAD5A] via-[#F4E2A6] to-[#CDAD5A]">
                        Khám Phá Xu Hướng
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Tuyển tập những video viral nhất, phân tích lý do thành công để bạn học hỏi và áp dụng ngay.
                    </p>
                </div>

                {/* Gallery */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CDAD5A]"></div>
                    </div>
                ) : (
                    <TrendGallery videos={videos} />
                )}
            </div>
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('../../api/auth/[...nextauth]');

    // Check session securely on server
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    // Only pass serializable user data (no Date objects)
    const user = {
        name: session.user?.name || null,
        email: session.user?.email || null,
        image: session.user?.image || null,
        role: (session.user as any)?.role || 'FREE',
    };

    return {
        props: { user },
    };
};
