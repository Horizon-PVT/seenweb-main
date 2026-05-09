import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const trends = await prisma.videoTip.findMany({
            where: {
                status: 'PUBLISHED',
                type: 'TRENDING'
            },
            orderBy: { displayOrder: 'asc' },
            select: {
                id: true,
                title: true,
                youtubeId: true,
                thumbnailUrl: true,
                description: true, // This contains the "Analysis"
                tags: true, // This contains "Category"
                type: true,
                createdAt: true
            }
        });

        return res.status(200).json(trends);
    } catch (error) {
        console.error('Trends API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
