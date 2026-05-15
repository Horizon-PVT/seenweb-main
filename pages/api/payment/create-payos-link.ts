import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import crypto from 'crypto';
import { resolvePaymentPlan } from '@/lib/payment-plans';

const PAYOS_API_URL = 'https://api-merchant.payos.vn/v2/payment-requests';

function generateSignature(data: Record<string, string | number>, checksumKey: string): string {
    const sortedKeys = Object.keys(data).sort();
    const signData = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
    return crypto.createHmac('sha256', checksumKey).update(signData).digest('hex');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
            return res.status(500).json({
                success: false,
                error: 'PayOS is not configured.'
            });
        }

        const { email, payment } = resolvePaymentPlan(req.body);

        // Never trust client-side price or role. This only catches stale/tampered clients early.
        if (req.body.amount && Number(req.body.amount) !== payment.amount) {
            return res.status(400).json({
                success: false,
                error: 'Payment amount does not match the selected plan.'
            });
        }

        const orderCode = Date.now();
        const paymentInfoString = JSON.stringify({
            ...payment,
            timestamp: new Date().toISOString()
        });

        const newPayment = await prisma.paymentRequest.create({
            data: {
                email,
                amount: payment.amount,
                orderCode: String(orderCode),
                role: payment.role,
                status: 'PENDING_PAYOS',
                paymentInfo: paymentInfoString,
            }
        });

        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://seenyt.net').replace(/\/$/, '');
        const paymentData = {
            orderCode,
            amount: payment.amount,
            description: `${payment.plan}`.substring(0, 25),
            cancelUrl: `${appUrl}/pricing`,
            returnUrl: `${appUrl}/success?orderCode=${orderCode}`,
        };

        const signature = generateSignature(paymentData, process.env.PAYOS_CHECKSUM_KEY);

        const response = await axios.post(PAYOS_API_URL, {
            ...paymentData,
            signature,
        }, {
            headers: {
                'x-client-id': process.env.PAYOS_CLIENT_ID,
                'x-api-key': process.env.PAYOS_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.code === '00' && response.data.data?.checkoutUrl) {
            return res.status(200).json({
                success: true,
                message: 'Payment link created successfully',
                data: {
                    paymentUrl: response.data.data.checkoutUrl,
                    orderCode,
                    paymentId: newPayment.id
                }
            });
        }

        console.error('PayOS Error:', response.data);
        return res.status(500).json({
            success: false,
            error: response.data.desc || 'Failed to create payment link'
        });
    } catch (error: any) {
        console.error('Error creating PayOS payment link:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error: ' + (error.response?.data?.desc || error.message)
        });
    }
}
