// pages/api/marketplace/stats.ts
// Phase 5: Get marketplace statistics

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get aggregate stats
    const [stats, nicheStats] = await Promise.all([
      prisma.marketplaceListing.aggregate({
        where: { status: 'ACTIVE' },
        _count: { id: true },
        _avg: { askingPrice: true, cpm: true },
        _sum: { subscriberCount: true },
      }),
      prisma.marketplaceListing.groupBy({
        by: ['niche'],
        where: { status: 'ACTIVE', niche: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    const topNiches = nicheStats.map(n => n.niche).filter(Boolean) as string[];

    return res.status(200).json({
      totalListings: stats._count.id || 0,
      avgPrice: stats._avg.askingPrice || 0,
      avgCPM: stats._avg.cpm || 0,
      topNiches,
    });
  } catch (error: any) {
    console.error('[marketplace/stats] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
