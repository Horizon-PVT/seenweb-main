import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { processPaidPayment } from '@/lib/payment-processing';

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

        const paymentRequest = await prisma.paymentRequest.findUnique({
            where: { orderCode: String(orderCode) }
        });

        if (!paymentRequest) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (paymentRequest.status === 'PAID') {
            const user = await prisma.user.findFirst({
                where: { email: { equals: paymentRequest.email, mode: 'insensitive' } }
            });

            return res.status(200).json({
                success: true,
                status: 'PAID',
                message: 'Payment already confirmed',
                amount: paymentRequest.amount,
                purchasedPlan: paymentRequest.role,
                licenseKey: user?.kodaLicenseKey || null,
                kodaTier: user?.kodaTier || null
            });
        }

        try {
            const payosRes = await axios.get(`${PAYOS_API_URL}/${orderCode}`, {
                headers: {
                    'x-client-id': process.env.PAYOS_CLIENT_ID,
                    'x-api-key': process.env.PAYOS_API_KEY,
                }
            });

            if (payosRes.data?.code === '00' && payosRes.data?.data?.status === 'PAID') {
                const result = await processPaidPayment({
                    orderCode,
                    txn: payosRes.data.data.transactions?.[0]?.reference || payosRes.data.data.transactionDateTime || null,
                });

                return res.status(200).json({
                    success: true,
                    status: 'PAID',
                    message: result.processed ? 'Payment confirmed via PayOS API check' : 'Payment already processed',
                    amount: paymentRequest.amount,
                    purchasedPlan: paymentRequest.role,
                    licenseKey: result.licenseKey || result.user?.kodaLicenseKey || null,
                    kodaTier: result.user?.kodaTier || null
                });
            }

            return res.status(200).json({
                success: true,
                status: 'PENDING',
                message: 'Payment still pending on PayOS'
            });
        } catch (payosError: any) {
            console.error('PayOS API Check Error:', payosError.response?.data || payosError.message);
            return res.status(400).json({ success: false, message: 'Could not verify with PayOS' });
        }
    } catch (error: any) {
        console.error('Check Order Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
