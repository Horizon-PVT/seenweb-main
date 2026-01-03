import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

function slugify(text: string): string {
    return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

async function generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = await prisma.ebook.findUnique({ where: { slug } });
        if (!existing || existing.id === excludeId) return slug;
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
            const ebooks = await prisma.ebook.findMany({ orderBy: { displayOrder: 'asc' } });
            return res.status(200).json(ebooks);
        }

        if (req.method === 'POST') {
            const { title, slug, coverImageUrl, pdfUrl, description, status, displayOrder } = req.body;
            if (!title || !pdfUrl) return res.status(400).json({ error: 'Title and PDF URL are required' });

            const uniqueSlug = await generateUniqueSlug(slug || slugify(title));
            const ebook = await prisma.ebook.create({
                data: {
                    title,
                    slug: uniqueSlug,
                    coverImageUrl: coverImageUrl || null,
                    pdfUrl,
                    description: description || null,
                    status: status || 'DRAFT',
                    displayOrder: displayOrder || 0,
                },
            });
            return res.status(201).json(ebook);
        }

        if (req.method === 'PUT') {
            const { id, title, slug, coverImageUrl, pdfUrl, description, status, displayOrder } = req.body;
            if (!id) return res.status(400).json({ error: 'Ebook ID is required' });

            const updateData: any = {};
            if (title !== undefined) updateData.title = title;
            if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl || null;
            if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl;
            if (description !== undefined) updateData.description = description || null;
            if (status !== undefined) updateData.status = status;
            if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
            if (slug !== undefined) updateData.slug = await generateUniqueSlug(slug || slugify(title), id);

            const ebook = await prisma.ebook.update({ where: { id }, data: updateData });
            return res.status(200).json(ebook);
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;
            if (!id) return res.status(400).json({ error: 'Ebook ID is required' });
            await prisma.ebook.delete({ where: { id } });
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Ebook API error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
