// API endpoint to create Pinecone index
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getPinecone } from '@/lib/pinecone';

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
        const pinecone = getPinecone();
        const indexName = process.env.PINECONE_INDEX || 'seenyt-knowledge';

        // Check if index exists
        const indexes = await pinecone.listIndexes();
        const existingIndex = indexes.indexes?.find(i => i.name === indexName);

        if (existingIndex) {
            return res.status(200).json({
                success: true,
                message: `Index "${indexName}" already exists`,
                exists: true,
            });
        }

        // Create the index
        await pinecone.createIndex({
            name: indexName,
            dimension: 1536, // OpenAI ada-002 embedding dimension
            metric: 'cosine',
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1',
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: `Index "${indexName}" created successfully`,
            created: true,
        });

    } catch (error: any) {
        console.error('Create index error:', error);
        return res.status(500).json({
            error: 'Failed to create index',
            details: error.message
        });
    }
}
