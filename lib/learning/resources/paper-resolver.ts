import { searchSemanticScholar } from '@/lib/integrations/semantic-scholar';

import type { LearningResource } from '@/lib/learning/types';

export async function resolvePapers(query: string, limit = 3): Promise<LearningResource[]> {
  try {
    const papers = await searchSemanticScholar(query, Math.max(2, limit));
    const normalized = papers
      .filter((paper) => paper.title && paper.paperId)
      .slice(0, limit)
      .map((paper, index) => {
        const url = paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`;
        return {
          id: `paper-${paper.paperId}-${index}`,
          type: 'paper' as const,
          title: paper.title,
          url,
          is_completed: false,
          confidence: paper.citationCount >= 50 ? 'verified' : 'unverified',
          provider: paper.year ? `Semantic Scholar (${paper.year})` : 'Semantic Scholar',
          domain: 'semanticscholar.org',
          relevance_note: 'Included because it is a directly related scholarly reference (validated metadata).',
          freshness: paper.year && paper.year >= new Date().getFullYear() - 2 ? 'recent' : 'unknown',
          estimated_minutes: 20,
          metadata: {
            paperId: paper.paperId,
            year: paper.year,
            citationCount: paper.citationCount,
            authors: paper.authors?.slice(0, 6)?.map((author) => author.name) ?? [],
            abstract: paper.abstract,
          },
        } satisfies LearningResource;
      });

    return normalized;
  } catch {
    return [];
  }
}

