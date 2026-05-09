// API endpoint to seed knowledge base to Pinecone
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { batchUpsertDocuments } from '@/lib/pinecone';
import { getAllDocuments } from '@/lib/youtube-knowledge';
import { getAllVidIQDocuments } from '@/lib/vidiq-knowledge';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Only allow admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'phamanhtung.jp@gmail.com';
    if (session.user.email !== adminEmail) {
        return res.status(403).json({ error: 'Admin only' });
    }

    try {
        // Get documents from both knowledge bases
        const youtubeDocuments = getAllDocuments();
        const vidiqDocuments = getAllVidIQDocuments();

        const allDocuments = [
            ...youtubeDocuments.map(doc => ({
                id: doc.id,
                content: doc.content,
                metadata: { category: doc.category, source: 'youtube-knowledge' },
            })),
            ...vidiqDocuments.map(doc => ({
                id: doc.id,
                content: doc.content,
                metadata: { category: doc.category, source: doc.source },
            })),
        ];

        // Use batch upsert with REST API
        const result = await batchUpsertDocuments(allDocuments);

        return res.status(200).json({
            success: true,
            message: `Seeded ${result.success} documents, ${result.failed} failed`,
            total: allDocuments.length,
            youtubeCount: youtubeDocuments.length,
            vidiqCount: vidiqDocuments.length,
            details: result,
        });

    } catch (error: any) {
        console.error('Seed error:', error);
        return res.status(500).json({
            error: 'Failed to seed knowledge base',
            details: error.message
        });
    }
}
