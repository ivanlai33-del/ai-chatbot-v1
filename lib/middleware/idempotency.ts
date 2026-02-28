/**
 * Webhook Idempotency Guard
 * 
 * Problem: LINE's platform may retry webhooks if they don't receive a 200 response quickly enough.
 * This causes duplicate message processing (e.g., AI responding twice to the same message).
 *
 * Solution: Cache message IDs for a short window. If we've already seen a message ID, skip processing.
 *
 * Note: For a multi-instance serverless environment (Vercel), consider using Supabase or Redis
 * instead of this in-memory Map. For single-instance or low-traffic scenarios, this is sufficient.
 */

// TTL-based cache: Map<messageId, expiresAt>
const processedIds = new Map<string, number>();

const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000; // 5 minutes - LINE retries within this window

/**
 * Marks a message as processed. Returns true if this is the FIRST time seeing this ID.
 * Returns false if it's a duplicate (already processed).
 */
export function markAsProcessed(messageId: string): boolean {
    const now = Date.now();

    // Check if already processed
    const expiry = processedIds.get(messageId);
    if (expiry && now < expiry) {
        return false; // DUPLICATE: skip processing
    }

    // Mark as processed with expiry
    processedIds.set(messageId, now + IDEMPOTENCY_TTL_MS);

    // Periodic cleanup of expired entries to prevent memory leak
    if (processedIds.size > 5000) {
        processedIds.forEach((exp, id) => {
            if (now > exp) processedIds.delete(id);
        });
    }

    return true; // FRESH: safe to process
}

/**
 * Helper to extract a stable idempotency key from a LINE event.
 * Uses the message ID if available, otherwise falls back to a composite key.
 */
export function getIdempotencyKey(event: any): string | null {
    if (event.message?.id) {
        return `msg-${event.message.id}`;
    }
    if (event.type === 'follow' || event.type === 'unfollow') {
        return `${event.type}-${event.source?.userId}-${event.timestamp}`;
    }
    return null; // For events we don't need to deduplicate
}
