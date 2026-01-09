import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const channels = await prisma.chatChannel.findMany({
            orderBy: {
                createdAt: 'asc', // Or specific logic
            },
            select: {
                id: true,
                slug: true,
                name: true,
                icon: true,
                description: true,
                isLocked: true,
                _count: {
                    select: { messages: true }
                }
            }
        });

        // Custom order if needed, but 'asc' creation usually puts Global first if seeded first.
        return res.status(200).json(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
