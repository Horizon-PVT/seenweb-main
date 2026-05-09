// pages/api/user/subscription.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.email) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Mock subscription data - thay bằng database query thực tế
        const mockUserRoles: Record<string, { plan: string; expiresAt: string; daysRemaining: number }> = {
            'admin@seenweb.com': { plan: 'FACTORY', expiresAt: '2026-12-31', daysRemaining: 237 },
            'creator@test.com': { plan: 'CREATOR', expiresAt: '2026-06-30', daysRemaining: 53 },
            'starter@test.com': { plan: 'STARTER', expiresAt: '2026-05-15', daysRemaining: 7 },
        };

        const userPlan = (session.user as any).role || 'FREE';
        
        if (userPlan === 'FREE') {
            return res.status(200).json({
                success: true,
                subscription: {
                    plan: 'FREE',
                    expiresAt: null,
                    daysRemaining: null,
                }
            });
        }

        // Tìm mock data hoặc tạo default
        const mockData = mockUserRoles[session.user.email] || {
            plan: userPlan,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            daysRemaining: 30,
        };

        return res.status(200).json({
            success: true,
            subscription: mockData,
        });
    } catch (error) {
        console.error('Subscription API error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
