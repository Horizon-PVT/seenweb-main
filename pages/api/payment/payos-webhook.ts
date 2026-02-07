// pages/api/payment/payos-webhook.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { USAGE_LIMITS } from '@/lib/roles';

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

        // Normalize email to lowercase for case-insensitive matching
        const normalizedEmail = paymentRequest.email.toLowerCase();

        // Find or create user (case-insensitive email lookup)
        let user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: normalizedEmail,
                    mode: 'insensitive'
                }
            }
        });

        // Calculate dubbing credits based on role
        let dubbingCreditsToAdd = 0;
        if (paymentRequest.role === 'BASIC') dubbingCreditsToAdd = 10;
        else if (paymentRequest.role === 'PRO') dubbingCreditsToAdd = 30;

        // ... (User find/create logic above)

        // LOGIC TO DETERMINE UPGRADE TYPE
        // 1. Check if it's a SLOT UPGRADE
        const description = (paymentInfo.plan || '').toString().toLowerCase(); // e.g., "nang cap them 1 slot"
        const note = (paymentInfo.note || '').toString().toLowerCase();

        let extraSlotsToAdd = 0;
        let isSlotUpgrade = false;

        if (description.includes('slot') || note.includes('slot')) {
            isSlotUpgrade = true;
            // Parse number of slots if possible, default to 1
            // Use Regex to find number before "slot" or "channel"?
            // Simplest: Check amount / 139000? Or assume 1 for now based on button logic.
            // But user might buy multiple. Let's rely on amount if description is vague.
            // For now, let's assume safely 1 slot if it's a slot upgrade packet from the modal.
            // Better: Parse "them X slot" from description.
            const match = description.match(/them (\d+) slot/);
            if (match && match[1]) {
                extraSlotsToAdd = parseInt(match[1]);
            } else {
                extraSlotsToAdd = 1; // Default fallback
            }
        }

        // 2. Logic to update User
        if (!user) {
            // New User Creation (Unlikely for slot upgrade but safe to have)
            user = await prisma.user.create({
                data: {
                    email: normalizedEmail, // Use normalized lowercase email
                    role: isSlotUpgrade ? 'PRO' : paymentRequest.role, // If slot upgrade, ensure at least PRO
                    // Safe default: If buying slots, they are likely already PRO.
                    extraChannelSlots: isSlotUpgrade ? extraSlotsToAdd : 0,
                    membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    dubbingCredits: 10, // Default starter
                    maxDailyUsage: USAGE_LIMITS[(isSlotUpgrade ? 'PRO' : paymentRequest.role) as keyof typeof USAGE_LIMITS] || 3,
                }
            });
        } else {
            const currentExpiry = user.membershipExpiry || new Date();
            const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();

            // Prepare update data
            const updateData: any = {
                membershipExpiry: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000), // Extend 30 days
            };

            // If it's a Slot Upgrade, increment slots, DO NOT change role
            if (isSlotUpgrade) {
                updateData.extraChannelSlots = { increment: extraSlotsToAdd };
                // Ensure they are at least PRO/SUPER if they buy slots?
                // Logic: If they are BASIC, buying slots might be weird but allowed.
                // Let's keep role as is.
            } else {
                // Normal Plan Upgrade
                updateData.role = paymentRequest.role;
                updateData.dubbingCredits = { increment: dubbingCreditsToAdd };
                // FIX: Update quota limit based on new role
                updateData.maxDailyUsage = USAGE_LIMITS[paymentRequest.role as keyof typeof USAGE_LIMITS];
            }

            user = await prisma.user.update({
                where: { id: user.id },
                data: updateData
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

        // Send Telegram notification directly
        try {
            const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
            const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

            if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
                const msg = `✅ THANH TOÁN THÀNH CÔNG!\n------------------------------------\n- Khách: ${paymentRequest.email}\n- Số tiền: ${paymentRequest.amount.toLocaleString('vi-VN')} đ\n- Gói: ${paymentInfo.plan || 'N/A'} (${paymentRequest.role})\n- Mã đơn: ${orderCode}\n------------------------------------\nGói đã được kích hoạt tự động! 🎉`;

                await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    chat_id: TELEGRAM_CHAT_ID,
                    text: msg,
                    parse_mode: 'HTML',
                });
                console.log('Telegram notification sent successfully');
            } else {
                console.log('Telegram not configured - skipping notification');
            }
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
