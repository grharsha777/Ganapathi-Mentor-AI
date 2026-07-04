import { searchArxiv } from '@/lib/integrations/arxiv';
import { searchSemanticScholar } from '@/lib/integrations/semantic-scholar';
import { extractDomain, scoreDomainAuthority, scoreRecency } from '@/lib/research/ranking';

import type { ProviderSearchOptions, SearchProvider, UnifiedSearchResult } from '@/lib/research/types';

export class AcademicSearchProvider implements SearchProvider {
  getName(): string {
    return 'Academic Search';
  }

  getIcon(): string {
    return '🎓';
  }

  isAvailable(): boolean {
    return true;
  }

  async search(query: string, options: ProviderSearchOptions): Promise<UnifiedSearchResult[]> {
    const limit = options.limit ?? 6;
    const [arxivResults, semanticResults] = await Promise.all([
      searchArxiv(query, Math.max(2, Math.ceil(limit / 2))),
      searchSemanticScholar(query, Math.max(2, Math.ceil(limit / 2))),
    ]);

    const normalizedArxiv: UnifiedSearchResult[] = arxivResults.map((paper, index) => {
      const url = paper.link || paper.id;
      const domain = extractDomain(url);
      const recencyScore = scoreRecency(paper.published);
      const domainAuthority = scoreDomainAuthority(domain);

      return {
        id: `academic-arxiv-${index}-${paper.id}`,
        title: paper.title,
        url,
        snippet: paper.summary,
        domain,
        provider: 'arXiv',
        providerType: 'academic',
        publishedDate: paper.published,
        relevanceScore: Math.max(60, 100 - index * 8),
        recencyScore,
        domainAuthorityScore: domainAuthority,
        reliability: Math.round((domainAuthority + recencyScore + 84) / 3),
      };
    });

    const normalizedSemantic: UnifiedSearchResult[] = semanticResults.map((paper, index) => {
      const url = paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`;
      const domain = extractDomain(url);
      const publishedDate = paper.year ? `${paper.year}-01-01` : undefined;
      const recencyScore = scoreRecency(publishedDate);
      const domainAuthority = scoreDomainAuthority(domain);

      return {
        id: `academic-semantic-${index}-${paper.paperId}`,
        title: paper.title,
        url,
        snippet: paper.abstract || `Academic paper with ${paper.citationCount} citations.`,
        domain,
        provider: 'Semantic Scholar',
        providerType: 'academic',
        publishedDate,
        relevanceScore: Math.max(58, 98 - index * 7),
        recencyScore,
        domainAuthorityScore: domainAuthority,
        reliability: Math.round((domainAuthority + recencyScore + Math.min(95, 60 + paper.citationCount / 5)) / 3),
      };
    });

    return [...normalizedArxiv, ...normalizedSemantic];
  }
}
