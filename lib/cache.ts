// lib/cache.ts
// Cache utilities with MD5-based key generation and hit/miss logging

import crypto from 'crypto';
import { getRedisClient } from './redis';

// Default TTL: 7 days in seconds
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;

// Cache key prefixes
export const CACHE_PREFIXES = {
    SCRIPT: 'cache:script:',
    THUMBNAIL: 'cache:thumbnail:',
    VIDEO: 'cache:video:',
    GENERAL: 'cache:general:',
} as const;

type CachePrefix = typeof CACHE_PREFIXES[keyof typeof CACHE_PREFIXES];

/**
 * Generate a cache key based on MD5 hash of the input
 * @param prefix - Cache key prefix (e.g., 'cache:script:')
 * @param input - Input string to hash (e.g., prompt)
 * @returns Cache key string
 */
export function generateCacheKey(prefix: CachePrefix, input: string): string {
    const hash = crypto.createHash('md5').update(input).digest('hex');
    return `${prefix}${hash}`;
}

/**
 * Log cache hit/miss events
 */
function logCacheEvent(hit: boolean, key: string, duration?: number): void {
    const timestamp = new Date().toISOString();
    const status = hit ? 'HIT' : 'MISS';
    const durationStr = duration ? ` (${duration}ms)` : '';
    console.log(`[Cache] ${timestamp} ${status}: ${key}${durationStr}`);
}

/**
 * Get cached value by key
 * @param key - Cache key
 * @returns Cached value or null if not found
 */
export async function getCached<T>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
        const redis = getRedisClient();
        const cached = await redis.get(key);

        if (cached) {
            const duration = Date.now() - startTime;
            logCacheEvent(true, key, duration);
            return JSON.parse(cached) as T;
        }

        logCacheEvent(false, key);
        return null;
    } catch (error) {
        console.error('[Cache] Error getting cache:', error);
        return null;
    }
}

/**
 * Set cached value with TTL
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttlSeconds - Time to live in seconds (default: 7 days)
 */
export async function setCache<T>(
    key: string,
    value: T,
    ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> {
    try {
        const redis = getRedisClient();
        const serialized = JSON.stringify(value);

        await redis.setex(key, ttlSeconds, serialized);
        console.log(`[Cache] SET: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
        console.error('[Cache] Error setting cache:', error);
    }
}

/**
 * Delete cached value by key
 * @param key - Cache key
 */
export async function deleteCache(key: string): Promise<void> {
    try {
        const redis = getRedisClient();
        await redis.del(key);
        console.log(`[Cache] DEL: ${key}`);
    } catch (error) {
        console.error('[Cache] Error deleting cache:', error);
    }
}

/**
 * Invalidate cache by pattern (e.g., 'cache:script:*')
 * @param pattern - Redis key pattern
 */
export async function invalidateCacheByPattern(pattern: string): Promise<number> {
    try {
        const redis = getRedisClient();
        const keys = await redis.keys(pattern);

        if (keys.length === 0) {
            console.log(`[Cache] INVALIDATE: No keys match pattern "${pattern}"`);
            return 0;
        }

        await redis.del(...keys);
        console.log(`[Cache] INVALIDATE: Deleted ${keys.length} keys matching "${pattern}"`);
        return keys.length;
    } catch (error) {
        console.error('[Cache] Error invalidating cache:', error);
        return 0;
    }
}

/**
 * Cache-aside pattern wrapper
 * Checks cache first, if miss then executes function and caches result
 * 
 * @param prefix - Cache key prefix
 * @param input - Input to hash for cache key (e.g., prompt)
 * @param fn - Function to execute if cache miss
 * @param ttlSeconds - TTL for cached result
 * @returns Cached or fresh result
 */
export async function withCache<T>(
    prefix: CachePrefix,
    input: string,
    fn: () => Promise<T>,
    ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<T> {
    const key = generateCacheKey(prefix, input);

    // Check cache first
    const cached = await getCached<T>(key);
    if (cached !== null) {
        return cached;
    }

    // Cache miss - execute function
    const result = await fn();

    // Store in cache
    await setCache(key, result, ttlSeconds);

    return result;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
    keyCount: number;
    memoryUsage: string;
}> {
    try {
        const redis = getRedisClient();
        const info = await redis.info('memory');
        const keyCount = await redis.dbsize();

        // Parse memory usage from info
        const memoryMatch = info.match(/used_memory_human:(\S+)/);
        const memoryUsage = memoryMatch ? memoryMatch[1] : 'unknown';

        return { keyCount, memoryUsage };
    } catch (error) {
        console.error('[Cache] Error getting stats:', error);
        return { keyCount: 0, memoryUsage: 'unknown' };
    }
}
