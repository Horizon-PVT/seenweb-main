import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const pendingRequests = await prisma.paymentRequest.findMany({
            where: {
                status: {
                    in: ['PENDING_MANUAL', 'SUCCESS', 'PENDING', 'COMPLETED'] // Thêm COMPLETED để xem lịch sử
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                email: true,
                amount: true,
                orderCode: true,
                status: true,
                createdAt: true,
                paymentInfo: true,
                role: true,
                note: true, // ✅ Thêm note để dashboard hiển thị
            }
        });

        return res.status(200).json(pendingRequests);
    } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}