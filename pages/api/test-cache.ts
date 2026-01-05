// pages/api/test-cache.ts
// Test endpoint to verify cache functionality

import type { NextApiRequest, NextApiResponse } from 'next';
import { withCache, CACHE_PREFIXES, getCacheStats } from '@/lib/cache';
import { isRedisHealthy } from '@/lib/redis';

interface TestCacheResponse {
    success: boolean;
    redisConnected: boolean;
    cacheStats?: {
        keyCount: number;
        memoryUsage: string;
    };
    testResult?: {
        prompt: string;
        result: any;
        cached: boolean;
        duration: number;
    };
    error?: string;
}

// Simulated slow operation (2 seconds)
async function slowOperation(prompt: string): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
        generated: `Result for: ${prompt}`,
        timestamp: new Date().toISOString(),
        random: Math.random(), // This will be the same if cached
    };
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TestCacheResponse>
) {
    try {
        // Check Redis health
        const redisConnected = await isRedisHealthy();

        if (!redisConnected) {
            return res.status(503).json({
                success: false,
                redisConnected: false,
                error: 'Redis is not connected. Make sure Redis is running.',
            });
        }

        // Get cache stats
        const cacheStats = await getCacheStats();

        // Test the cache with a sample prompt
        const testPrompt = req.query.prompt?.toString() || 'test-prompt-' + new Date().toLocaleDateString();

        const startTime = Date.now();

        // Use withCache wrapper - will be fast if cached
        const result = await withCache(
            CACHE_PREFIXES.GENERAL,
            testPrompt,
            () => slowOperation(testPrompt),
            60 // 60 seconds TTL for test
        );

        const duration = Date.now() - startTime;
        const cached = duration < 500; // If faster than 500ms, it was cached

        return res.status(200).json({
            success: true,
            redisConnected: true,
            cacheStats,
            testResult: {
                prompt: testPrompt,
                result,
                cached,
                duration,
            },
        });

    } catch (error: any) {
        console.error('[API] Test cache error:', error);

        return res.status(500).json({
            success: false,
            redisConnected: false,
            error: error.message,
        });
    }
}
