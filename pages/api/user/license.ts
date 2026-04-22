// pages/api/user/license.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { email: { equals: session.user.email, mode: 'insensitive' } },
            select: {
                kodaLicenseKey: true,
                kodaTier: true,
                role: true,
                membershipExpiry: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            licenseKey: user.kodaLicenseKey || null,
            tier: user.kodaTier || null,
            role: user.role,
            expiry: user.membershipExpiry,
        });
    } catch (err: any) {
        console.error('License fetch error:', err);
        return res.status(500).json({ error: 'Internal error' });
    }
}
