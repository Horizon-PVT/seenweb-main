import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { google } from 'googleapis';
import { prisma } from "@/lib/prisma";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/youtube/callback`
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
        return res.redirect('/dashboard?error=Unauthorized');
    }

    const { code } = req.query;

    if (!code || typeof code !== 'string') {
        return res.redirect('/dashboard?error=NoCode');
    }

    try {
        // 1. Exchange Code for Tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // 2. Get Channel Info
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const response = await youtube.channels.list({
            part: ['snippet', 'statistics'],
            mine: true
        });

        if (!response.data.items || response.data.items.length === 0) {
            return res.redirect('/dashboard?error=NoChannelFound');
        }

        const channel = response.data.items[0];
        const { title, thumbnails } = channel.snippet!;
        const { subscriberCount, viewCount, videoCount } = channel.statistics!;

        // 3. Upsert Channel to DB
        // We update if exists (re-auth), or create new
        // BUT we must check if this channel is already linked to ANOTHER user? 
        // For now, let's assume one channel -> one user. 
        // Ideally we might want to allow re-linking.

        await prisma.youTubeChannel.upsert({
            where: { channelId: channel.id! },
            update: {
                userId: (session.user as any).id, // Re-assign ownership if needed
                title: title || '',
                thumbnail: thumbnails?.medium?.url || thumbnails?.default?.url || '',
                subCount: parseInt(subscriberCount || '0'),
                viewCount: viewCount || '0',
                videoCount: parseInt(videoCount || '0'),
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token, // Only updates if new one provided
                tokenExpiry: new Date(tokens.expiry_date || Date.now() + 3600000),
                lastSync: new Date()
            },
            create: {
                userId: (session.user as any).id,
                channelId: channel.id!,
                title: title || '',
                thumbnail: thumbnails?.medium?.url || thumbnails?.default?.url || '',
                subCount: parseInt(subscriberCount || '0'),
                viewCount: viewCount || '0',
                videoCount: parseInt(videoCount || '0'),
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiry: new Date(tokens.expiry_date || Date.now() + 3600000),
                lastSync: new Date()
            }
        });

        return res.redirect('/dashboard?success=ChannelConnected');

    } catch (error: any) {
        console.error('YouTube Auth Callback Error:', error);
        return res.redirect('/dashboard?error=AuthFailed');
    }
}
