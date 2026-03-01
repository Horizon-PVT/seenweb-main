import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const videos = await prisma.videoTip.findMany({
            where: {
                type: 'PORTFOLIO',
                status: 'PUBLISHED',
            },
            orderBy: { displayOrder: 'asc' },
            select: {
                id: true,
                title: true,
                youtubeUrl: true,
                youtubeId: true,
                thumbnailUrl: true,
                description: true,
            },
        });

        return res.status(200).json(videos);
    } catch (error: any) {
        console.error('Portfolio videos API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
