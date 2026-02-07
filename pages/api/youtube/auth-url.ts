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
        return res.status(401).json({ error: "Unauthorized" });
    }

    // 1. Check Plan Limits
    // Fetch user role and extra slots from DB to be fresh
    const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { role: true, extraChannelSlots: true }
    });

    const userRole = user?.role || 'FREE';
    const extraSlots = user?.extraChannelSlots || 0;

    const existingChannels = await prisma.youTubeChannel.count({
        where: { userId: (session.user as any).id }
    });

    const MAX_CHANNELS: Record<string, number> = {
        'FREE': 0,
        'USER': 0,
        'BASIC': 1,
        'PRO': 2,
        'ADMIN': 999
    };

    const baseLimit = MAX_CHANNELS[userRole] || 0;

    // Final Limit logic:
    // If Admin -> Unlimited (999)
    // If Normal -> Base + Extra
    // Example: Pro (2) + 1 Slot = 3
    const totalLimit = (userRole === 'ADMIN') ? 999 : (baseLimit + extraSlots);

    if (existingChannels >= totalLimit) {
        return res.status(403).json({
            error: "Limit Reached",
            message: `Gói hiện tại của bạn chỉ hỗ trợ tối đa ${totalLimit} kênh. Vui lòng mua thêm slot để tiếp tục!`
        });
    }

    // 2. Generate Auth URL
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Critical for Refresh Token
        scope: [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/userinfo.profile'
        ],
        // Force "select_account" to allow picking Brand Accounts
        prompt: 'consent select_account',
        include_granted_scopes: true
    });

    return res.status(200).json({ url });
}
