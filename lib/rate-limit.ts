/**
 * Simple in-memory rate limiter for API routes.
 * Uses sliding window counter algorithm.
 * 
 * For production scale, consider using Redis-based rate limiting via lib/redis.ts
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
}

/**
 * Check if a request should be rate limited.
 * 
 * @param identifier - Unique identifier for the client (IP, userId, etc.)
 * @param config - Rate limit configuration
 * @returns Object with `limited` boolean and `remaining` count
 * 
 * @example
 * ```ts
 * const { limited, remaining } = checkRateLimit(ip, { maxRequests: 10, windowSeconds: 60 });
 * if (limited) return res.status(429).json({ error: 'Too many requests' });
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowSeconds * 1000,
    });
    return { limited: false, remaining: config.maxRequests - 1, resetIn: config.windowSeconds };
  }

  entry.count++;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetIn = Math.ceil((entry.resetTime - now) / 1000);

  if (entry.count > config.maxRequests) {
    return { limited: true, remaining: 0, resetIn };
  }

  return { limited: false, remaining, resetIn };
}

/**
 * Extract client IP from Next.js API request.
 * Handles Vercel edge, proxied, and direct connections.
 */
export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0].trim();
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string') return real;
  return req.socket?.remoteAddress || 'unknown';
}

// Pre-configured rate limit profiles
export const RATE_LIMITS = {
  /** Auth routes: 10 attempts per 15 minutes */
  AUTH: { maxRequests: 10, windowSeconds: 900 },
  /** AI generation routes: 20 requests per minute */
  AI_GENERATION: { maxRequests: 20, windowSeconds: 60 },
  /** General API: 60 requests per minute */
  GENERAL: { maxRequests: 60, windowSeconds: 60 },
  /** Strict: 5 requests per minute (for expensive operations) */
  STRICT: { maxRequests: 5, windowSeconds: 60 },
} as const;
