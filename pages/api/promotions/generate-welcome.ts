import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// Hàm helper tạo code random
function generateRandomCode(prefix: string, length: number = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${result}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user?.email) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { type, value } = req.body; // type: 'PERCENT' | 'BONUS_DAYS', value: number

        if (!type || !value) {
            return res.status(400).json({ error: 'Missing type or value' });
        }

        // 1. Kiểm tra xem user đã từng nhận mã welcome chưa (dựa vào email hoặc device fingerprint nếu có - ở đây dùng email check history db nếu cần, nhưng để đơn giản ta cứ tạo mới vì logic frontend đã chặn hiển thị popup rồi)

        // Tuy nhiên để tránh spam, ta có thể check xem user này đã tạo bao nhiêu mã WELCOME hôm nay.
        // Tạm thời bỏ qua check spam phức tạp, tin tưởng frontend logic.

        // 2. Tạo mã code độc nhất
        let prefix = type === 'PERCENT' ? 'SAFE20' : 'GIFT3'; // SAFE20 (Giảm 20%), GIFT3 (Tặng 3 ngày)
        let newCode = generateRandomCode(prefix);

        // Đảm bảo code unique
        let isUnique = false;
        while (!isUnique) {
            const existing = await prisma.promotion.findUnique({ where: { code: newCode } });
            if (!existing) {
                isUnique = true;
            } else {
                newCode = generateRandomCode(prefix);
            }
        }

        // 3. Lưu vào DB
        const promotion = await prisma.promotion.create({
            data: {
                code: newCode,
                type: type, // 'PERCENT' hoặc 'BONUS_DAYS'
                value: Number(value),
                promotionType: 'CODE', // Mã code cá nhân
                status: 'ACTIVE',
                usageLimit: 1, // Chỉ dùng 1 lần
                description: `Welcome Gift for ${session.user.email} - ${type === 'PERCENT' ? 'Giảm giá' : 'Tặng ngày'}`,
                startDate: new Date(),
                // Hết hạn sau 24h
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }
        });

        return res.status(200).json({ code: promotion.code, expiry: promotion.endDate });

    } catch (error) {
        console.error('Error generating welcome promo:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
