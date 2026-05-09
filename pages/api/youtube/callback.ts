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
    // Enable CORS if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const session = await getServerSession(req, res, authOptions);
    
    console.log('[YouTube Callback] Session check:', {
        hasSession: !!session,
        hasEmail: !!session?.user?.email,
        userId: (session?.user as any)?.id,
        userRole: (session?.user as any)?.role,
    });

    if (!session || !session.user?.email) {
        console.log('[YouTube Callback] No session - redirecting to login');
        return res.redirect('/?error=Unauthorized');
    }

    const { code, error } = req.query;
    
    // Handle user denied consent
    if (error) {
        console.log('[YouTube Callback] User denied consent:', error);
        return res.redirect('/tools/video-pipeline?error=AccessDenied');
    }

    if (!code || typeof code !== 'string') {
        console.log('[YouTube Callback] No code provided');
        return res.redirect('/tools/video-pipeline?error=NoCode');
    }

    try {
        // 1. Exchange Code for Tokens
        console.log('[YouTube Callback] Exchanging code for tokens...');
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        console.log('[YouTube Callback] Tokens received:', {
            hasAccessToken: !!tokens.access_token,
            hasRefreshToken: !!tokens.refresh_token,
            expiryDate: tokens.expiry_date,
        });

        // 2. Get Channel Info
        console.log('[YouTube Callback] Fetching channel info...');
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const response = await youtube.channels.list({
            part: ['snippet', 'statistics'],
            mine: true
        });

        if (!response.data.items || response.data.items.length === 0) {
            console.log('[YouTube Callback] No channels found for this account');
            return res.redirect('/tools/video-pipeline?error=NoChannelFound');
        }

        const channel = response.data.items[0];
        const { title, thumbnails } = channel.snippet!;
        const { subscriberCount, viewCount, videoCount } = channel.statistics!;
        
        console.log('[YouTube Callback] Channel data:', {
            channelId: channel.id,
            title,
            subscriberCount,
            viewCount,
            videoCount,
        });

        // 3. Upsert Channel to DB
        const userId = (session.user as any).id;
        console.log('[YouTube Callback] Saving channel for user:', userId);

        const savedChannel = await prisma.youTubeChannel.upsert({
            where: { channelId: channel.id! },
            update: {
                userId: userId,
                title: title || '',
                thumbnail: thumbnails?.medium?.url || thumbnails?.default?.url || '',
                subCount: parseInt(subscriberCount || '0'),
                viewCount: viewCount || '0',
                videoCount: parseInt(videoCount || '0'),
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiry: new Date(tokens.expiry_date || Date.now() + 3600000),
                lastSync: new Date()
            },
            create: {
                userId: userId,
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
        
        console.log('[YouTube Callback] Channel saved successfully:', savedChannel.id);

        // 4. Redirect back to video pipeline with success
        return res.redirect('/tools/video-pipeline?success=ChannelConnected');

    } catch (error: any) {
        console.error('[YouTube Callback] Error:', error.message, error.stack);
        return res.redirect('/tools/video-pipeline?error=AuthFailed');
    }
}
