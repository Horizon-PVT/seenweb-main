// pages/api/partner/stats.ts
// Phase 7: Get partner statistics

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get referral stats
    const referrals = await prisma.user.findMany({
      where: { referrerId: session.user.id },
      select: { id: true, role: true, createdAt: true },
    });

    const activeResellers = referrals.filter(u => u.role !== 'FREE').length;
    const totalRevenue = referrals.length * 500000; // Estimated

    return res.status(200).json({
      totalPartners: referrals.length,
      totalRevenue,
      activeResellers,
      commission: 30,
    });
  } catch (error: any) {
    console.error('[partner/stats] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
