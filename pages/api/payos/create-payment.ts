// pages/api/payos/create-payment.ts - FIXED: LƯU PAYMENTREQUEST + FULL EMAIL
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { PayOS } from '@payos/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'Chưa đăng nhập' });

  const { amount, plan } = req.body;  // Bỏ isYearly nếu không dùng
  const targetRole = plan === 'creative' ? 'CREATIVE' : 'SUPER';
  const planName = plan === 'creative' ? 'ST' : 'VT';
  const shortEmail = session.user.email.substring(0, 10);  // Giữ ngắn cho desc
  const description = `SeenYT-${planName}-${shortEmail}`;  // <25 ký tự OK

  const orderCode = Number(Date.now().toString().slice(-10));  // Unique orderCode

  try {
    // ✅ LƯU PAYMENTREQUEST TRƯỚC KHI TẠO LINK
    await prisma.paymentRequest.create({
      data: {
        orderCode: orderCode.toString(),  // String cho unique
        email: session.user.email,  // Full email để webhook update
        role: targetRole,  // Target role
        amount: Number(amount),
        status: 'PENDING'
      }
    });

    const requestData = {
      orderCode: orderCode,
      amount: Number(amount),
      description,
      items: [
        {
          name: `Gói ${targetRole}`,
          quantity: 1,
          price: Number(amount),
        },
      ],
      returnUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/success?orderCode=${orderCode}`,
      cancelUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing`,
    };

    const paymentLinkData = await payos.paymentRequests.create(requestData);

    return res.status(200).json({
      qrCode: paymentLinkData.qrCode,
      checkoutUrl: paymentLinkData.checkoutUrl,
    });
  } catch (error: any) {
    console.error('PayOS CREATE ERROR:', error);
    return res.status(400).json({ error: error.message || 'Lỗi tạo payment' });
  } finally {
    await prisma.$disconnect();  // Đóng connect
  }
}