// pages/api/admin/grant-dubbing-credits.ts
// Quick API to grant dubbing credits to users based on their role

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Only admin can call this
    const session = await getServerSession(req, res, authOptions);
    if (!session || (session.user as any)?.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { action } = req.body;

    try {
        if (action === 'grant-all') {
            // Grant credits to all users based on their role
            // BASIC = 10, PRO = 30

            const result = await prisma.$transaction([
                // Grant BASIC users 10 credits
                prisma.user.updateMany({
                    where: { role: 'BASIC', dubbingCredits: 0 },
                    data: { dubbingCredits: 10 }
                }),
                // Grant PRO users 30 credits
                prisma.user.updateMany({
                    where: { role: 'PRO', dubbingCredits: 0 },
                    data: { dubbingCredits: 30 }
                }),
                // Grant ADMIN users 999 credits (unlimited testing)
                prisma.user.updateMany({
                    where: { role: 'ADMIN' },
                    data: { dubbingCredits: 999 }
                }),
            ]);

            return res.status(200).json({
                success: true,
                message: 'Credits granted to all users based on role',
                result
            });
        }

        if (action === 'grant-one') {
            const { email, credits } = req.body;
            if (!email || !credits) {
                return res.status(400).json({ error: 'Missing email or credits' });
            }

            const user = await prisma.user.update({
                where: { email },
                data: { dubbingCredits: { increment: credits } }
            });

            return res.status(200).json({
                success: true,
                message: `Granted ${credits} credits to ${email}`,
                user: { email: user.email, dubbingCredits: user.dubbingCredits }
            });
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('Grant credits error:', error);
        return res.status(500).json({ error: error.message });
    }
}
