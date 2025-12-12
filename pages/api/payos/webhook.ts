// pages/api/payos/webhook.ts - FIXED: RAW BODY + SIGNATURE VERIFY + PRISMA UPDATE
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PayOS } from '@payos/node';
import { IncomingMessage } from 'http';  // For raw-body

const prisma = new PrismaClient();
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

// Middleware to get raw body (PayOS verify cần raw string)
async function getRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
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
    let prismaDisconnected = false;
    try {
      // ✅ RAW BODY + SIGNATURE FROM HEADERS
      const rawBody = await getRawBody(req as IncomingMessage);
      const bodyString = rawBody.toString('utf8');
      const signature = req.headers['x-payos-signature'] as string;

      if (!signature) {
        console.error('Missing x-payos-signature header');
        return res.status(400).json({ error: 'Missing signature' });
      }

      console.log('Webhook raw body length:', bodyString.length, 'Signature:', signature.substring(0, 10) + '...');

      // ✅ VERIFY WITH RAW BODY + SIGNATURE (SDK docs: sync method)
      const webhookData = payos.webhooks.verify(bodyString, signature);
      console.log('PayOS Webhook verified OK:', { code: webhookData.code, orderCode: webhookData.orderCode, desc: webhookData.desc });

      if (webhookData.code === '00' && webhookData.status === 'PAID') {
        const orderCode = webhookData.orderCode.toString();
        console.log('Processing PAID order:', orderCode);

        // ✅ QUERY PAYMENTREQUEST
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

        console.log('Updating user:', { email: userEmail, role: targetRole, increment: creditsIncrement });

        // ✅ UPDATE USER
        const updateResult = await prisma.user.updateMany({
          where: { email: userEmail },
          data: {
            role: targetRole,
            credits: { increment: creditsIncrement },
            maxDailyUsage: targetRole === 'SUPER' ? 100 : 20
          }
        });

        if (updateResult.count === 0) {
          console.warn('No user updated for email:', userEmail);
        }

        // ✅ UPDATE PAYMENT STATUS
        await prisma.paymentRequest.update({
          where: { orderCode },
          data: { status: 'SUCCESS', paidAt: new Date() }
        });

        console.log(`PAYOS UPGRADE FULL SUCCESS → ${userEmail} to ${targetRole} (+${creditsIncrement} credits, updated ${updateResult.count} users)`);
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
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}