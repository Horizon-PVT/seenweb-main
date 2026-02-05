// AI Coach Settings API - Save/Load personalization preferences
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export interface AICoachSettings {
    nickname?: string;           // What AI should call the user
    channelInfo?: string;        // Channel description, niche, audience
    personality?: string;        // How AI should respond (friendly, professional, etc)
    personalityTags?: string[];  // Direct, Encouraging, Witty, Gen Z, etc
    helpStyle?: string;          // Types of help needed
    additionalInfo?: string;     // Any other context
    enabled?: boolean;           // Enable for new chats
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Use raw query to avoid Prisma type issues before regenerate
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    }) as any;

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // GET - Load settings
    if (req.method === 'GET') {
        const settings = (user.aiCoachSettings as AICoachSettings) || {};
        return res.status(200).json({ success: true, data: settings });
    }

    // POST - Save settings
    if (req.method === 'POST') {
        try {
            const settings: AICoachSettings = req.body;

            // Validate
            if (settings.nickname && settings.nickname.length > 50) {
                return res.status(400).json({ error: 'Nickname quá dài (max 50 ký tự)' });
            }
            if (settings.channelInfo && settings.channelInfo.length > 500) {
                return res.status(400).json({ error: 'Thông tin kênh quá dài (max 500 ký tự)' });
            }
            if (settings.personality && settings.personality.length > 300) {
                return res.status(400).json({ error: 'Mô tả tính cách quá dài (max 300 ký tự)' });
            }
            if (settings.helpStyle && settings.helpStyle.length > 500) {
                return res.status(400).json({ error: 'Phong cách hỗ trợ quá dài (max 500 ký tự)' });
            }
            if (settings.additionalInfo && settings.additionalInfo.length > 500) {
                return res.status(400).json({ error: 'Thông tin bổ sung quá dài (max 500 ký tự)' });
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { aiCoachSettings: settings } as any
            });

            return res.status(200).json({ success: true, message: 'Đã lưu cài đặt' });
        } catch (error) {
            console.error('Save AI Coach settings error:', error);
            return res.status(500).json({ error: 'Không thể lưu cài đặt' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
