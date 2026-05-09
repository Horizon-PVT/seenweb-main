// pages/api/admin/activate.ts (Bản FULL Đã Sửa Lỗi P2025 và ReferenceError)
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { MAX_DAILY_USAGE } from '@/lib/roles';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 🔐 BẢO MẬT: Kiểm tra quyền Admin
    const session = await getServerSession(req, res, authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này.' });
    }

    // Lấy biến cần thiết
    const { requestId, userEmail } = req.body;

    try {
        if (!requestId || !userEmail) {
            return res.status(400).json({ error: 'Missing requestId or userEmail' });
        }

        // 1. Lấy thông tin đơn hàng
        const payment = await prisma.paymentRequest.findUnique({
            where: { id: requestId }
        });

        if (!payment) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
        }

        // Tránh kích hoạt lại đơn đã COMPLETED
        if (payment.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Đơn hàng này đã được kích hoạt trước đó.' });
        }

        // 2. Tính toán ngày hết hạn (giữ nguyên logic cũ)
        const orderParts = payment.orderCode.split(' ');
        const durationCode = orderParts.find(part => part.endsWith('M')); // Tìm 1M hoặc 12M

        let monthsToAdd = 1;
        if (durationCode === '12M') {
            monthsToAdd = 12;
        }

        const newExpiryDate = new Date();
        newExpiryDate.setMonth(newExpiryDate.getMonth() + monthsToAdd);

        // 3. Cấp quyền cho User (Sử dụng UPSERT để TẠO NẾU CHƯA CÓ, CẬP NHẬT NẾU CÓ)
        // Đây là cách giải quyết lỗi P2025: Record to update not found
        // ✅ FIX: Lấy maxUsage theo role từ MAX_DAILY_USAGE thay vì hardcode 9999
        const userRole = payment.role as keyof typeof MAX_DAILY_USAGE;
        const maxUsage = MAX_DAILY_USAGE[userRole] || 9999;

        // Calculate dubbing credits based on role/plan
        // BASIC = 10, PRO = 30
        let dubbingCreditsToAdd = 0;
        if (payment.role === 'BASIC') dubbingCreditsToAdd = 10;
        else if (payment.role === 'PRO') dubbingCreditsToAdd = 30;

        const isMasterclass = payment.role === 'MASTERCLASS';

        let updateData: any = {};
        let createData: any = {
            email: userEmail,
            role: isMasterclass ? 'FREE' : payment.role,
            maxDailyUsage: isMasterclass ? MAX_DAILY_USAGE['FREE'] : maxUsage,
            membershipExpiry: isMasterclass ? null : newExpiryDate,
            dubbingCredits: dubbingCreditsToAdd,
            hasMasterclass: isMasterclass
        };

        if (isMasterclass) {
            updateData = { hasMasterclass: true };
        } else {
            updateData = {
                role: payment.role, // Cập nhật role
                membershipExpiry: newExpiryDate, // Cập nhật hạn dùng
                maxDailyUsage: maxUsage, // Cập nhật giới hạn dùng theo role
                dubbingCredits: { increment: dubbingCreditsToAdd } // Add dubbing credits
            };
        }

        await prisma.user.upsert({
            where: { email: userEmail },
            update: updateData,
            create: createData
        });

        // 4. Cập nhật trạng thái đơn hàng (sang COMPLETED)
        await prisma.paymentRequest.update({
            where: { id: requestId },
            data: {
                status: 'COMPLETED',
                approvedAt: new Date(),
            }
        });

        return res.status(200).json({
            success: true,
            message: `Kích hoạt thành công cho ${userEmail}. Gói: ${payment.role}, Hạn dùng: ${newExpiryDate.toLocaleDateString('vi-VN')}`
        });

    } catch (error: any) {
        console.error("Lỗi kích hoạt:", error);

        // Sử dụng biến userEmail và requestId đã được define ở đầu hàm
        if (error.code === 'P2025') {
            return res.status(404).json({ error: `Lỗi DB: Không tìm thấy Request ID (${requestId}) hoặc có lỗi khi tạo/cập nhật User (${userEmail}).` });
        }
        return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
}