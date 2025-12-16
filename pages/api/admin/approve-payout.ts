import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { payoutId } = req.body;
  const payout = await prisma.payoutRequest.findUnique({
    where: { id: payoutId },
    include: { affiliate: true },
  });

  if (!payout || payout.status !== 'PENDING') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // Làm tròn xuống trăm nghìn
  const amountApproved = Math.floor(payout.amountRequested.toNumber() / 100000) * 100000;

  // Update payout
  await prisma.payoutRequest.update({
    where: { id: payoutId },
    data: {
      amountApproved,
      status: 'PAID',
      processedAt: new Date(),
    },
  });

  // Trừ totalCommission của affiliate
  await prisma.user.update({
    where: { id: payout.affiliateId },
    data: { totalCommission: { decrement: amountApproved } },
  });

  res.status(200).json({ success: true, message: 'Đã duyệt chi trả thành công!' });
}