import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import crypto from 'crypto';
import { processPaidPayment } from '@/lib/payment-processing';

function verifyPayOSSignature(data: Record<string, any>, signature: string): boolean {
    if (!process.env.PAYOS_CHECKSUM_KEY) return false;
    const sortedKeys = Object.keys(data).sort();
    const signData = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
    const calculatedSignature = crypto
        .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY)
        .update(signData)
        .digest('hex');
    return calculatedSignature === signature;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            message: 'PayOS webhook endpoint is active'
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const webhookData = req.body;

        if (!webhookData || Object.keys(webhookData).length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Webhook verification successful'
            });
        }

        const { code, desc, data, signature } = webhookData;

        if (code === undefined || code === null) {
            return res.status(200).json({
                success: true,
                message: 'Webhook is ready'
            });
        }

        if (code !== '00') {
            return res.status(200).json({
                success: true,
                message: `Payment not successful: ${desc || 'unknown'}`
            });
        }

        if (!data || !signature || !verifyPayOSSignature(data, signature)) {
            console.error('[PayOS] Invalid or missing webhook signature.');
            return res.status(200).json({ success: false, message: 'Invalid signature' });
        }

        const orderCode = data.orderCode;
        if (!orderCode) {
            return res.status(200).json({
                success: true,
                message: 'Webhook received without orderCode'
            });
        }

        const result = await processPaidPayment({
            orderCode,
            txn: data?.transactionDateTime || null,
        });

        if (result.reason === 'ORDER_NOT_FOUND') {
            return res.status(200).json({
                success: true,
                message: 'Webhook received for unknown orderCode'
            });
        }

        if (result.processed) {
            try {
                const paymentRequest = await prisma.paymentRequest.findUnique({
                    where: { orderCode: String(orderCode) },
                });
                const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
                const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

                if (paymentRequest && TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
                    const licenseInfo = result.licenseKey ? `\nLicense Key: ${result.licenseKey}` : '';
                    const msg = `THANH TOAN THANH CONG\n------------------------------------\n- Khach: ${paymentRequest.email}\n- So tien: ${paymentRequest.amount.toLocaleString('vi-VN')} d\n- Goi: ${paymentRequest.role}\n- Ma don: ${orderCode}${licenseInfo}\n------------------------------------\nGoi da duoc kich hoat tu dong.`;

                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        chat_id: TELEGRAM_CHAT_ID,
                        text: msg,
                    });
                }
            } catch (err) {
                console.error('[PayOS] Error sending Telegram:', err);
            }
        }

        return res.status(200).json({
            success: true,
            message: result.processed ? 'Payment processed successfully' : 'Payment already processed',
            data: {
                userId: result.user?.id,
                email: result.user?.email,
                role: result.user?.role,
                licenseKey: result.licenseKey,
            }
        });
    } catch (error: any) {
        console.error('Error processing webhook:', error);
        return res.status(200).json({
            success: false,
            message: 'Error processing webhook: ' + error.message
        });
    }
}
