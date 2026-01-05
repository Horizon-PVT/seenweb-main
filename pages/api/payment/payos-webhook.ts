// pages/api/payment/payos-webhook.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

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

        // Handle empty request (verification)
        if (!webhookData || Object.keys(webhookData).length === 0) {
            console.log('PayOS verification request received (empty body)');
            return res.status(200).json({
                success: true,
                message: 'Webhook verification successful'
            });
        }

        const { code, desc, data } = webhookData;

        // Log incoming webhook
        console.log('PayOS Webhook received:', JSON.stringify(webhookData));

        // Handle if no code provided (verification/test)
        if (code === undefined || code === null) {
            console.log('PayOS test webhook received (no code)');
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

        // Get orderCode from data
        const orderCode = data?.orderCode;
        if (!orderCode) {
            console.log('No orderCode in webhook data - treating as test');
            return res.status(200).json({
                success: true,
                message: 'Webhook received (no orderCode - test data)'
            });
        }

        // Find payment request in database
        const paymentRequest = await prisma.paymentRequest.findUnique({
            where: { orderCode: String(orderCode) }
        });

        if (!paymentRequest) {
            console.log(`Payment not found for orderCode: ${orderCode} - possibly test data`);
            return res.status(200).json({
                success: true,
                message: 'Webhook received (order not found - test data)'
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

        // Handle affiliate commission
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
                            totalCommission: { increment: commissionAmount }
                        }
                    });
                }
            } catch (err) {
                console.error('Error processing commission:', err);
            }
        }

        // Send Telegram notification
        try {
            const msg = `✅ THANH TOÁN THÀNH CÔNG!\n----\n- Khách: ${paymentRequest.email}\n- Số tiền: ${paymentRequest.amount.toLocaleString('vi-VN')} đ\n- Gói: ${paymentInfo.plan || 'N/A'} (${paymentRequest.role})\n- Mã đơn: ${orderCode}\n----\nGói đã được kích hoạt tự động! 🎉`;

            await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify/telegram`, {
                message: msg
            });
        } catch (err) {
            console.error('Error sending Telegram:', err);
        }

        // Return success
        return res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            data: { userId: user.id, email: user.email, role: user.role }
        });

    } catch (error: any) {
        console.error("Error processing webhook:", error);
        // Still return 200 to avoid PayOS retries
        return res.status(200).json({
            success: false,
            message: 'Error processing webhook: ' + error.message
        });
    }
}
