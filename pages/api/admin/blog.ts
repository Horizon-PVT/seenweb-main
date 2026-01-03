import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

async function generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.blogPost.findUnique({
            where: { slug },
        });

        if (!existing || existing.id === excludeId) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user?.email !== 'phamanhtung.jp@gmail.com' || (session.user as any)?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        if (req.method === 'GET') {
            const { q, status } = req.query;

            const where: any = {};

            if (q) {
                where.OR = [
                    { title: { contains: q as string, mode: 'insensitive' } },
                    { slug: { contains: q as string, mode: 'insensitive' } },
                ];
            }

            if (status) {
                where.status = status;
            }

            const posts = await prisma.blogPost.findMany({
                where,
                include: {
                    category: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return res.status(200).json(posts);
        }

        if (req.method === 'POST') {
            const { title, slug, coverImage, summary, content, categoryId, status } = req.body;

            if (!title || !content) {
                return res.status(400).json({ error: 'Title and content are required' });
            }

            const baseSlug = slug || slugify(title);
            const uniqueSlug = await generateUniqueSlug(baseSlug);

            const post = await prisma.blogPost.create({
                data: {
                    title,
                    slug: uniqueSlug,
                    coverImage: coverImage || null,
                    summary: summary || null,
                    content,
                    categoryId: categoryId || null,
                    status: status || 'DRAFT',
                    publishedAt: status === 'PUBLISHED' ? new Date() : null,
                },
                include: {
                    category: true,
                },
            });

            return res.status(201).json(post);
        }

        if (req.method === 'PUT') {
            const { id, title, slug, coverImage, summary, content, categoryId, status } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Post ID is required' });
            }

            const updateData: any = {};

            if (title !== undefined) updateData.title = title;
            if (coverImage !== undefined) updateData.coverImage = coverImage || null;
            if (summary !== undefined) updateData.summary = summary || null;
            if (content !== undefined) updateData.content = content;
            if (categoryId !== undefined) updateData.categoryId = categoryId || null;
            if (status !== undefined) {
                updateData.status = status;
                if (status === 'PUBLISHED') {
                    const existing = await prisma.blogPost.findUnique({ where: { id } });
                    if (!existing?.publishedAt) {
                        updateData.publishedAt = new Date();
                    }
                }
            }

            if (slug !== undefined) {
                const baseSlug = slug || slugify(title);
                updateData.slug = await generateUniqueSlug(baseSlug, id);
            }

            const post = await prisma.blogPost.update({
                where: { id },
                data: updateData,
                include: {
                    category: true,
                },
            });

            return res.status(200).json(post);
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Post ID is required' });
            }

            await prisma.blogPost.delete({
                where: { id },
            });

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Blog API error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
