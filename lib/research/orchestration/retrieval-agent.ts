import { getModeConfig, normalizeProviderNames } from '@/lib/research/config';
import { getProviderByName } from '@/lib/research/providers';
import { deduplicateResults, rankResults } from '@/lib/research/ranking';
import { enrichWithFullText } from '@/lib/research/readability';

import type { ResearchPipelineInput, UnifiedSearchResult } from '@/lib/research/types';

export interface RetrievalOutput {
  ranked: UnifiedSearchResult[];
  providerBreakdown: Record<string, number>;
  extractedSourceCount: number;
  groupedByRole: {
    web: UnifiedSearchResult[];
    news: UnifiedSearchResult[];
    academic: UnifiedSearchResult[];
    code: UnifiedSearchResult[];
  };
}

const SAFE_BLOCKED = ['adult', 'porn', 'xxx', 'gambling'];

function filterSources(results: UnifiedSearchResult[], input: ResearchPipelineInput): UnifiedSearchResult[] {
  const include = input.includeDomains.map((value) => value.toLowerCase());
  const exclude = input.excludeDomains.map((value) => value.toLowerCase());

  return results.filter((result) => {
    const domain = result.domain.toLowerCase();

    if (input.safeSearch && SAFE_BLOCKED.some((flag) => domain.includes(flag))) {
      return false;
    }

    if (include.length > 0 && !include.some((allowed) => domain.includes(allowed))) {
      return false;
    }

    if (exclude.some((blocked) => domain.includes(blocked))) {
      return false;
    }

    return true;
  });
}

function limitByMode(mode: ResearchPipelineInput['mode']): number {
  return getModeConfig(mode).retrievalLimit;
}

function extractionLimitByMode(mode: ResearchPipelineInput['mode']): number {
  return getModeConfig(mode).extractionLimit;
}

export async function retrieveEvidence(
  input: ResearchPipelineInput,
): Promise<RetrievalOutput> {
  const providerNames = normalizeProviderNames(input.mode, input.providerNames);
  const providers = providerNames
    .map((name) => getProviderByName(name))
    .filter((provider): provider is NonNullable<typeof provider> => provider !== null && provider.isAvailable());

  const settled = await Promise.allSettled(
    providers.map(async (provider) => {
      const results = await provider.search(input.query, {
        limit: limitByMode(input.mode),
        safeSearch: input.safeSearch,
        includeDomains: input.includeDomains,
        excludeDomains: input.excludeDomains,
        dateRange: input.dateRange,
      });

      return { name: provider.getName(), results };
    }),
  );

  const providerBreakdown: Record<string, number> = {};
  const combined: UnifiedSearchResult[] = [];

  for (const entry of settled) {
    if (entry.status !== 'fulfilled') {
      continue;
    }

    providerBreakdown[entry.value.name] = entry.value.results.length;
    combined.push(...entry.value.results);
  }

  const filtered = filterSources(combined, input);
  const deduplicated = deduplicateResults(filtered);
  const ranked = rankResults(deduplicated);
  const extractedSourceCount = Math.min(ranked.length, extractionLimitByMode(input.mode));
  const enriched = await enrichWithFullText(ranked, extractedSourceCount);

  return {
    ranked: enriched,
    providerBreakdown,
    extractedSourceCount,
    groupedByRole: {
      web: enriched.filter((entry) => entry.providerType === 'web'),
      news: enriched.filter((entry) => entry.providerType === 'news'),
      academic: enriched.filter((entry) => entry.providerType === 'academic'),
      code: enriched.filter((entry) => entry.providerType === 'code'),
    },
  };
}
