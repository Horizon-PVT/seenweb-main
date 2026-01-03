import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user?.email !== 'phamanhtung.jp@gmail.com' || (session.user as any)?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        if (req.method === 'GET') {
            const promos = await prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
            return res.status(200).json(promos);
        }

        if (req.method === 'POST') {
            const { code, type, value, startDate, endDate, minOrder, status, description } = req.body;
            if (!code || !type || value === undefined) return res.status(400).json({ error: 'Code, type and value are required' });

            const promo = await prisma.promotion.create({
                data: {
                    code: code.toUpperCase(),
                    type,
                    value,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    minOrder: minOrder || null,
                    status: status || 'ACTIVE',
                    description: description || null,
                },
            });
            return res.status(201).json(promo);
        }

        if (req.method === 'PUT') {
            const { id, code, type, value, startDate, endDate, minOrder, status, description } = req.body;
            if (!id) return res.status(400).json({ error: 'Promotion ID is required' });

            const updateData: any = {};
            if (code !== undefined) updateData.code = code.toUpperCase();
            if (type !== undefined) updateData.type = type;
            if (value !== undefined) updateData.value = value;
            if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
            if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
            if (minOrder !== undefined) updateData.minOrder = minOrder || null;
            if (status !== undefined) updateData.status = status;
            if (description !== undefined) updateData.description = description || null;

            const promo = await prisma.promotion.update({ where: { id }, data: updateData });
            return res.status(200).json(promo);
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;
            if (!id) return res.status(400).json({ error: 'Promotion ID is required' });
            await prisma.promotion.delete({ where: { id } });
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Promotion API error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
