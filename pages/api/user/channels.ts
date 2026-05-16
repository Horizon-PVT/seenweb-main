import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { CHANNEL_LIMITS } from '@/lib/roles';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === 'DELETE') {
        const { id } = req.body;

        console.log('[API] DELETE Request:', { id, user: (session.user as any).id });

        if (!id) return res.status(400).json({ error: "Missing channel ID" });

        try {
            // Ensure the channel belongs to the authenticated user
            const result = await prisma.youTubeChannel.deleteMany({
                where: {
                    id: id,
                    userId: (session.user as any).id
                }
            });

            console.log('[API] Delete Result:', result);

            if (result.count === 0) {
                // Determine if it was ID mismatch or User mismatch
                return res.status(404).json({ error: "Channel not found or unauthorized" });
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('[API] Delete Failed:', error);
            return res.status(500).json({ error: "Failed to delete channel" });
        }
    }

    if (req.method === 'GET') {
        try {
            const userId = (session.user as any).id;
            console.log('[API /channels] Fetching for user:', userId);
            
            const channels = await prisma.youTubeChannel.findMany({
                where: { userId: userId },
                select: {
                    id: true,
                    channelId: true,
                    title: true,
                    thumbnail: true,
                    subCount: true,
                    viewCount: true,
                    videoCount: true,
                    lastSync: true,
                    recentVideos: true,
                    channelHealth: true
                }
            });
            
            console.log('[API /channels] Found channels:', channels.length);

            // PARSE JSON FIELDS (legacy storage might be string)
            const parsedChannels = channels.map(channel => ({
                ...channel,
                recentVideos: typeof channel.recentVideos === 'string' ? JSON.parse(channel.recentVideos || '[]') : channel.recentVideos,
                channelHealth: typeof channel.channelHealth === 'string' ? JSON.parse(channel.channelHealth || '{}') : channel.channelHealth
            }));

            // FETCH USER LIMITS
            const user = await prisma.user.findUnique({
                where: { id: (session.user as any).id },
                select: { role: true, extraChannelSlots: true }
            });

            const userRole = user?.role || 'FREE';
            const extraSlots = user?.extraChannelSlots || 0;

            const baseLimit = CHANNEL_LIMITS[userRole] ?? 0;
            const totalLimit = (userRole === 'ADMIN') ? 999 : (baseLimit + extraSlots);

            return res.status(200).json({
                success: true,
                channels: parsedChannels,
                limit: totalLimit
            });
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch channels" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
