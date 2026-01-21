// pages/api/admin/users.ts - API quản lý users cho Admin Panel
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Check admin auth
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email || (session.user as any).role !== 'ADMIN') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // GET - List users
        if (req.method === 'GET') {
            const { search, page = '1', limit = '50' } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

            const where = search ? {
                OR: [
                    { email: { contains: search as string, mode: 'insensitive' as const } },
                    { name: { contains: search as string, mode: 'insensitive' as const } }
                ]
            } : {};

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        dailyUsage: true,
                        maxDailyUsage: true,
                        createdAt: true,
                        membershipExpiry: true
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit as string)
                }),
                prisma.user.count({ where })
            ]);

            return res.status(200).json({ users, total, page: parseInt(page as string), limit: parseInt(limit as string) });
        }

        // POST - Create user
        if (req.method === 'POST') {
            const { email, name, role } = req.body;
            if (!email || !role) {
                return res.status(400).json({ error: 'Email và role là bắt buộc' });
            }

            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                return res.status(400).json({ error: 'Email đã tồn tại' });
            }

            const user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    role,
                    dailyUsage: 0,
                    maxDailyUsage: role === 'FREE' ? 3 : 9999
                }
            });

            return res.status(201).json({ message: 'Tạo user thành công', user });
        }

        // PUT - Update user
        if (req.method === 'PUT') {
            const { id, email, name, role, maxDailyUsage } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID là bắt buộc' });
            }

            const user = await prisma.user.update({
                where: { id },
                data: {
                    ...(email && { email }),
                    ...(name && { name }),
                    ...(role && { role }),
                    ...(maxDailyUsage !== undefined && { maxDailyUsage })
                }
            });

            return res.status(200).json({ message: 'Cập nhật thành công', user });
        }

        // DELETE - Delete user
        if (req.method === 'DELETE') {
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID là bắt buộc' });
            }

            await prisma.user.delete({ where: { id } });
            return res.status(200).json({ message: 'Xóa user thành công' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Admin users API error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
