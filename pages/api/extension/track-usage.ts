// pages/api/extension/track-usage.ts - Theo dõi lượt sử dụng tính năng
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

interface TrackResponse {
    success: boolean;
    remainingToday?: number;
    limitReached?: boolean;
    error?: string;
}

// Giới hạn cho user FREE
const FREE_LIMITS: Record<string, number> = {
    'seo-score': 3,      // 3 lần/ngày
    'ab-tester': 2,      // 2 lần/ngày
    'ai-suggest': 0,     // Khóa hoàn toàn
    'channel-spy': 0,    // Khóa hoàn toàn
    'trends': 3,         // 3 lần/ngày
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TrackResponse>
) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { email, feature } = req.body;

        if (!email || !feature) {
            return res.status(400).json({ success: false, error: 'Missing email or feature' });
        }

        // Tìm user
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                role: true,
                dailyUsage: true,
                maxDailyUsage: true,
                lastUsageDate: true,
                membershipExpiry: true,
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Check membership còn hạn không
        const now = new Date();
        const expiry = user.membershipExpiry;
        const isExpired = expiry ? new Date(expiry) < now : true;
        const effectiveRole = (user.role !== 'FREE' && isExpired) ? 'FREE' : user.role;

        // Nếu là Pro → không giới hạn
        const isPro = ['CREATIVE', 'SUPER', 'VIP'].includes(effectiveRole);
        if (isPro) {
            return res.status(200).json({
                success: true,
                remainingToday: 999,
                limitReached: false
            });
        }

        // User FREE → check giới hạn
        const limit = FREE_LIMITS[feature] ?? 3;

        // Nếu tính năng bị khóa hoàn toàn
        if (limit === 0) {
            return res.status(200).json({
                success: false,
                remainingToday: 0,
                limitReached: true,
                error: 'Feature locked for FREE users'
            });
        }

        // Check và reset daily usage nếu sang ngày mới
        const today = new Date().toDateString();
        const lastUsage = user.lastUsageDate ? new Date(user.lastUsageDate).toDateString() : null;

        let currentUsage = user.dailyUsage;
        if (lastUsage !== today) {
            currentUsage = 0;
        }

        // Check đã hết lượt chưa
        if (currentUsage >= limit) {
            return res.status(200).json({
                success: false,
                remainingToday: 0,
                limitReached: true,
                error: 'Daily limit reached'
            });
        }

        // Tăng usage
        await prisma.user.update({
            where: { id: user.id },
            data: {
                dailyUsage: currentUsage + 1,
                lastUsageDate: new Date()
            }
        });

        return res.status(200).json({
            success: true,
            remainingToday: limit - currentUsage - 1,
            limitReached: false
        });

    } catch (error: any) {
        console.error('Track usage error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
