
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (session.user as any).id;
    console.log(`[API Projects] Request from UserID: ${userId}, Method: ${req.method}`);

    if (!userId) {
        console.error('[API Projects] User ID is missing in session!');
        return res.status(500).json({ error: 'User ID missing in session' });
    }

    // GET: List Projects
    if (req.method === 'GET') {
        const { toolId, limit = '10' } = req.query;

        try {
            const projects = await prisma.userProject.findMany({
                where: {
                    userId: userId,
                    ...(toolId ? { toolId: String(toolId) } : {})
                },
                orderBy: { updatedAt: 'desc' },
                take: Number(limit),
                select: {
                    id: true,
                    name: true,
                    toolId: true,
                    updatedAt: true,
                    data: true // Optional: don't load full data for list if heavy
                }
            });
            console.log(`[API Projects] Found ${projects.length} projects for user ${userId}`);
            return res.status(200).json({ projects });
        } catch (error) {
            console.error('Error fetching projects:', error);
            return res.status(500).json({ error: 'Failed to fetch projects' });
        }
    }

    // POST: Save Project
    if (req.method === 'POST') {
        const { toolId, name, data, id } = req.body;

        if (!toolId || !data) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            let project;
            if (id) {
                // Update existing
                // Verify ownership first
                const existing = await prisma.userProject.findUnique({ where: { id } });
                if (!existing || existing.userId !== userId) {
                    return res.status(403).json({ error: 'Forbidden' });
                }

                project = await prisma.userProject.update({
                    where: { id },
                    data: {
                        name: name || existing.name,
                        data: data,
                        updatedAt: new Date()
                    }
                });
            } else {
                // Create new
                project = await prisma.userProject.create({
                    data: {
                        userId: userId,
                        toolId: toolId,
                        name: name || `${toolId} - ${new Date().toLocaleString()}`,
                        data: data
                    }
                });
            }

            return res.status(200).json({ project });
        } catch (error: any) {
            console.error('Error saving project:', error);
            return res.status(500).json({ error: `Failed to save project: ${error.message}` });
        }
    }

    // DELETE: Delete Project
    if (req.method === 'DELETE') {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Missing project ID' });
        }

        try {
            const existing = await prisma.userProject.findUnique({ where: { id: String(id) } });
            if (!existing || existing.userId !== userId) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            await prisma.userProject.delete({ where: { id: String(id) } });
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error deleting project:', error);
            return res.status(500).json({ error: 'Failed to delete project' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb', // Increase limit for Base64 images
        },
    },
};
