// pages/api/payment/payos-webhook.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import crypto from 'crypto';

// Verify PayOS webhook signature
function verifyWebhookSignature(data: any, signature: string, checksumKey: string): boolean {
    const sortedKeys = Object.keys(data).sort();
    const signData = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
    const expectedSignature = crypto.createHmac('sha256', checksumKey).update(signData).digest('hex');
    return signature === expectedSignature;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Allow GET for PayOS verification check
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

        // Handle verification/test requests from PayOS (empty or test data)
        if (!webhookData || Object.keys(webhookData).length === 0) {
            console.log('PayOS verification request received');
            return res.status(200).json({
                success: true,
                message: 'Webhook verification successful'
            });
        }

        // PayOS sends webhook with data and signature
        const { code, desc, data, signature } = webhookData;

        // Log incoming webhook for debugging
        console.log('PayOS Webhook received:', JSON.stringify(webhookData));

        // Handle if no code provided (verification request)
        if (code === undefined || code === null) {
            console.log('PayOS test/verification webhook received');
            return res.status(200).json({
                success: true,
                message: 'Webhook is ready'
            });
        }

        // Check if payment was successful (code 00)
        if (code !== '00') {
            console.log(`Payment not successful: ${desc}`);
            return res.status(200).json({
                success: true,
                message: 'Payment not successful, no action taken'
            });
        }

        const orderCode = data?.orderCode;
        if (!orderCode) {
            return res.status(400).json({
                success: false,
                error: 'Missing orderCode in webhook data'
            });
        }

        // Find payment request in database
        const paymentRequest = await prisma.paymentRequest.findUnique({
            where: { orderCode: String(orderCode) }
        });

        if (!paymentRequest) {
            console.error(`Payment request not found for orderCode: ${orderCode}`);
            return res.status(404).json({
                success: false,
                error: 'Payment request not found'
            });
        }

        // Check if already processed
        if (paymentRequest.status === 'PAID') {
            console.log(`Payment ${orderCode} already processed`);
            return res.status(200).json({
                success: true,
                message: 'Payment already processed'
            });
        }

        // Parse payment info
        const paymentInfo = paymentRequest.paymentInfo
            ? JSON.parse(paymentRequest.paymentInfo)
            : {};

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: paymentRequest.email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: paymentRequest.email,
                    role: paymentRequest.role,
                    membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                }
            });
        } else {
            const currentExpiry = user.membershipExpiry || new Date();
            const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();

            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    role: paymentRequest.role,
                    membershipExpiry: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
                }
            });
        }

        // Update payment request status
        await prisma.paymentRequest.update({
            where: { id: paymentRequest.id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                userId: user.id,
                txn: data?.transactionDateTime || null,
            }
        });

        // Handle affiliate commission if referral code exists
        if (paymentInfo.referralCode) {
            try {
                const referrer = await prisma.user.findUnique({
                    where: { affiliateCode: paymentInfo.referralCode }
                });

                if (referrer) {
                    const commissionRate = parseFloat(process.env.AFF_RATE_NEW || '0.30');
                    const commissionAmount = paymentRequest.amount * commissionRate;

                    await prisma.commission.create({
                        data: {
                            referrerId: referrer.id,
                            referredUserId: user.id,
                            paymentRequestId: paymentRequest.id,
                            type: 'NEW',
                            amount: commissionAmount,
                            status: 'APPROVED',
                            approvedAt: new Date(),
                        }
                    });

                    await prisma.user.update({
                        where: { id: referrer.id },
                        data: {
                            totalCommission: {
                                increment: commissionAmount
                            }
                        }
                    });
                }
            } catch (commissionError) {
                console.error('Error processing commission:', commissionError);
            }
        }

        // Send Telegram notification
        try {
            const telegramMessage = `
✅ THANH TOÁN THÀNH CÔNG!
------------------------------------
- Khách: ${paymentRequest.email}
- Số tiền: ${paymentRequest.amount.toLocaleString('vi-VN')} đ
- Gói: ${paymentInfo.plan} (${paymentRequest.role})
- Mã đơn: ${orderCode}
- User ID: <code>${user.id}</code>
------------------------------------
Gói đã được kích hoạt tự động! 🎉
`;

            await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify/telegram`, {
                message: telegramMessage
            });
        } catch (telegramError) {
            console.error('Error sending Telegram notification:', telegramError);
        }

        // Return success
        return res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                userId: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error: any) {
        console.error("Error processing PayOS webhook:", error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error: ' + error.message
        });
    }
}
