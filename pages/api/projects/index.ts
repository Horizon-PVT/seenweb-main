
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import {
    WORKFLOW_DRAFT_TOOL_ID,
    createDefaultWorkflowDraft,
    getWorkflowDraftName,
    isWorkflowId,
    normalizeWorkflowDraft,
} from '@/lib/workflow-drafts';

async function attachProjectToWorkflowStep(params: {
    userId: string;
    workflowId?: unknown;
    stepId?: unknown;
    channelId?: unknown;
    projectId: string;
}) {
    const workflowId = typeof params.workflowId === 'string' ? params.workflowId : '';
    const stepId = typeof params.stepId === 'string' ? params.stepId : '';
    const channelId = typeof params.channelId === 'string' && params.channelId.trim() ? params.channelId.trim() : null;

    if (!isWorkflowId(workflowId) || !stepId) {
        return;
    }

    if (channelId) {
        const channel = await prisma.youTubeChannel.findFirst({
            where: { id: channelId, userId: params.userId },
            select: { id: true },
        });

        if (!channel) {
            return;
        }
    }

    const draftName = getWorkflowDraftName(workflowId, channelId);
    const existing = await prisma.userProject.findFirst({
        where: {
            userId: params.userId,
            toolId: WORKFLOW_DRAFT_TOOL_ID,
            name: draftName,
        },
        orderBy: { updatedAt: 'desc' },
    });

    const draft = normalizeWorkflowDraft(
        workflowId,
        existing?.data || createDefaultWorkflowDraft(workflowId, channelId),
        channelId
    );
    const now = new Date().toISOString();
    let changed = false;

    const nextDraft = {
        ...draft,
        updatedAt: now,
        status: draft.status === 'completed' ? 'completed' : 'in_progress',
        steps: draft.steps.map((step) => {
            if (step.stepId !== stepId || step.toolOutputProjectIds.includes(params.projectId)) {
                return step;
            }

            changed = true;
            return {
                ...step,
                toolOutputProjectIds: [...step.toolOutputProjectIds, params.projectId],
                updatedAt: now,
            };
        }),
    };

    if (!changed) {
        return;
    }

    if (existing) {
        await prisma.userProject.update({
            where: { id: existing.id },
            data: {
                data: nextDraft,
                updatedAt: new Date(),
            },
        });
        return;
    }

    await prisma.userProject.create({
        data: {
            userId: params.userId,
            toolId: WORKFLOW_DRAFT_TOOL_ID,
            name: draftName,
            data: nextDraft,
        },
    });
}

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
        const { toolId, name, data, id, workflowId, stepId, channelId } = req.body;

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

            await attachProjectToWorkflowStep({
                userId,
                workflowId,
                stepId,
                channelId,
                projectId: project.id,
            });

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
