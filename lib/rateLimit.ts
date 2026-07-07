/**
 * lib/rateLimit.ts
 * In-memory per-user, per-feature rate limiter.
 * Uses a sliding window counter stored in a Map.
 * No external Redis dependency — runs entirely in the Node.js process.
 *
 * Limits (per minute):
 *   chat     → 10 requests / minute
 *   analysis → 5  requests / minute
 *   research → 3  requests / minute
 */

interface RateLimitEntry {
    count: number;
    windowStart: number; // epoch ms
}

// Global in-memory store — persists across requests within the same process
const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 minute

const LIMITS: Record<string, number> = {
    chat: 10,
    analysis: 5,
    research: 3,
};

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetInMs: number;
}

/**
 * Checks and records a rate-limit tick for a user+feature combination.
 * Returns whether the request is allowed and how many remain in the current window.
 */
export function checkRateLimit(userId: string, feature: string): RateLimitResult {
    const key = `${userId}:${feature}`;
    const limit = LIMITS[feature] ?? 5;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now - entry.windowStart > WINDOW_MS) {
        // Start a new window
        store.set(key, { count: 1, windowStart: now });
        return { allowed: true, remaining: limit - 1, resetInMs: WINDOW_MS };
    }

    if (entry.count >= limit) {
        const resetInMs = WINDOW_MS - (now - entry.windowStart);
        return { allowed: false, remaining: 0, resetInMs };
    }

    entry.count += 1;
    const remaining = limit - entry.count;
    const resetInMs = WINDOW_MS - (now - entry.windowStart);
    return { allowed: true, remaining, resetInMs };
}

/**
 * Cleans up stale entries from the in-memory store.
 * Call this periodically to prevent unbounded memory growth.
 */
export function pruneRateLimitStore(): void {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (now - entry.windowStart > WINDOW_MS * 2) {
            store.delete(key);
        }
    }
}

// Auto-prune every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(pruneRateLimitStore, 5 * 60_000);
}
