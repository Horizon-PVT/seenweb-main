// pages/api/payment/payos-webhook.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import crypto from 'crypto';
import { USAGE_LIMITS } from '@/lib/roles';
import { sendMasterclassWelcomeEmail } from '@/lib/email';

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

        const { code, desc, data, signature } = webhookData;

        // Verify PayOS Signature to prevent spoofing
        if (data && signature) {
            const sortedKeys = Object.keys(data).sort();
            const signData = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
            const calculatedSignature = crypto.createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY!).update(signData).digest('hex');
            
            if (calculatedSignature !== signature) {
                console.error('🚨 CRITICAL: PayOS Webhook invalid signature. Possible spoofing attack!');
                return res.status(200).json({ success: false, message: 'Invalid signature' });
            }
        }

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
        // MASTERCLASS does not currently add dubbing credits. Wait, it doesn't matter.

        // ... (User find/create logic above)

        // LOGIC TO DETERMINE UPGRADE TYPE
        // Read explicit data from paymentInfo instead of parsing text
        const billingCycle = (paymentInfo.billingCycle || 'MONTHLY').toString().toUpperCase();
        const isSlotUpgrade = paymentInfo.isSlotUpgrade === true;
        let extraSlotsToAdd = isSlotUpgrade ? (parseInt(paymentInfo.extraChannelSlots) || 1) : 0;

        // Membership duration based on billing cycle
        const membershipDays = billingCycle === 'YEARLY' ? 365 : 30;

        // 2. Logic to update User
        if (!user) {
            // New User Creation
            const initialRole = isSlotUpgrade ? 'PRO' : (paymentRequest.role === 'MASTERCLASS' ? 'FREE' : paymentRequest.role);
            user = await prisma.user.create({
                data: {
                    email: normalizedEmail, // Use normalized lowercase email
                    role: initialRole,
                    hasMasterclass: paymentRequest.role === 'MASTERCLASS',
                    extraChannelSlots: isSlotUpgrade ? extraSlotsToAdd : 0,
                    membershipExpiry: paymentRequest.role === 'MASTERCLASS' ? null : new Date(Date.now() + membershipDays * 24 * 60 * 60 * 1000),
                    dubbingCredits: 10, // Default starter
                    maxDailyUsage: USAGE_LIMITS[initialRole as keyof typeof USAGE_LIMITS] || 3,
                }
            });
        } else {
            const currentExpiry = user.membershipExpiry || new Date();
            const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();

            // Prepare update data — extend by correct number of days based on billing cycle
            const updateData: any = {
                membershipExpiry: new Date(baseDate.getTime() + membershipDays * 24 * 60 * 60 * 1000),
            };

            // If it's a Slot Upgrade, increment slots, DO NOT change role
            if (isSlotUpgrade) {
                updateData.extraChannelSlots = { increment: extraSlotsToAdd };
                // Keep role as is.
            } else if (paymentRequest.role === 'MASTERCLASS') {
                // Masterclass course purchase - Lifetime access with no tool tier change
                updateData.hasMasterclass = true;
                // DO NOT update membershipExpiry since Masterclass doesn't extend Tool usage
                delete updateData.membershipExpiry;
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

        // Send Welcome Email if this is a Masterclass purchase
        if (paymentRequest.role === 'MASTERCLASS') {
            try {
                const userName = user.name || user.email.split('@')[0];
                await sendMasterclassWelcomeEmail(user.email, userName);
                console.log(`Sent automated Welcome Email to Masterclass student: ${user.email}`);
            } catch (emailErr) {
                console.error('Failed to send Masterclass welcome email:', emailErr);
            }
        }

        // =================== AUTO LICENSE KEY GENERATION (VPS KODA) ===================
        // If the purchased plan includes desktop tools (STUDIO, NOVEL, VIP_COMBO),
        // we auto-call the VPS license server to generate a key and save it to user profile.
        let generatedLicenseKey: string | null = null;
        const toolRoles = ['STUDIO', 'NOVEL', 'VIP_COMBO'];
        const purchasedRole = paymentRequest.role;

        if (toolRoles.includes(purchasedRole)) {
            try {
                // Map SeenWeb role to VPS tier
                let vpsTier = 'vip'; // Default VIP (includes AI proxy)
                if (purchasedRole === 'STUDIO') vpsTier = 'combo_master'; // Studio gets full tool access
                if (purchasedRole === 'NOVEL') vpsTier = 'combo_master';  // Novel gets full tool access  
                if (purchasedRole === 'VIP_COMBO') vpsTier = 'combo_master'; // Combo = everything

                const vpsResponse = await axios.post('http://47.250.174.44/api/admin/create-license', {
                    adminSecret: 'koda-admin-2026',
                    tier: vpsTier,
                    owner: `${paymentRequest.email} (Web Auto)`,
                    expiresInDays: membershipDays
                }, { timeout: 10000 }); // 10s timeout

                if (vpsResponse.data?.success && vpsResponse.data?.licenseKey) {
                    generatedLicenseKey = vpsResponse.data.licenseKey;
                    
                    // Save license key to user profile
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            kodaLicenseKey: generatedLicenseKey,
                            kodaTier: vpsTier
                        }
                    });
                    console.log(`[Auto License] ✅ Generated ${generatedLicenseKey} for ${paymentRequest.email} (tier: ${vpsTier}, days: ${membershipDays})`);
                }
            } catch (licErr: any) {
                console.error('[Auto License] ❌ Failed to generate license from VPS:', licErr.message);
                // Non-blocking: payment still succeeds, admin can manually create key later
            }
        }

        // Send Telegram notification directly
        try {
            const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
            const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

            if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
                const licenseInfo = generatedLicenseKey 
                    ? `\n🔑 License Key: ${generatedLicenseKey}` 
                    : '';
                const msg = `✅ THANH TOÁN THÀNH CÔNG!\n------------------------------------\n- Khách: ${paymentRequest.email}\n- Số tiền: ${paymentRequest.amount.toLocaleString('vi-VN')} đ\n- Gói: ${paymentInfo.plan || 'N/A'} (${paymentRequest.role})\n- Mã đơn: ${orderCode}${licenseInfo}\n------------------------------------\nGói đã được kích hoạt tự động! 🎉`;

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
            data: { userId: user.id, email: user.email, role: user.role, licenseKey: generatedLicenseKey }
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
