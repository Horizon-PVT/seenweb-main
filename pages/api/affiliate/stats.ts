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
    
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Mock data - replace with real database queries
    const userId = (session.user as any).id || 'demo';
    
    // Return affiliate stats based on user tier
    const stats = {
      totalEarnings: 0,
      totalReferrals: 0,
      pendingPayout: 0,
      tier: 'SILVER' as const
    };

    // TODO: Query database for real stats
    // Example:
    // const earnings = await prisma.affiliateEarnings.findMany({
    //   where: { userId },
    //   select: { amount: true, status: true }
    // });

    res.status(200).json(stats);
  } catch (error) {
    console.error('Affiliate stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
