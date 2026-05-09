// pages/api/calendar/events.ts
// Phase 2: Content Calendar API - CRUD events

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    const { startDate, endDate, channelId, status } = req.query;

    const where: any = { userId };

    if (startDate && endDate) {
      where.scheduledDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (channelId) {
      where.channelId = channelId;
    }

    if (status) {
      where.status = status;
    }

    const events = await prisma.contentCalendar.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
    });

    return res.status(200).json({ events });
  }

  if (req.method === 'POST') {
    const {
      channelId,
      platform = 'youtube',
      scheduledDate,
      title,
      script,
      thumbnailUrl,
      videoUrl,
      seoTitle,
      seoDescription,
      seoTags,
      niche,
      targetAudience,
      notes,
    } = req.body;

    if (!title || !scheduledDate) {
      return res.status(400).json({ error: 'Missing required fields: title, scheduledDate' });
    }

    const event = await prisma.contentCalendar.create({
      data: {
        userId,
        channelId,
        platform,
        scheduledDate: new Date(scheduledDate),
        title,
        script,
        thumbnailUrl,
        videoUrl,
        seoTitle,
        seoDescription,
        seoTags: seoTags || [],
        niche,
        targetAudience,
        notes,
        status: 'DRAFT',
      },
    });

    return res.status(201).json({ event });
  }

  if (req.method === 'PUT') {
    const { id, ...data } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing event id' });
    }

    // Verify ownership
    const existing = await prisma.contentCalendar.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = await prisma.contentCalendar.update({
      where: { id },
      data: {
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      },
    });

    return res.status(200).json({ event });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing event id' });
    }

    // Verify ownership
    const existing = await prisma.contentCalendar.findFirst({
      where: { id: id as string, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await prisma.contentCalendar.delete({
      where: { id: id as string },
    });

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
