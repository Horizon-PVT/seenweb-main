// @ts-nocheck
// lib/queue.ts
// BullMQ queue configuration for background AI tasks

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { getRedisClient } from './redis';

// Queue names
export const QUEUE_NAMES = {
    AI_TASKS: 'ai-tasks',
} as const;

// Task types
export type TaskType =
    | 'generate-script'
    | 'generate-thumbnail'
    | 'generate-video'
    | 'analyze-channel';

// Task payload interface
export interface TaskPayload {
    type: TaskType;
    prompt: string;
    userId?: string;
    metadata?: Record<string, any>;
}

// Task result interface
export interface TaskResult {
    success: boolean;
    data?: any;
    error?: string;
    processingTime?: number;
}

// Singleton queue instance
let aiQueue: Queue<TaskPayload, TaskResult> | null = null;

/**
 * Get AI task queue instance (singleton)
 */
export function getAIQueue(): Queue<TaskPayload, TaskResult> {
    if (aiQueue) {
        return aiQueue;
    }

    const redis = getRedisClient();

    // @ts-ignore: Suppress strict type check for BullMQ
    aiQueue = new Queue<TaskPayload, TaskResult>(QUEUE_NAMES.AI_TASKS, {
        connection: redis,
        defaultJobOptions: {
            // Retry failed jobs up to 3 times
            attempts: 3,
            // Exponential backoff: 1s, 2s, 4s
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            // Remove completed jobs after 24 hours
            removeOnComplete: {
                age: 24 * 60 * 60,
                count: 1000,
            },
            // Keep failed jobs for 7 days
            removeOnFail: {
                age: 7 * 24 * 60 * 60,
            },
        },
    });

    console.log(`[Queue] AI Task queue initialized`);
    return aiQueue;
}

/**
 * Add a task to the AI queue
 * @param payload - Task payload
 * @returns Job ID
 */
export async function addAITask(payload: TaskPayload): Promise<string> {
    const queue = getAIQueue();

    const job = await queue.add(payload.type, payload, {
        // Unique job ID based on task type and prompt hash
        jobId: `${payload.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    console.log(`[Queue] Task added: ${job.id} (${payload.type})`);
    return job.id!;
}

/**
 * Get task status and result
 * @param taskId - Job ID
 */
export async function getTaskStatus(taskId: string): Promise<{
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'not_found';
    result?: TaskResult;
    progress?: number;
    failedReason?: string;
}> {
    const queue = getAIQueue();
    const job = await queue.getJob(taskId);

    if (!job) {
        return { status: 'not_found' };
    }

    const state = await job.getState();

    switch (state) {
        case 'waiting':
        case 'delayed':
            return { status: 'queued' };
        case 'active':
            return { status: 'processing', progress: job.progress as number };
        case 'completed':
            return { status: 'completed', result: job.returnvalue };
        case 'failed':
            return { status: 'failed', failedReason: job.failedReason };
        default:
            return { status: 'queued' };
    }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
}> {
    const queue = getAIQueue();

    const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
}

/**
 * Create a worker to process AI tasks
 * This should be run in a separate process
 */
export function createAIWorker(
    processor: (job: Job<TaskPayload, TaskResult>) => Promise<TaskResult>
): Worker<TaskPayload, TaskResult> {
    const redis = getRedisClient();

    const worker = new Worker<TaskPayload, TaskResult>(
        QUEUE_NAMES.AI_TASKS,
        processor,
        {
            connection: redis,
            concurrency: 5, // Process up to 5 jobs concurrently
        }
    );

    // Event handlers
    worker.on('completed', (job, result) => {
        console.log(`[Worker] Job ${job.id} completed:`, result.success ? 'SUCCESS' : 'FAILURE');
    });

    worker.on('failed', (job, err) => {
        console.error(`[Worker] Job ${job?.id} failed:`, err.message);
    });

    worker.on('progress', (job, progress) => {
        console.log(`[Worker] Job ${job.id} progress: ${progress}%`);
    });

    worker.on('error', (err) => {
        console.error('[Worker] Worker error:', err.message);
    });

    console.log('[Worker] AI Worker started');
    return worker;
}

// Export types
export { Queue, Worker, Job, QueueEvents };
