import { combinedScore } from '@/lib/research/ranking';

import type { UnifiedSearchResult } from '@/lib/research/types';

export function rerankEvidence(results: UnifiedSearchResult[], targetCount = 10): UnifiedSearchResult[] {
  const byType: Record<string, UnifiedSearchResult[]> = {
    web: [],
    news: [],
    academic: [],
    code: [],
    mock: [],
  };

  for (const item of results) {
    byType[item.providerType].push(item);
  }

  for (const items of Object.values(byType)) {
    items.sort((a, b) => combinedScore(b) - combinedScore(a));
  }

  const diversified: UnifiedSearchResult[] = [];
  const order: Array<keyof typeof byType> = ['academic', 'web', 'news', 'code', 'mock'];

  let cursor = 0;
  while (diversified.length < targetCount) {
    let added = false;

    for (const key of order) {
      const candidate = byType[key][cursor];
      if (!candidate) {
        continue;
      }

      diversified.push(candidate);
      added = true;

      if (diversified.length >= targetCount) {
        break;
      }
    }

    if (!added) {
      break;
    }

    cursor += 1;
  }

  return diversified.length ? diversified : results.slice(0, targetCount);
}
