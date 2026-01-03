// File: lib/admin/auth.ts
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function requireAdminAuth(context: GetServerSidePropsContext) {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    if (
        session.user?.email !== 'phamanhtung.jp@gmail.com' ||
        (session.user as any)?.role !== 'ADMIN'
    ) {
        return {
            redirect: {
                destination: '/?error=forbidden',
                permanent: false,
            },
        };
    }

    return {
        props: {
            session,
        },
    };
}
