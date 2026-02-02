import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

function extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user?.email !== 'phamanhtung.jp@gmail.com' || (session.user as any)?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        if (req.method === 'GET') {
            const videos = await prisma.videoTip.findMany({ orderBy: { displayOrder: 'asc' } });
            return res.status(200).json(videos);
        }

        if (req.method === 'POST') {
            const { title, youtubeUrl, thumbnailUrl, description, tags, status, displayOrder } = req.body;
            if (!title || !youtubeUrl) return res.status(400).json({ error: 'Title and YouTube URL are required' });

            const youtubeId = extractYouTubeId(youtubeUrl);
            if (!youtubeId) return res.status(400).json({ error: 'Invalid YouTube URL' });

            const defaultThumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

            const video = await prisma.videoTip.create({
                data: {
                    title,
                    youtubeUrl,
                    youtubeId,
                    thumbnailUrl: thumbnailUrl || defaultThumbnail,
                    description: description || null,
                    tags: tags || null,
                    status: status || 'DRAFT',
                    displayOrder: displayOrder || 0,
                    type: req.body.type || 'TUTORIAL',
                },
            });
            return res.status(201).json(video);
        }

        if (req.method === 'PUT') {
            const { id, title, youtubeUrl, thumbnailUrl, description, tags, status, displayOrder } = req.body;
            if (!id) return res.status(400).json({ error: 'Video ID is required' });

            const updateData: any = {};
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description || null;
            if (tags !== undefined) updateData.tags = tags || null;
            if (status !== undefined) updateData.status = status;
            if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
            if (req.body.type !== undefined) updateData.type = req.body.type;

            if (youtubeUrl !== undefined) {
                const youtubeId = extractYouTubeId(youtubeUrl);
                if (!youtubeId) return res.status(400).json({ error: 'Invalid YouTube URL' });
                updateData.youtubeUrl = youtubeUrl;
                updateData.youtubeId = youtubeId;
                if (!thumbnailUrl) {
                    updateData.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
                }
            }

            if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;

            const video = await prisma.videoTip.update({ where: { id }, data: updateData });
            return res.status(200).json(video);
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;
            if (!id) return res.status(400).json({ error: 'Video ID is required' });
            await prisma.videoTip.delete({ where: { id } });
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Video API error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
