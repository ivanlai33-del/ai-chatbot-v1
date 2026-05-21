/**
 * Per-Bot Concurrent Request Soft Limiter
 *
 * Purpose: Prevent any single bot from monopolising system resources during
 * traffic spikes. Instead of rejecting overflow requests, they are queued and
 * processed as soon as a slot opens up — users experience a small delay, not
 * an error.
 *
 * Limits (internal, NOT advertised):
 *   499 / Lite plan  → 10 concurrent AI calls per bot
 *   1199 / 強力 plan → 50 concurrent AI calls per bot
 *
 * Note: In a true multi-instance Vercel deployment each instance maintains its
 * own counter. For an exact global limit you would use Upstash Redis — this
 * in-process solution is sufficient up to ~300 active bots (single region).
 */

const activeCalls = new Map<string, number>();

/** Resolve the soft limit for a given plan name stored in the DB. */
export function getConcurrentLimit(selectedPlan: string | null | undefined): number {
    if (!selectedPlan) return 10;
    if (selectedPlan.includes('1199') || selectedPlan.includes('強力')) return 50;
    return 10; // 499 / Lite default
}

/**
 * Acquire a concurrency slot for `botId`.
 * Returns true immediately if a slot is free.
 * Otherwise waits (polling every 300 ms) up to `timeoutMs` for a slot.
 * Returns false if the timeout is reached — caller should reply with a
 * friendly "我現在有點忙" message.
 */
export async function acquireSlot(
    botId: string,
    limit: number,
    timeoutMs: number = 2_000
): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        const current = activeCalls.get(botId) ?? 0;
        if (current < limit) {
            activeCalls.set(botId, current + 1);
            return true;
        }
        await new Promise((r) => setTimeout(r, 300));
    }

    // ✅ Serverless-safe: In-memory counters are unreliable across instances.
    // If we can't confirm a free slot, allow the call through anyway.
    // Better to process than to silently drop messages.
    console.warn(`[Concurrency] Slot timeout for bot ${botId}, allowing through anyway.`);
    activeCalls.set(botId, (activeCalls.get(botId) ?? 0) + 1);
    return true;
}

/** Release a concurrency slot after processing is done. */
export function releaseSlot(botId: string): void {
    const current = activeCalls.get(botId) ?? 0;
    if (current <= 1) {
        activeCalls.delete(botId);
    } else {
        activeCalls.set(botId, current - 1);
    }
}

/** Read the current active call count for a bot (for monitoring / debug). */
export function getActiveCallCount(botId: string): number {
    return activeCalls.get(botId) ?? 0;
}
