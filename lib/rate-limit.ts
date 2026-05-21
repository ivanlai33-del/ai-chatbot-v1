import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(identifier: string, limit: number = 30, windowInSeconds: number = 60) {
    const key = `rate_limit:${identifier}`;
    
    try {
        const current = await redis.incr(key);
        
        if (current === 1) {
            await redis.expire(key, windowInSeconds);
        }
        
        return {
            current,
            limit,
            remaining: Math.max(0, limit - current),
            success: current <= limit,
        };
    } catch (e) {
        console.warn("[Rate Limit] Redis connection failed, bypassing limit for safety.");
        return { success: true, remaining: 1, current: 0, limit };
    }
}
