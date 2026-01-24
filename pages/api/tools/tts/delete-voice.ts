import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { voiceId } = req.body;

        if (!voiceId) {
            return res.status(400).json({ error: 'Voice ID is required' });
        }

        // Verify ownership
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete from DB
        const result = await prisma.userVoice.deleteMany({
            where: {
                userId: user.id,
                voiceId: voiceId
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Voice not found or not owned by you' });
        }

        res.status(200).json({ success: true, message: 'Voice deleted successfully' });

    } catch (error: any) {
        console.error('Delete Voice Error:', error);
        res.status(500).json({ error: error.message });
    }
}
