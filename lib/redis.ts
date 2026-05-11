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
        maxRetriesPerRequest: 1, // Fix: fail fast
        retryStrategy(times) {
            if (times > 1) return null;
            return 50;
        },

        // Reconnect on connection lost
        reconnectOnError(err) {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
                return true;
            }
            return false;
        },

        // Enable offline queue (original setting)
        enableOfflineQueue: true,

        // Connection timeout - reduced to 2s
        connectTimeout: 2000,

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
