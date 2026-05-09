// API endpoint to get AI Coach usage stats
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { AI_COACH_LIMITS } from '@/lib/ai-coach-config';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userRole = user.role || 'FREE';
        const dailyLimit = AI_COACH_LIMITS[userRole] || AI_COACH_LIMITS.FREE;

        // Count today's AI Coach usage
        const now = new Date();
        const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const usedToday = await prisma.event.count({
            where: {
                userId: user.id,
                name: 'AI_COACH_CHAT',
                createdAt: {
                    gte: startOfDay,
                },
            },
        });

        const remaining = Math.max(0, dailyLimit - usedToday);

        return res.status(200).json({
            success: true,
            data: {
                used: usedToday,
                limit: dailyLimit,
                remaining,
                role: userRole,
                resetsAt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            },
        });
    } catch (error) {
        console.error('AI Coach usage error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
