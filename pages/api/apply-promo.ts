import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code, orderAmount } = req.body;

        if (!code || !orderAmount) {
            return res.status(400).json({ error: 'Code and orderAmount are required' });
        }

        // Find promo code
        console.log('[Apply Promo] Looking for code:', code.toUpperCase());
        const promo = await prisma.promotion.findUnique({
            where: { code: code.toUpperCase() },
        });

        console.log('[Apply Promo] Found promo:', promo ? {
            code: promo.code,
            status: promo.status,
            promotionType: promo.promotionType,
            type: promo.type,
            value: promo.value
        } : 'NOT FOUND');

        // Validate promo code exists
        if (!promo) {
            return res.status(404).json({ error: 'Mã khuyến mại không tồn tại' });
        }

        // Validate status
        if (promo.status !== 'ACTIVE') {
            console.log('[Apply Promo] Invalid status:', promo.status);
            return res.status(400).json({ error: 'Mã khuyến mại không còn hiệu lực' });
        }

        // Validate promotion type (only CODE can be applied)
        if (promo.promotionType !== 'CODE') {
            console.log('[Apply Promo] Invalid promotionType:', promo.promotionType);
            return res.status(400).json({ error: 'Mã này không thể áp dụng trực tiếp' });
        }

        // Validate date range
        const now = new Date();
        if (promo.startDate && new Date(promo.startDate) > now) {
            return res.status(400).json({ error: 'Mã khuyến mại chưa bắt đầu hiệu lực' });
        }
        if (promo.endDate && new Date(promo.endDate) < now) {
            return res.status(400).json({ error: 'Mã khuyến mại đã hết hạn' });
        }

        // Validate minimum order
        if (promo.minOrder && orderAmount < Number(promo.minOrder)) {
            return res.status(400).json({
                error: `Đơn hàng tối thiểu ${Number(promo.minOrder).toLocaleString('vi-VN')} đ`
            });
        }

        // Validate usage limit
        if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
            return res.status(400).json({ error: 'Mã khuyến mại đã hết lượt sử dụng' });
        }

        // Calculate discount
        let discount = 0;
        if (promo.type === 'PERCENT') {
            discount = (orderAmount * Number(promo.value)) / 100;
        } else if (promo.type === 'FIXED') {
            discount = Number(promo.value);
        }

        // Ensure discount doesn't exceed order amount
        discount = Math.min(discount, orderAmount);

        return res.status(200).json({
            success: true,
            code: promo.code,
            type: promo.type,
            value: Number(promo.value),
            discount: Math.round(discount),
            finalAmount: orderAmount - Math.round(discount),
            description: promo.description,
        });
    } catch (error: any) {
        console.error('Apply promo error:', error);
        return res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}
