/**
 * lib/quota.ts
 * Server-side per-user monthly quota enforcement.
 * All operations hit MongoDB directly via the User model.
 */

import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';

export type QuotaFeature = 'chat' | 'analysis' | 'research';

export interface QuotaResult {
    allowed: boolean;
    used: number;
    limit: number;
    /** 0–100 */
    percent: number;
    /** ISO string of when the current period started */
    period_start: string;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Reads the current user quota for a feature without incrementing it.
 * Useful for the /api/quota status endpoint.
 */
export async function getUserQuota(userId: string): Promise<Record<QuotaFeature, QuotaResult> | null> {
    await connectToDatabase();
    const user = await User.findById(userId).lean<any>();
    if (!user) return null;

    const q = user.quota ?? {};
    const periodStart: Date = q.period_start ? new Date(q.period_start) : new Date();
    const now = new Date();

    // Auto-detect if we need a fresh period (handled lazily on increment)
    const isExpired = now.getTime() - periodStart.getTime() > THIRTY_DAYS_MS;

    const buildResult = (used: number, limit: number): QuotaResult => ({
        allowed: used < limit,
        used: isExpired ? 0 : used,
        limit,
        percent: isExpired ? 0 : Math.min(100, Math.round((used / limit) * 100)),
        period_start: periodStart.toISOString(),
    });

    return {
        chat: buildResult(q.chat_used ?? 0, q.chat_limit ?? 200),
        analysis: buildResult(q.analysis_used ?? 0, q.analysis_limit ?? 100),
        research: buildResult(q.research_used ?? 0, q.research_limit ?? 50),
    };
}

/**
 * Checks quota and atomically increments the counter if allowed.
 * Resets the period if it's older than 30 days.
 * Returns the quota state AFTER incrementing (so percent reflects new value).
 */
export async function checkAndIncrementQuota(
    userId: string,
    feature: QuotaFeature
): Promise<QuotaResult> {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
        return { allowed: false, used: 0, limit: 0, percent: 100, period_start: new Date().toISOString() };
    }

    // Ensure quota subdocument exists with defaults
    if (!user.quota) {
        user.quota = {
            period_start: new Date(),
            chat_used: 0, chat_limit: 200,
            analysis_used: 0, analysis_limit: 100,
            research_used: 0, research_limit: 50,
        };
    }

    const now = new Date();
    const periodStart: Date = user.quota.period_start ?? now;

    // Reset quota if period has expired
    if (now.getTime() - new Date(periodStart).getTime() > THIRTY_DAYS_MS) {
        user.quota.period_start = now;
        user.quota.chat_used = 0;
        user.quota.analysis_used = 0;
        user.quota.research_used = 0;
    }

    const usedKey = `${feature}_used` as keyof typeof user.quota;
    const limitKey = `${feature}_limit` as keyof typeof user.quota;
    const used: number = (user.quota[usedKey] as number) ?? 0;
    const limit: number = (user.quota[limitKey] as number) ?? 50;

    if (used >= limit) {
        return {
            allowed: false,
            used,
            limit,
            percent: 100,
            period_start: new Date(user.quota.period_start).toISOString(),
        };
    }

    // Atomically increment
    (user.quota as any)[usedKey] = used + 1;
    await user.save();

    const newUsed = used + 1;
    return {
        allowed: true,
        used: newUsed,
        limit,
        percent: Math.min(100, Math.round((newUsed / limit) * 100)),
        period_start: new Date(user.quota.period_start).toISOString(),
    };
}
