import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
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

        const { type, value, userRole, target, prizeId } = req.body;

        if (!type || !value) {
            return res.status(400).json({ error: 'Missing type or value' });
        }

        // Check chương trình Khai Xuân còn hiệu lực không (hết hạn 15/3/2026)
        const khaiXuanEnd = new Date('2026-03-15T23:59:59+07:00');
        if (new Date() > khaiXuanEnd) {
            return res.status(400).json({ error: 'Chương trình Khai Xuân 2026 đã kết thúc.' });
        }

        // Tạo mã code với prefix XUAN26
        let newCode = generateRandomCode('XUAN26');

        // Đảm bảo code unique
        let isUnique = false;
        while (!isUnique) {
            const existing = await prisma.promotion.findUnique({ where: { code: newCode } });
            if (!existing) {
                isUnique = true;
            } else {
                newCode = generateRandomCode('XUAN26');
            }
        }

        // Build description with tier info
        const role = userRole || 'FREE';
        const prizeLabel = prizeId || 'unknown';
        const description = `Khai Xuân 2026 - ${session.user.email} - ${role} - ${prizeLabel}`;

        // Determine promotion type based on prize
        let promoType: string;
        if (type === 'CREDITS') {
            promoType = 'BONUS_DAYS'; // Re-use BONUS_DAYS type for credits (value = credits count)
        } else {
            promoType = type; // PERCENT or BONUS_DAYS
        }

        // Lưu vào DB
        const promotion = await prisma.promotion.create({
            data: {
                code: newCode,
                type: promoType,
                value: Number(value),
                promotionType: 'CODE',
                status: 'ACTIVE',
                usageLimit: 1,
                description: description,
                startDate: new Date(),
                // Hết hạn sau 24h
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }
        });

        return res.status(200).json({ code: promotion.code, expiry: promotion.endDate });

    } catch (error) {
        console.error('Error generating Khai Xuan promo:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
