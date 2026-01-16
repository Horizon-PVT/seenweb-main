import React from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import Head from 'next/head';
import FutureEyeTool from '@/components/tools/FutureEye/FutureEyeTool';
import Link from 'next/link';

interface Props {
    isAdmin: boolean;
}

export default function FutureEyePage({ isAdmin }: Props) {
    return (
        <>
            <Head>
                <title>FUTURE-EYE AI | SeenYT Studio</title>
                <meta name="description" content="Documentary Production Assistant - Sản xuất video tương lai chất lượng quốc tế" />
            </Head>

            <div className="min-h-screen bg-[#0d1117]">
                {/* Back Button */}
                <div className="px-6 py-4 border-b border-gray-800">
                    <Link href="/?tool=all" className="text-gray-400 hover:text-white flex items-center gap-2">
                        ← Quay lại bảng công cụ
                    </Link>
                </div>

                {/* Main Tool */}
                <FutureEyeTool />
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerSession(context.req, context.res, authOptions);

    return {
        props: {
            isAdmin: (session?.user as any)?.role === 'ADMIN',
        },
    };
};
