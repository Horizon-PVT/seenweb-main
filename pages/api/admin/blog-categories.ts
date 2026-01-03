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
            const categories = await prisma.blogCategory.findMany({
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { posts: true },
                    },
                },
            });

            return res.status(200).json(categories);
        }

        if (req.method === 'POST') {
            const { name, slug } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Name is required' });
            }

            const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-');

            const category = await prisma.blogCategory.create({
                data: {
                    name,
                    slug: categorySlug,
                },
            });

            return res.status(201).json(category);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Blog category API error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
