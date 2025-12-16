// Import thêm ở đầu file
import { Decimal } from '@prisma/client/runtime/library';

// Sau dòng update user.role và membershipExpiry
if (user.referrerId) {
  const referrer = await prisma.user.findUnique({ where: { id: user.referrerId } });
  if (!referrer || !referrer.isAffiliate) return;

  // Rate từ .env (anh đã có sẵn)
  const RATE_NEW = parseFloat(process.env.AFF_RATE_NEW || '0.30');
  const RATE_UPGRADE = parseFloat(process.env.AFF_RATE_UPGRADE || '0.15');
  const RATE_RENEW = parseFloat(process.env.AFF_RATE_RENEW || '0.10');

  // Detect type
  const oldRole = user.role; // Role TRƯỚC khi update (backup trước khi update user)
  let type: string;
  let baseAmount = paymentRequest.amount; // 349000 hoặc 649000

  if (oldRole === 'FREE') {
    type = 'FIRST_PURCHASE';
    baseAmount = paymentRequest.amount * RATE_NEW;
  } else if (oldRole === 'CREATIVE' && newRole === 'SUPER') {
    type = 'UPGRADE';
    baseAmount = 300000 * RATE_UPGRADE; // Chênh lệch 649k - 349k
  } else {
    type = 'RENEWAL';
    baseAmount = paymentRequest.amount * RATE_RENEW;
  }

  const amount = new Decimal(baseAmount);

  await prisma.commission.create({
    data: {
      referrerId: referrer.id,
      referredUserId: user.id,
      paymentRequestId: paymentRequest.id,
      type,
      amount,
      status: 'APPROVED', // Auto approved vì admin duyệt
    },
  });

  await prisma.user.update({
    where: { id: referrer.id },
    data: { totalCommission: { increment: amount } },
  });
}