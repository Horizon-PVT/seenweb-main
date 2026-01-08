// pages/api/admin/apply-bonus-days.ts - API to apply bonus days to a user
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Admin only
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user?.email !== 'phamanhtung.jp@gmail.com' || (session.user as any)?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, bonusDays, note } = req.body;

        if (!email || !bonusDays) {
            return res.status(400).json({ error: 'Email and bonusDays are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: { id: true, email: true, role: true, membershipExpiry: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found with this email' });
        }

        // Calculate new expiry date
        const now = new Date();
        const currentExpiry = user.membershipExpiry && user.membershipExpiry > now
            ? user.membershipExpiry
            : now;

        const newExpiry = new Date(currentExpiry);
        newExpiry.setDate(newExpiry.getDate() + parseInt(bonusDays));

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                membershipExpiry: newExpiry,
                // If user is FREE, upgrade to STARTER
                role: user.role === 'FREE' ? 'STARTER' : user.role
            }
        });

        console.log(`[Bonus Days] Applied +${bonusDays} days to ${email}. New expiry: ${newExpiry.toISOString()}. Note: ${note || 'N/A'}`);

        return res.status(200).json({
            success: true,
            email: user.email,
            bonusDays: parseInt(bonusDays),
            newExpiry: newExpiry.toISOString(),
            message: `Đã tặng thêm ${bonusDays} ngày cho ${email}`
        });

    } catch (error: any) {
        console.error('Apply bonus days error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
