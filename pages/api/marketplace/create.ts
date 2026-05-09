// pages/api/marketplace/create.ts
// Phase 5: Create marketplace listing for selling a channel

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    channelId,
    channelUrl,
    channelTitle,
    subscriberCount,
    avgViewsPerVideo,
    totalViews,
    videoCount,
    cpm,
    niche,
    askingPrice,
    currency = 'VND',
    description,
    reasonForSelling,
    includedContent,
    screenshots = [],
    analyticsProof,
  } = req.body;

  // Validate required fields
  if (!subscriberCount || !askingPrice) {
    return res.status(400).json({ error: 'Missing required fields: subscriberCount, askingPrice' });
  }

  if (subscriberCount < 100) {
    return res.status(400).json({ error: 'Channel must have at least 100 subscribers' });
  }

  try {
    // Check if user already has an active listing for this channel
    const existing = await prisma.marketplaceListing.findFirst({
      where: {
        OR: [
          { channelId: channelId || undefined },
          { channelUrl: channelUrl || undefined },
        ],
        userId: session.user.id,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'You already have an active listing for this channel' });
    }

    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const listing = await prisma.marketplaceListing.create({
      data: {
        userId: session.user.id,
        channelId: channelId || `external_${Date.now()}`,
        channelUrl,
        channelTitle,
        channelThumbnail: analyticsProof?.thumbnailUrl,
        subscriberCount: parseInt(subscriberCount),
        avgViewsPerVideo: parseFloat(avgViewsPerVideo) || 0,
        totalViews: BigInt(parseInt(totalViews) || 0),
        videoCount: parseInt(videoCount) || 0,
        cpm: parseFloat(cpm) || 0,
        niche,
        askingPrice: parseFloat(askingPrice),
        currency,
        description,
        reasonForSelling,
        includedContent,
        screenshots,
        analyticsProof,
        status: 'PENDING', // Requires admin verification
        expiresAt,
      },
    });

    return res.status(201).json({
      listing,
      message: 'Listing created. It will be published after admin verification.',
    });
  } catch (error: any) {
    console.error('[marketplace/create] Error:', error);
    return res.status(500).json({ error: 'Failed to create listing' });
  }
}
