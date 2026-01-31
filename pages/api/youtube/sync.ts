
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { google } from 'googleapis';
import { prisma } from "@/lib/prisma";

// Helper to refresh token
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

    try {
        // 1. Get User Channels
        const channels = await prisma.youTubeChannel.findMany({
            where: { userId: (session.user as any).id }
        });

        if (channels.length === 0) {
            return res.status(200).json({ success: true, message: "No channels to sync" });
        }

        const syncResults = [];

        // 2. Loop and Sync
        for (const channel of channels) {
            if (!channel.accessToken) continue;

            const auth = getAuthClient(channel.accessToken, channel.refreshToken);
            const youtube = google.youtube({ version: 'v3', auth });

            try {
                // A. Fetch Channel Stats & Upload Playlist ID
                const channelRes = await youtube.channels.list({
                    part: ['statistics', 'contentDetails', 'snippet'],
                    id: [channel.channelId]
                });

                const info = channelRes.data.items?.[0];
                if (!info) continue;

                const uploadsPlaylistId = info.contentDetails?.relatedPlaylists?.uploads;
                const newStats = {
                    subCount: parseInt(info.statistics?.subscriberCount || '0'),
                    viewCount: info.statistics?.viewCount || '0',
                    videoCount: parseInt(info.statistics?.videoCount || '0'),
                    title: info.snippet?.title || channel.title,
                    thumbnail: info.snippet?.thumbnails?.high?.url || channel.thumbnail,
                };

                // B. Fetch Recent Videos (from Uploads Playlist - Costs 1 unit vs 100 for Search)
                let recentVideos = [];
                if (uploadsPlaylistId) {
                    const videoRes = await youtube.playlistItems.list({
                        part: ['snippet', 'contentDetails'],
                        playlistId: uploadsPlaylistId,
                        maxResults: 5
                    });

                    recentVideos = (videoRes.data.items || []).map(item => ({
                        id: item.contentDetails?.videoId,
                        title: item.snippet?.title,
                        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url,
                        publishedAt: item.snippet?.publishedAt,
                        // Note: playlistItems does NOT return viewCount. 
                        // To get views, we theoretically need videos.listById, but for "Recent List" maybe we don't strictly need views yet?
                        // Or we can do a batch call. For "Health Check", views are important.
                        // Let's do a quick batch fetch for these IDs.
                    }));

                    // Fetch details (Views) for these videos
                    if (recentVideos.length > 0) {
                        const videoIds = recentVideos.map(v => v.id).join(',');
                        const statsRes = await youtube.videos.list({
                            part: ['statistics'],
                            id: videoIds.split(',') // array arg
                        });

                        // Map stats back
                        const statsMap = new Map(statsRes.data.items?.map(i => [i.id, i.statistics]));
                        recentVideos = recentVideos.map(v => ({
                            ...v,
                            views: statsMap.get(v.id)?.viewCount || '0',
                            likes: statsMap.get(v.id)?.likeCount || '0',
                            comments: statsMap.get(v.id)?.commentCount || '0'
                        }));
                    }
                }

                // C. Calculate Basic Health Score (Mock logic for now, refine later)
                // Score = (Avg Views of last 5 videos / Subs) * Factor? 
                // Simple version: Just store data, frontend display "Excellent" if growing.
                const healthSummary = {
                    lastUpdated: new Date().toISOString(),
                    status: 'GOOD' // Placeholder
                };

                // D. Update DB
                await prisma.youTubeChannel.update({
                    where: { id: channel.id },
                    data: {
                        title: newStats.title,
                        thumbnail: newStats.thumbnail,
                        subCount: newStats.subCount,
                        viewCount: newStats.viewCount,
                        videoCount: newStats.videoCount,
                        recentVideos: JSON.stringify(recentVideos), // Store as JSON string
                        channelHealth: JSON.stringify(healthSummary),
                        lastSync: new Date()
                    }
                });

                syncResults.push({ id: channel.id, title: newStats.title, newVideos: recentVideos.length });

            } catch (err: any) {
                console.error(`Error syncing channel ${channel.title}:`, err.message);
                // Detect invalid_grant -> Token expired and refresh failed -> flag user?
                if (err.message && err.message.includes('invalid_grant')) {
                    // Maybe update status to "Disconnected"
                }
            }
        }

        return res.status(200).json({ success: true, synced: syncResults });

    } catch (error: any) {
        console.error("Sync Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
