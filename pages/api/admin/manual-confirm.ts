import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Data từ form admin (adjust nếu anh có field khác)
  const { paymentId, newRole } = req.body;

  const paymentRequest = await prisma.paymentRequest.findUnique({
    where: { id: paymentId },
    include: { user: true },
  });

  if (!paymentRequest || paymentRequest.status !== 'PENDING_MANUAL') {
    return res.status(400).json({ error: 'Invalid payment request' });
  }

  // Backup oldRole trước khi update
  const oldRole = paymentRequest.user.role;

  // Update user role + membershipExpiry (ví dụ +30 ngày, anh adjust nếu cần)
  await prisma.user.update({
    where: { id: paymentRequest.user.id },
    data: {
      role: newRole,
      membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 ngày
    },
  });

  // Update payment status
  await prisma.paymentRequest.update({
    where: { id: paymentId },
    data: {
      status: 'SUCCESS',
      approvedAt: new Date(),
      approvedBy: session.user.email,
    },
  });

  // TÍNH COMMISSION NẾU CÓ REFERRER (logic chuẩn từ snippet anh gửi)
  if (paymentRequest.user.referrerId) {
    const referrer = await prisma.user.findUnique({
      where: { id: paymentRequest.user.referrerId },
    });

    if (referrer && referrer.isAffiliate) {
      // Rate từ .env (anh đã có sẵn)
      const RATE_NEW = parseFloat(process.env.AFF_RATE_NEW || '0.30');
      const RATE_UPGRADE = parseFloat(process.env.AFF_RATE_UPGRADE || '0.15');
      const RATE_RENEW = parseFloat(process.env.AFF_RATE_RENEW || '0.10');

      let type: string;
      let baseAmount = paymentRequest.amount; // 349000 hoặc 649000

      if (oldRole === 'FREE') {
        type = 'FIRST_PURCHASE';
        baseAmount = paymentRequest.amount * RATE_NEW;
      } else if (oldRole === 'CREATIVE' && newRole === 'SUPER') {
        type = 'UPGRADE';
        baseAmount = 300000 * RATE_UPGRADE; // chênh lệch cố định 649k - 349k = 300k
      } else {
        type = 'RENEWAL';
        baseAmount = paymentRequest.amount * RATE_RENEW;
      }

      const amount = new Decimal(baseAmount);

      await prisma.commission.create({
        data: {
          referrerId: referrer.id,
          referredUserId: paymentRequest.user.id,
          paymentRequestId: paymentRequest.id,
          type,
          amount,
          status: 'APPROVED', // Auto approved vì admin duyệt payment
        },
      });

      await prisma.user.update({
        where: { id: referrer.id },
        data: { totalCommission: { increment: amount } },
      });
    }
  }

  res.status(200).json({ success: true, message: 'Duyệt payment và tính commission thành công!' });
}