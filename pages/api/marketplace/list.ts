// pages/api/marketplace/list.ts
// Phase 5: Channel Marketplace - Browse and filter listings

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    page = '1',
    limit = '20',
    status = 'ACTIVE',
    minSubs,
    maxSubs,
    minPrice,
    maxPrice,
    niche,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = Math.min(parseInt(limit as string), 50);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (status !== 'ALL') {
    where.status = status || 'ACTIVE';
  }

  if (minSubs) {
    where.subscriberCount = { ...where.subscriberCount, gte: parseInt(minSubs as string) };
  }

  if (maxSubs) {
    where.subscriberCount = { ...where.subscriberCount, lte: parseInt(maxSubs as string) };
  }

  if (minPrice) {
    where.askingPrice = { ...where.askingPrice, gte: parseFloat(minPrice as string) };
  }

  if (maxPrice) {
    where.askingPrice = { ...where.askingPrice, lte: parseFloat(maxPrice as string) };
  }

  if (niche) {
    where.niche = { contains: niche as string, mode: 'insensitive' };
  }

  const orderBy: any = {};
  orderBy[sortBy as string] = sortOrder;

  const [listings, total] = await Promise.all([
    prisma.marketplaceListing.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        // Exclude sensitive seller info
      },
    }),
    prisma.marketplaceListing.count({ where }),
  ]);

  // Fix BigInt serialization
  const serializedListings = listings.map(l => ({
    ...l,
    totalViews: l.totalViews.toString(),
  }));

  return res.status(200).json({
    listings: serializedListings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}
