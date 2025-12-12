// pages/api/payos/create-payment.ts - FIX DESCRIPTION THÊM EMAIL SHORT, WEBHOOK TỰ NÂNG ROLE
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { PayOS } from '@payos/node';

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'Chưa đăng nhập' });

  const { amount, plan, isYearly } = req.body;
  const planName = plan === 'creative' ? 'ST' : 'VT'; // Rút gọn plan
  const shortEmail = session.user.email.substring(0, 10); // Rút gọn email <10 ký tự
  const description = `SeenYT-${planName}-${shortEmail}`; // ← FIX: Thêm short email, tổng <25 ký tự

  try {
    const requestData = {
      orderCode: Number(Date.now().toString().slice(-10)),
      amount: Number(amount),
      description, // ← FIX: Description có email để webhook parse
      items: [
        {
          name: `Gói ${plan === 'creative' ? 'SÁNG TẠO' : 'VƯỢT TRỢI'}`,
          quantity: 1,
          price: Number(amount),
        },
      ],
      returnUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/success`,
      cancelUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing`,
    };

    const paymentLinkData = await payos.paymentRequests.create(requestData);

    return res.status(200).json({
      qrCode: paymentLinkData.qrCode,
      checkoutUrl: paymentLinkData.checkoutUrl,
    });
  } catch (error: any) {
    console.error('PayOS SDK error:', error);
    return res.status(400).json({ error: error.message || 'Lỗi PayOS' });
  }
}