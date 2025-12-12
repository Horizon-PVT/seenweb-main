// pages/api/payos/webhook.ts - FIXED: QUERY PAYMENTREQUEST BY ORDERCODE + UPDATE USER
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PayOS } from '@payos/node';

const prisma = new PrismaClient();
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Webhook ready' });
  }

  if (req.method === 'POST') {
    try {
      const webhookData = payos.webhooks.verify(req.body);
      console.log('PayOS Webhook verified:', webhookData);

      if (webhookData.code === '00' && webhookData.status === 'PAID') {
        const orderCode = webhookData.orderCode.toString();

        // ✅ QUERY PAYMENTREQUEST BY ORDERCODE
        const paymentReq = await prisma.paymentRequest.findUnique({
          where: { orderCode: orderCode },
          include: { user: true }  // Nếu có relation
        });

        if (!paymentReq) {
          console.error('No PaymentRequest for orderCode:', orderCode);
          return res.status(400).json({ error: 'Order not found' });
        }

        const userEmail = paymentReq.email;
        const targetRole = paymentReq.role;  // CREATIVE/SUPER từ create
        const creditsIncrement = targetRole === 'SUPER' ? 1000 : 100;

        // ✅ UPDATE USER ROLE + CREDITS
        await prisma.user.updateMany({
          where: { email: userEmail },
          data: {
            role: targetRole,
            credits: {  // Giả định User có field credits, nếu chưa add vào schema
              increment: creditsIncrement
            },
            maxDailyUsage: targetRole === 'SUPER' ? 100 : 20  // Tăng limit
          }
        });

        // ✅ UPDATE PAYMENTREQUEST STATUS
        await prisma.paymentRequest.update({
          where: { orderCode: orderCode },
          data: { status: 'SUCCESS', paidAt: new Date() }
        });

        console.log(`PAYOS UPGRADE SUCCESS → ${userEmail} to ${targetRole} (+${creditsIncrement} credits, Order: ${orderCode})`);
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Webhook ERROR:', error);
      return res.status(400).json({ error: 'Invalid webhook' });
    } finally {
      await prisma.$disconnect();
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}