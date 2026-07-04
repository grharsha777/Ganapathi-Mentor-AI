import type { StructuredResearchResponse } from '@/lib/research/schemas';
import type { UnifiedSearchResult } from '@/lib/research/types';

import type { FactCheckSummary } from '@/lib/research/orchestration/types';

function citationRatio(answer: StructuredResearchResponse): number {
  const citedSections = answer.answer_sections.filter((section) => {
    const markers = section.content.match(/\[(\d+)\]/g) ?? [];
    return markers.length > 0 || section.citations.length > 0;
  }).length;

  if (!answer.answer_sections.length) {
    return 0;
  }

  return Math.round((citedSections / answer.answer_sections.length) * 100);
}

function supportScore(sources: UnifiedSearchResult[]): number {
  if (!sources.length) {
    return 0;
  }

  const providerDiversity = new Set(sources.map((source) => source.providerType)).size;
  const avgReliability =
    sources.reduce((sum, source) => sum + source.reliability, 0) / Math.max(1, sources.length);

  return Math.round(Math.min(100, avgReliability * 0.7 + providerDiversity * 8));
}

export function summarizeFactCheck(
  answer: StructuredResearchResponse,
  sources: UnifiedSearchResult[],
): FactCheckSummary {
  const contradictionSignals = answer.counter_arguments.slice(0, 3);

  return {
    citationCoverage: citationRatio(answer),
    crossSourceSupport: supportScore(sources),
    weakClaimCount: answer.key_claims.filter((claim) => claim.verdict !== 'supported').length,
    contradictionSignals,
  };
}
