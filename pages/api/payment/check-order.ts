// pages/api/payment/check-order.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

// PayOS API (Get payment link info)
const PAYOS_API_URL = 'https://api-merchant.payos.vn/v2/payment-requests';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { orderCode } = req.body;

        if (!orderCode) {
            return res.status(400).json({ success: false, message: 'Missing orderCode' });
        }

        // 1. Find request in DB
        const paymentRequest = await prisma.paymentRequest.findUnique({
            where: { orderCode: String(orderCode) }
        });

        if (!paymentRequest) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // 2. If already PAID, return success immediately
        if (paymentRequest.status === 'PAID') {
            return res.status(200).json({
                success: true,
                status: 'PAID',
                message: 'Payment already confirmed'
            });
        }

        // 3. If NOT PAID, verify strictly with PayOS API
        try {
            const payosRes = await axios.get(`${PAYOS_API_URL}/${orderCode}`, {
                headers: {
                    'x-client-id': process.env.PAYOS_CLIENT_ID,
                    'x-api-key': process.env.PAYOS_API_KEY,
                }
            });

            // PayOS returns data: { code: '00', data: { status: 'PAID', ... } }
            if (payosRes.data && payosRes.data.code === '00' && payosRes.data.data.status === 'PAID') {
                console.log(`[CHECK-ORDER] Order ${orderCode} found PAID on PayOS but PENDING in DB. Updating...`);

                // --- DUPLICATE LOGIC FROM WEBHOOK (Safe to extract to shared function later) ---

                // Get User
                let user = await prisma.user.findUnique({ where: { email: paymentRequest.email } });

                // Determine credits
                let dubbingCreditsToAdd = 0;
                if (paymentRequest.role === 'CREATIVE') dubbingCreditsToAdd = 10;
                else if (paymentRequest.role === 'SUPER') dubbingCreditsToAdd = 30;
                else if (paymentRequest.role === 'VIP') dubbingCreditsToAdd = 100;

                // Create or Update User
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email: paymentRequest.email,
                            role: paymentRequest.role,
                            membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            dubbingCredits: dubbingCreditsToAdd,
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
                            dubbingCredits: { increment: dubbingCreditsToAdd },
                        }
                    });
                }

                // Update Payment Request
                await prisma.paymentRequest.update({
                    where: { id: paymentRequest.id },
                    data: {
                        status: 'PAID',
                        paidAt: new Date(),
                        userId: user.id,
                        txn: payosRes.data.data.transactions?.[0]?.reference || null,
                    }
                });

                // --- END LOGIC ---

                return res.status(200).json({
                    success: true,
                    status: 'PAID',
                    message: 'Payment confirmed via PayOS API check'
                });
            }

            return res.status(200).json({
                success: true,
                status: 'PENDING',
                message: 'Payment still pending on PayOS'
            });

        } catch (payosError: any) {
            console.error('PayOS API Check Error:', payosError.response?.data || payosError.message);
            // If PayOS error, assumt not paid or invalid
            return res.status(400).json({ success: false, message: 'Could not verify with PayOS' });
        }

    } catch (error: any) {
        console.error('Check Order Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
