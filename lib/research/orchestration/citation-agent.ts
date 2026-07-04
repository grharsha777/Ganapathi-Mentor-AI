import type { StructuredResearchResponse } from '@/lib/research/schemas';
import type { UnifiedSearchResult } from '@/lib/research/types';

function normalizeCitationIds(ids: number[], maxId: number): number[] {
  return Array.from(
    new Set(ids.filter((id) => Number.isInteger(id) && id > 0 && id <= maxId)),
  ).sort((a, b) => a - b);
}

function extractContentCitations(content: string): number[] {
  const matches = content.match(/\[(\d+)\]/g) ?? [];
  return matches
    .map((match) => Number(match.replace(/[^0-9]/g, '')))
    .filter((value) => Number.isFinite(value));
}

export function enforceCitationQuality(
  answer: StructuredResearchResponse,
  rankedSources: UnifiedSearchResult[],
): StructuredResearchResponse {
  const maxId = answer.sources.length || rankedSources.length;

  const sections = answer.answer_sections.map((section) => {
    const fromContent = extractContentCitations(section.content);
    const normalized = normalizeCitationIds([...section.citations, ...fromContent], maxId);
    const fallbackCitations = normalized.length ? normalized : [1].filter((id) => id <= maxId);

    const contentWithCitation = fallbackCitations.length && !fromContent.length
      ? `${section.content} [${fallbackCitations[0]}]`
      : section.content;

    return {
      ...section,
      content: contentWithCitation,
      citations: fallbackCitations,
    };
  });

  const claims = answer.key_claims.map((claim) => {
    const citations = normalizeCitationIds(claim.citations, maxId);
    return {
      ...claim,
      citations: citations.length ? citations : [1].filter((id) => id <= maxId),
      verdict: citations.length ? claim.verdict : 'insufficient',
    };
  });

  const bibliography = answer.bibliography.length
    ? answer.bibliography
    : answer.sources.map((source) => ({
        source_id: source.id,
        citation: `${source.title}. ${source.url}`,
      }));

  return {
    ...answer,
    answer_sections: sections,
    key_claims: claims,
    bibliography,
  };
}
