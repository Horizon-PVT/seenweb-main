// pages/api/payos/webhook.ts - MERGED FIX: Verify đúng + Fallback DB + Unlimited Usage (KHÔNG Credit)
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

// Middleware lấy raw body (BẮT BUỘC cho PayOS verify)
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
    bodyParser: false,  // BẮT BUỘC: Tắt auto-parse để lấy raw body
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'PayOS Webhook ready & listening!' });
  }

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  let prismaDisconnected = false;
  try {
    const rawBody = await getRawBody(req as IncomingMessage);
    const signature = req.headers['x-payos-signature'] as string;

    // Log masked để debug (không leak data)
    console.log('Webhook received:', {
      timestamp: new Date().toISOString(),
      signature: signature ? signature.substring(0, 10) + '...' : 'MISSING',
      rawBodyLength: rawBody.length,
      maskedBody: rawBody.substring(0, 50) + (rawBody.length > 50 ? '...' : ''),
    });

    if (!signature) {
      console.error('🚨 Missing x-payos-signature header');
      return res.status(200).json({ success: true, error: 'Missing signature - ignored' });
    }

    // 1. XÁC THỰC CHỮ KÝ (ĐÚNG API: Trên rawBody, KHÔNG parse trước)
    const webhookDataRaw = payos.webhooks.verify(rawBody, signature);  // Trả về parsed data nếu valid
    console.log('✅ Webhook verified:', { code: webhookDataRaw.code, orderCode: webhookDataRaw.orderCode });

    // Parse chỉ sau verify (an toàn)
    const data = webhookDataRaw;  // Đã parsed từ library
    if (!data || !data.data) {
      console.error('Webhook: Invalid Payload Structure');
      return res.status(200).json({ success: false, message: 'Invalid Payload Structure' });
    }

    const webhookData = data.data;

    // 2. XỬ LÝ TRẠNG THÁI THÀNH CÔNG ('00' là PAID)
    if (webhookData.code === '00') {
      const description = webhookData.description || '';
      console.log('Webhook SUCCESS received. Description:', description);

      // 3. TRÍCH XUẤT EMAIL (Merged: Regex + Fallback DB)
      const userEmailMatch = description.match(/(\S+@\S+\.\S+)$/);
      let userEmail = userEmailMatch ? userEmailMatch[1].toLowerCase().trim() : null;
      const orderCode = webhookData.orderCode?.toString();

      if (!userEmail) {
        console.error('ERROR: Could not extract user email from description:', description);
        // Fallback: Tìm từ PaymentRequest
        if (orderCode) {
          const request = await prisma.paymentRequest.findUnique({ where: { orderCode } });
          if (request) userEmail = request.email;
        }
        if (!userEmail) {
          return res.status(200).json({ success: false, reason: 'Missing Email' });
        }
      }

      // 4. XÁC ĐỊNH ROLE VÀ USAGE (Dùng includes() của anh - robust)
      let targetRole = 'FREE';
      const maxDailyUsage = 9999;  // Unlimited cho paid

      if (description.includes('SÁNG TẠO')) {
        targetRole = 'CREATIVE';
      } else if (description.includes('VƯỢT TRỘI')) {
        targetRole = 'SUPER';
      } else {
        console.log('WARN: Cannot determine plan from description. Not updating role.');
        return res.status(200).json({ success: true });
      }

      // 5. CẬP NHẬT PRISMA USER
      console.log('Attempting to update user:', { email: userEmail, role: targetRole, maxUsage: maxDailyUsage });
      const updateResult = await prisma.user.updateMany({
        where: { email: userEmail },
        data: {
          role: targetRole,
          maxDailyUsage: maxDailyUsage,
        },
      });
      console.log('Prisma user update result:', updateResult.count, 'users affected.');

      // 6. CẬP NHẬT PAYMENT REQUEST (Thêm paidAt)
      if (orderCode) {
        await prisma.paymentRequest.update({
          where: { orderCode },
          data: { status: 'SUCCESS', paidAt: new Date() },  // Merge: Có paidAt
        });
        console.log(`Prisma payment request status updated for order: ${orderCode}`);
      }

    } else {
      console.log(`Non-success event for order ${webhookData.orderCode}: ${webhookData.code}`);
    }

    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('🚨 FATAL Webhook error:', error.message || error);
    return res.status(200).json({ success: true, error: 'Internal processing error' });
  } finally {
    if (!prismaDisconnected) {
      await prisma.$disconnect();
      prismaDisconnected = true;
    }
  }
}