// lib/redis.ts
// Redis client singleton with connection pooling and auto-reconnect

import Redis from 'ioredis';

// Singleton instance
let redisClient: Redis | null = null;

/**
 * Get Redis client instance (singleton pattern)
 * Creates new connection if not exists, reuses existing otherwise
 */
export function getRedisClient(): Redis {
    if (redisClient) {
        return redisClient;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = new Redis(redisUrl, {
        // Connection options
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            // Exponential backoff: wait 2^times * 100ms (max 30 seconds)
            const delay = Math.min(times * 100 * Math.pow(2, times - 1), 30000);
            console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms...`);
            return delay;
        },

        // Reconnect on connection lost
        reconnectOnError(err) {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
                // Only reconnect when the error contains "READONLY"
                return true;
            }
            return false;
        },

        // Enable offline queue (commands are queued when disconnected)
        enableOfflineQueue: true,

        // Connection timeout
        connectTimeout: 10000,

        // Lazy connect - don't connect until first command
        lazyConnect: true,
    });

    // Event handlers for logging
    redisClient.on('connect', () => {
        console.log('[Redis] Connected to Redis server');
    });

    redisClient.on('ready', () => {
        console.log('[Redis] Redis client ready');
    });

    redisClient.on('error', (err) => {
        console.error('[Redis] Connection error:', err.message);
    });

    redisClient.on('close', () => {
        console.log('[Redis] Connection closed');
    });

    redisClient.on('reconnecting', () => {
        console.log('[Redis] Reconnecting...');
    });

    return redisClient;
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedisConnection(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        console.log('[Redis] Connection closed gracefully');
    }
}

/**
 * Check if Redis is connected and healthy
 */
export async function isRedisHealthy(): Promise<boolean> {
    try {
        const client = getRedisClient();
        const pong = await client.ping();
        return pong === 'PONG';
    } catch (error) {
        console.error('[Redis] Health check failed:', error);
        return false;
    }
}

// Export the Redis class for type usage
export { Redis };
