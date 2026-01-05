// pages/api/tasks/[taskId].ts
// API endpoint to check task status (for polling)

import type { NextApiRequest, NextApiResponse } from 'next';
import { getTaskStatus } from '@/lib/queue';

interface TaskStatusResponse {
    success: boolean;
    taskId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'not_found';
    progress?: number;
    result?: any;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TaskStatusResponse>
) {
    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            taskId: '',
            status: 'not_found',
            error: 'Method not allowed',
        });
    }

    const { taskId } = req.query;

    if (!taskId || Array.isArray(taskId)) {
        return res.status(400).json({
            success: false,
            taskId: '',
            status: 'not_found',
            error: 'Task ID is required',
        });
    }

    try {
        const taskInfo = await getTaskStatus(taskId);

        if (taskInfo.status === 'not_found') {
            return res.status(404).json({
                success: false,
                taskId,
                status: 'not_found',
                error: 'Task not found',
            });
        }

        return res.status(200).json({
            success: true,
            taskId,
            status: taskInfo.status,
            progress: taskInfo.progress,
            result: taskInfo.result?.data,
            error: taskInfo.failedReason,
        });

    } catch (error: any) {
        console.error('[API] Error getting task status:', error);

        return res.status(500).json({
            success: false,
            taskId,
            status: 'not_found',
            error: 'Failed to get task status',
        });
    }
}
