// pages/api/tasks/submit.ts
// API endpoint to submit background AI tasks to the queue

import type { NextApiRequest, NextApiResponse } from 'next';
import { addAITask, TaskPayload, TaskType } from '@/lib/queue';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const VALID_TASK_TYPES: TaskType[] = [
    'generate-script',
    'generate-thumbnail',
    'generate-video',
    'analyze-channel',
];

interface SubmitRequest {
    type: TaskType;
    prompt: string;
    metadata?: Record<string, any>;
}

interface SubmitResponse {
    success: boolean;
    taskId?: string;
    status?: 'queued';
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SubmitResponse>
) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        // Get user session (optional - for tracking)
        const session = await getServerSession(req, res, authOptions);
        const userId = session?.user?.email || undefined;

        // Validate request body
        const { type, prompt, metadata } = req.body as SubmitRequest;

        if (!type || !VALID_TASK_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                error: `Invalid task type. Must be one of: ${VALID_TASK_TYPES.join(', ')}`,
            });
        }

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required and must be a non-empty string',
            });
        }

        if (prompt.length > 10000) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is too long (max 10000 characters)',
            });
        }

        // Create task payload
        const taskPayload: TaskPayload = {
            type,
            prompt: prompt.trim(),
            userId,
            metadata,
        };

        // Add to queue
        const taskId = await addAITask(taskPayload);

        console.log(`[API] Task submitted: ${taskId} (${type}) by ${userId || 'anonymous'}`);

        return res.status(200).json({
            success: true,
            taskId,
            status: 'queued',
        });

    } catch (error: any) {
        console.error('[API] Error submitting task:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to submit task. Please try again.',
        });
    }
}
