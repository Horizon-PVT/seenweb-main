// pages/api/payos/webhook.ts - FIXED RAW BODY + SIGNATURE HEADER VERIFY (12/2025)
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PayOS } from '@payos/node';
import { IncomingMessage } from 'http';

const prisma = new PrismaClient();
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

// Middleware lấy raw body (PayOS cần raw string cho verify)
async function getRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export const config = {
  api: {
    bodyParser: false,  // Disable auto-parse để lấy raw body
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('PayOS GET validate OK');
    return res.status(200).json({ message: 'Webhook ready' });
  }

  if (req.method === 'POST') {
    let disconnected = false;
    try {
      // ✅ LẤY RAW BODY + SIGNATURE HEADER
      const rawBody = await getRawBody(req as IncomingMessage);
      const signature = req.headers['x-payos-signature'] as string;

      if (!signature) {
        console.error('Missing x-payos-signature header');
        return res.status(400).json({ error: 'Missing signature' });
      }

      console.log('Webhook raw body length:', rawBody.length, 'Signature preview:', signature.substring(0, 10) + '...');

      // ✅ VERIFY VỚI RAW BODY + SIGNATURE (SDK method đúng)
      const webhookData = payos.webhooks.verify(rawBody, signature);
      console.log('PayOS Webhook verified full:', { code: webhookData.code, orderCode: webhookData.orderCode, desc: webhookData.desc });

      if (webhookData.code === '00' && webhookData.status === 'PAID') {
        const orderCode = webhookData.orderCode.toString();
        console.log('Processing PAID order:', orderCode);

        // ✅ QUERY PAYMENTREQUEST BY ORDERCODE
        const paymentReq = await prisma.paymentRequest.findUnique({
          where: { orderCode },
        });

        if (!paymentReq) {
          console.error('No PaymentRequest found for orderCode:', orderCode);
          return res.status(400).json({ error: 'Order not found' });
        }

        const userEmail = paymentReq.email;
        const targetRole = paymentReq.role;
        const creditsIncrement = targetRole === 'SUPER' ? 1000 : 100;

        console.log('Updating user details:', { email: userEmail, role: targetRole, increment: creditsIncrement });

        // ✅ UPDATE USER ROLE + CREDITS
        const updateResult = await prisma.user.updateMany({
          where: { email: userEmail },
          data: {
            role: targetRole,
            credits: { increment: creditsIncrement },
            maxDailyUsage: targetRole === 'SUPER' ? 100 : 20
          }
        });

        console.log('User update result:', updateResult.count, 'users affected');

        // ✅ UPDATE PAYMENT STATUS
        await prisma.paymentRequest.update({
          where: { orderCode },
          data: { status: 'SUCCESS', paidAt: new Date() }
        });

        console.log(`PAYOS UPGRADE SUCCESS → ${userEmail} to ${targetRole} (+${creditsIncrement} credits, Order: ${orderCode})`);
      } else {
        console.log('Non-PAID event:', webhookData.code, webhookData.status);
      }

      return res.status(200).json({ success: true });

    } catch (error: any) {
      console.error('Webhook ERROR full:', error.message || error);
      return res.status(400).json({ error: 'Webhook failed' });
    } finally {
      if (!disconnected) {
        await prisma.$disconnect();
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}