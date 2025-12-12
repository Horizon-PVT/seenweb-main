// pages/api/payos/webhook.ts - FIXED ASYNC PROMISE + TIMEOUT PRISMA
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
    console.log('PayOS GET validate OK');
    return res.status(200).json({ message: 'Webhook ready' });
  }

  if (req.method === 'POST') {
    let prismaDisconnected = false;
    try {
      const webhookData = payos.webhooks.verify(req.body);
      console.log('PayOS Webhook verified OK:', { code: webhookData.code, orderCode: webhookData.orderCode });

      if (webhookData.code === '00' && webhookData.status === 'PAID') {
        const orderCode = webhookData.orderCode.toString();
        console.log('Processing PAID order:', orderCode);

        // TIMEOUT PRISMA QUERY (5s max)
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Prisma timeout')), 5000));
        const paymentReq = await Promise.race([prisma.paymentRequest.findUnique({ where: { orderCode } }), timeoutPromise]);

        if (!paymentReq) {
          console.error('No PaymentRequest found for orderCode:', orderCode);
          return res.status(400).json({ error: 'Order not found' });
        }

        const userEmail = paymentReq.email;
        const targetRole = paymentReq.role;
        const creditsIncrement = targetRole === 'SUPER' ? 1000 : 100;

        console.log('Updating user:', { email: userEmail, role: targetRole, increment: creditsIncrement });

        // UPDATE USER WITH TIMEOUT
        await Promise.race([
          prisma.user.updateMany({
            where: { email: userEmail },
            data: {
              role: targetRole,
              credits: { increment: creditsIncrement },
              maxDailyUsage: targetRole === 'SUPER' ? 100 : 20
            }
          }),
          timeoutPromise
        ]);

        // UPDATE PAYMENT STATUS
        await prisma.paymentRequest.update({
          where: { orderCode },
          data: { status: 'SUCCESS', paidAt: new Date() }
        });

        console.log(`PAYOS UPGRADE FULL SUCCESS → ${userEmail} to ${targetRole} (+${creditsIncrement} credits)`);
      } else {
        console.log('Non-PAID event:', webhookData.code, webhookData.status);
      }

      return res.status(200).json({ success: true });

    } catch (error: any) {
      console.error('Webhook FULL ERROR:', error.message || error);
      return res.status(400).json({ error: 'Webhook failed' });
    } finally {
      if (!prismaDisconnected) {
        await prisma.$disconnect();
        prismaDisconnected = true;
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}