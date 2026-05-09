// pages/api/partner/resellers.ts
// Phase 7: Get partner resellers list

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
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
    // Get referrals
    const referrals = await prisma.user.findMany({
      where: { referredBy: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        youtubeChannels: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const resellers = referrals.map(r => ({
      id: r.id,
      name: r.name || 'Unknown',
      email: r.email,
      status: r.role === 'FREE' ? 'FREE' : 'ACTIVE',
      subscribedAt: r.createdAt.toISOString(),
      revenue: r.role === 'FREE' ? 0 : 500000,
      channelCount: r.youtubeChannels.length,
    }));

    return res.status(200).json({ resellers });
  } catch (error: any) {
    console.error('[partner/resellers] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch resellers' });
  }
}
