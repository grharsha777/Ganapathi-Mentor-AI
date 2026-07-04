import type { ResearchMode } from '@/lib/research/schemas';

interface ResearchAnalyticsSnapshot {
  totalQueries: number;
  successfulQueries: number;
  cacheHits: number;
  avgResponseMs: number;
  modeUsage: Record<ResearchMode, number>;
}

const metrics: ResearchAnalyticsSnapshot = {
  totalQueries: 0,
  successfulQueries: 0,
  cacheHits: 0,
  avgResponseMs: 0,
  modeUsage: {
    quick: 0,
    deep: 0,
    comparative: 0,
    academic: 0,
    news: 0,
    publication_labs: 0,
  },
};

export function trackResearchMetric(
  mode: ResearchMode,
  elapsedMs: number,
  success: boolean,
  cacheHit: boolean,
): void {
  metrics.totalQueries += 1;
  if (success) {
    metrics.successfulQueries += 1;
  }
  if (cacheHit) {
    metrics.cacheHits += 1;
  }

  metrics.modeUsage[mode] += 1;

  const previousCount = metrics.totalQueries - 1;
  metrics.avgResponseMs =
    previousCount === 0
      ? elapsedMs
      : Math.round((metrics.avgResponseMs * previousCount + elapsedMs) / metrics.totalQueries);
}

export function getResearchAnalytics(): ResearchAnalyticsSnapshot {
  return {
    ...metrics,
    modeUsage: { ...metrics.modeUsage },
  };
}
