// pages/api/affiliate/stats.ts
// API for affiliate statistics

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = session.user.id;
    const { prisma } = await import('@/lib/prisma');
    
    const [referralCount, earnings] = await Promise.all([
      prisma.user.count({ where: { referrerId: userId } }),
      prisma.commission.aggregate({
        where: { referrerId: userId, status: 'APPROVED' },
        _sum: { amount: true }
      })
    ]);
    
    const stats = {
      totalEarnings: earnings._sum.amount || 0,
      totalReferrals: referralCount,
      pendingPayout: 0,
      tier: 'SILVER' as const
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Affiliate stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
