// pages/api/extension/auth-check.ts - Kiểm tra quyền user cho Extension
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

interface UserInfo {
    email: string;
    name: string | null;
    image: string | null;
    role: string;
    dailyUsage: number;
    maxDailyUsage: number;
    membershipExpiry: string | null;
    isPro: boolean;
}

interface AuthResponse {
    authenticated: boolean;
    user?: UserInfo;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<AuthResponse>
) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ authenticated: false, error: 'Method not allowed' });
    }

    try {
        // Lấy email từ query hoặc body
        const email = req.query.email as string || req.body?.email;

        if (!email) {
            return res.status(200).json({ authenticated: false });
        }

        // Tìm user trong DB hoặc tạo mới (Auto-Signup)
        let user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                dailyUsage: true,
                maxDailyUsage: true,
                membershipExpiry: true,
                lastUsageDate: true,
            }
        });

        if (!user) {
            // Auto create free user
            user = await prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0],
                    role: 'FREE',
                    dailyUsage: 0,
                    maxDailyUsage: 3
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                    role: true,
                    dailyUsage: true,
                    maxDailyUsage: true,
                    membershipExpiry: true,
                    lastUsageDate: true,
                }
            });
        }

        // Check và reset daily usage nếu sang ngày mới
        const today = new Date().toDateString();
        const lastUsage = user.lastUsageDate ? new Date(user.lastUsageDate).toDateString() : null;

        let currentDailyUsage = user.dailyUsage;
        if (lastUsage !== today) {
            // Reset usage cho ngày mới
            await prisma.user.update({
                where: { email },
                data: {
                    dailyUsage: 0,
                    lastUsageDate: new Date()
                }
            });
            currentDailyUsage = 0;
        }

        // Check membership còn hạn không
        const now = new Date();
        const expiry = user.membershipExpiry;

        // ADMIN always valid
        const isAdmin = user.role === 'ADMIN';
        const isExpired = (!isAdmin && expiry) ? new Date(expiry) < now : (!isAdmin && true);

        // Nếu hết hạn và role không phải FREE/ADMIN → đã hết membership
        const effectiveRole = (!isAdmin && user.role !== 'FREE' && isExpired) ? 'FREE' : user.role;

        // Xác định có phải Pro không (CREATIVE, SUPER, VIP, ADMIN)
        const isPro = ['CREATIVE', 'SUPER', 'VIP', 'ADMIN'].includes(effectiveRole);

        return res.status(200).json({
            authenticated: true,
            user: {
                email: user.email,
                name: user.name,
                image: user.image,
                role: effectiveRole,
                dailyUsage: currentDailyUsage,
                maxDailyUsage: user.maxDailyUsage,
                membershipExpiry: expiry ? expiry.toISOString() : null,
                isPro,
            }
        });

    } catch (error: any) {
        console.error('Auth check error:', error);
        return res.status(500).json({ authenticated: false, error: 'Internal server error' });
    }
}
