import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Thứ 2 tuần này
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = await prisma.paymentRequest.aggregate({
      where: { status: { in: ['COMPLETED', 'PAID'] } },
      _count: { id: true },
      _sum: { amount: true },
    });

    const today = await prisma.paymentRequest.aggregate({
      where: { status: { in: ['COMPLETED', 'PAID'] }, createdAt: { gte: todayStart } },
      _count: { id: true },
      _sum: { amount: true },
    });

    const week = await prisma.paymentRequest.aggregate({
      where: { status: { in: ['COMPLETED', 'PAID'] }, createdAt: { gte: weekStart } },
      _count: { id: true },
      _sum: { amount: true },
    });

    const month = await prisma.paymentRequest.aggregate({
      where: { status: { in: ['COMPLETED', 'PAID'] }, createdAt: { gte: monthStart } },
      _count: { id: true },
      _sum: { amount: true },
    });

    res.status(200).json({
      totalOrders: total._count.id,
      totalRevenue: total._sum.amount || 0,
      todayOrders: today._count.id,
      todayRevenue: today._sum.amount || 0,
      weekOrders: week._count.id,
      weekRevenue: week._sum.amount || 0,
      monthOrders: month._count.id,
      monthRevenue: month._sum.amount || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi thống kê' });
  }
}