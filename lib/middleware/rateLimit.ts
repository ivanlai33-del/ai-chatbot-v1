/**
 * In-Memory Rate Limiter (Production: use Redis or Upstash for multi-instance support)
 * 
 * Design:
 * - Each API key (partner) gets a sliding window counter
 * - B2B APIs: 60 requests per minute
 * - Webhook: 1000 events per minute (handles LINE retry bursts)
 */

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

// Simple in-memory store (not suitable for serverless multi-instance, use Redis for prod)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Checks and updates the rate limit for a given key.
 * @param key - Unique identifier (e.g., API key hash or partner ID)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Window duration in milliseconds
 */
export function checkRateLimit(
    key: string,
    maxRequests: number = 60,
    windowMs: number = 60_000
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now - entry.windowStart >= windowMs) {
        // New window
        rateLimitStore.set(key, { count: 1, windowStart: now });
        return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    if (entry.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.windowStart + windowMs
        };
    }

    entry.count++;
    return {
        allowed: true,
        remaining: maxRequests - entry.count,
        resetAt: entry.windowStart + windowMs
    };
}

/**
 * Cleanup old entries periodically (prevents memory leak in long-running processes)
 * In serverless, this is less critical but still good practice.
 */
export function cleanupRateLimitStore(windowMs: number = 60_000) {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
        if (now - entry.windowStart >= windowMs * 2) {
            rateLimitStore.delete(key);
        }
    });
}
