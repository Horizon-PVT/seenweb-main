// pages/api/payment/create-payos-link.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import crypto from 'crypto';

// PayOS API endpoint
const PAYOS_API_URL = 'https://api-merchant.payos.vn/v2/payment-requests';

// Generate signature for PayOS
function generateSignature(data: any, checksumKey: string): string {
    const sortedKeys = Object.keys(data).sort();
    const signData = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
    return crypto.createHmac('sha256', checksumKey).update(signData).digest('hex');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const {
        email,
        amount,
        plan,
        role = 'CREATIVE',
        note = '',
        referralCode = null
    } = req.body;

    try {
        // 1. Validate required fields
        if (!amount || !email || !plan) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: amount, email, or plan.'
            });
        }

        // 2. Generate unique order code
        const orderCode = Number(String(Date.now()).slice(-8));

        // 3. Prepare payment info
        const paymentInfoObject = {
            plan,
            role,
            amount,
            note,
            referralCode,
            timestamp: new Date().toISOString()
        };

        const paymentInfoString = JSON.stringify(paymentInfoObject);

        // 4. Create payment request in database
        const newPayment = await prisma.paymentRequest.create({
            data: {
                email,
                amount,
                orderCode: String(orderCode),
                role,
                status: 'PENDING_PAYOS',
                paymentInfo: paymentInfoString,
            }
        });

        // 5. Create PayOS payment link via HTTP API
        const paymentData = {
            orderCode,
            amount,
            description: `${plan}`.substring(0, 25), // PayOS limit
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success?orderCode=${orderCode}`,
        };

        // Generate signature
        const signatureData = {
            amount: paymentData.amount,
            cancelUrl: paymentData.cancelUrl,
            description: paymentData.description,
            orderCode: paymentData.orderCode,
            returnUrl: paymentData.returnUrl,
        };

        const signature = generateSignature(signatureData, process.env.PAYOS_CHECKSUM_KEY!);

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
        } else {
            console.error('PayOS Error:', response.data);
            return res.status(500).json({
                success: false,
                error: response.data.desc || 'Failed to create payment link'
            });
        }

    } catch (error: any) {
        console.error("Error creating PayOS payment link:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error: ' + (error.response?.data?.desc || error.message)
        });
    }
}
