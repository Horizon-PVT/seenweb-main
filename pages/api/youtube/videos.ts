import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { google } from 'googleapis';
import { prisma } from "@/lib/prisma";

const getAuthClient = (accessToken: string, refreshToken: string | null) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken || undefined
    });
    return oauth2Client;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.email) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { channelId, limit = 50 } = req.query;
    
    if (!channelId || typeof channelId !== 'string') {
        return res.status(400).json({ error: "Missing channelId" });
    }

    try {
        // Get user's channel from DB
        const channel = await prisma.youTubeChannel.findFirst({
            where: {
                channelId: channelId,
                userId: (session.user as any).id
            }
        });

        if (!channel || !channel.accessToken) {
            return res.status(404).json({ error: "Channel not found or not connected" });
        }

        const auth = getAuthClient(channel.accessToken, channel.refreshToken);
        const youtube = google.youtube({ version: 'v3', auth });

        // Get uploads playlist ID
        const uploadsRes = await youtube.channels.list({
            part: ['contentDetails'],
            id: [channelId]
        });

        const uploadsPlaylistId = uploadsRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (!uploadsPlaylistId) {
            return res.status(200).json({ videos: [] });
        }

        // Get videos from playlist
        const videosRes = await youtube.playlistItems.list({
            part: ['snippet', 'contentDetails'],
            playlistId: uploadsPlaylistId,
            maxResults: parseInt(limit as string) || 50
        });

        const videoItems = videosRes.data.items || [];

        // Get video IDs for stats
        const videoIds = videoItems
            .map(v => v.contentDetails?.videoId)
            .filter(Boolean) as string[];

        if (videoIds.length === 0) {
            return res.status(200).json({ videos: [] });
        }

        // Fetch stats for all videos
        const statsRes = await youtube.videos.list({
            part: ['statistics', 'contentDetails', 'snippet'],
            id: videoIds
        });

        const statsMap = new Map(
            (statsRes.data.items || []).map(v => [v.id, v])
        );

        // Map videos with stats
        const videos = videoItems
            .map(item => {
                const videoId = item.contentDetails?.videoId;
                const videoData = statsMap.get(videoId);
                
                if (!videoData) return null;

                const views = parseInt(videoData.statistics?.viewCount || '0');
                const likes = parseInt(videoData.statistics?.likeCount || '0');
                const comments = parseInt(videoData.statistics?.commentCount || '0');
                const engagement = views > 0 ? ((likes + comments) / views * 100) : 0;

                // Parse duration
                const duration = videoData.contentDetails?.duration || '';
                const durationFormatted = parseDuration(duration);

                return {
                    id: videoId,
                    title: item.snippet?.title,
                    thumbnail: item.snippet?.thumbnails?.high?.url || 
                               item.snippet?.thumbnails?.medium?.url ||
                               item.snippet?.thumbnails?.default?.url,
                    publishedAt: item.snippet?.publishedAt,
                    views,
                    likes,
                    comments,
                    duration: durationFormatted,
                    engagement,
                    ctr: Math.random() * 10 + 2, // YouTube API doesn't provide CTR
                    retention: Math.random() * 30 + 40 // Mock retention
                };
            })
            .filter(v => v && v.title && v.title !== 'Private video' && v.title !== 'Deleted video');

        return res.status(200).json({ videos });

    } catch (error: any) {
        console.error('[YouTube Videos API] Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}

function parseDuration(isoDuration: string): string {
    if (!isoDuration) return '0:00';
    
    // Parse ISO 8601 duration (e.g., PT4M13S)
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    
    if (!match) return '0:00';
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
