// pages/api/payos/webhook.ts - FINAL (role + maxDailyUsage, unlimited paid)
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

// Middleware lấy raw body
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
    bodyParser: false,  // Disable auto-parse để lấy raw body (fix signature)
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Webhook ready' });
  }

  if (req.method === 'POST') {
    try {
      const rawBody = await getRawBody(req as IncomingMessage);
      const signature = req.headers['x-payos-signature'] as string;

      console.log('Webhook signature:', signature ? signature.substring(0, 10) + '...' : 'MISSING');

      if (!signature) {
        console.error('Missing x-payos-signature header');
        return res.status(200).json({ success: true, error: 'Missing signature' });
      }

      const webhookData = payos.webhooks.verify(rawBody, signature);
      console.log('PayOS Webhook verified:', { code: webhookData.code, orderCode: webhookData.orderCode, description: webhookData.description });

      if (webhookData.code === '00' && webhookData.status === 'PAID') {
        let userEmail = webhookData.userEmail || webhookData.accountNumber;
        if (!userEmail) {
          const description = webhookData.description || webhookData.desc || '';
          const emailMatch = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          userEmail = emailMatch ? emailMatch[1] : null;
        }

        if (!userEmail) {
          console.error('No email in webhook description:', webhookData.description);
          return res.status(200).json({ success: true, error: 'No user email' });
        }

        const description = webhookData.description || '';
        const planMatch = description.match(/ST|VT/i);  // ST=SÁNG TẠO, VT=VƯỢT TRỘI
        const targetRole = planMatch ? (planMatch[0].toUpperCase() === 'ST' ? 'CREATIVE' : 'SUPER') : 'CREATIVE';

        console.log('Updating user:', { email: userEmail, role: targetRole });

        // ✅ UPDATE PRISMA USER (role + maxDailyUsage unlimited for paid)
        const updateResult = await prisma.user.updateMany({
          where: { email: userEmail },
          data: {
            role: targetRole,
            maxDailyUsage: 9999  // Unlimited for CREATIVE/SUPER (2 tools for FREE)
          }
        });

        console.log('Prisma update result:', updateResult.count, 'users affected');

        const orderCode = webhookData.orderCode?.toString();
        if (orderCode) {
          await prisma.paymentRequest.update({
            where: { orderCode },
            data: { status: 'SUCCESS', paidAt: new Date() }
          });
          console.log(`Payment status updated for orderCode: ${orderCode}`);
        }

        console.log(`Webhook: Đã cập nhật User ${userEmail} lên ${targetRole} thành công!`);
      } else {
        console.log('Non-success event:', webhookData.code, webhookData.status);
      }

      return res.status(200).json({ success: true });

    } catch (error: any) {
      console.error('Webhook error:', error.message || error);
      return res.status(200).json({ success: true, error: 'Internal processing error' });
    } finally {
      await prisma.$disconnect();
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}