import { searchSerp } from '@/lib/integrations/serp';
import { searchTavily } from '@/lib/integrations/tavily';
import { extractDomain, scoreDomainAuthority, scoreRecency } from '@/lib/research/ranking';

import type { ProviderSearchOptions, SearchProvider, UnifiedSearchResult } from '@/lib/research/types';

function extractPublishedDate(snippet: string): string | undefined {
  const isoMatch = snippet.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoMatch?.[1]) {
    return isoMatch[1];
  }

  const slashMatch = snippet.match(/\b(\d{1,2}\/\d{1,2}\/20\d{2})\b/);
  if (slashMatch?.[1]) {
    const [month, day, year] = slashMatch[1].split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return undefined;
}

export class WebSearchProvider implements SearchProvider {
  getName(): string {
    return 'Web Search';
  }

  getIcon(): string {
    return '🌐';
  }

  isAvailable(): boolean {
    return Boolean(process.env.TAVILY_API_KEY || process.env.SERP_API_KEY);
  }

  async search(query: string, options: ProviderSearchOptions): Promise<UnifiedSearchResult[]> {
    const limit = options.limit ?? 6;

    const [tavilyResults, serpResults] = await Promise.all([
      searchTavily(query, limit),
      searchSerp(query, limit),
    ]);

    const unified = [...tavilyResults, ...serpResults].map((result, index) => {
      const domain = extractDomain(result.link);
      const domainAuthority = scoreDomainAuthority(domain);
      const publishedDate = extractPublishedDate(result.snippet);
      const recency = scoreRecency(publishedDate);
      const relevance = Math.max(50, 100 - index * 6);

      return {
        id: `web-${index}-${result.link}`,
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        domain,
        provider: result.source,
        providerType: 'web' as const,
        publishedDate,
        relevanceScore: relevance,
        recencyScore: recency,
        domainAuthorityScore: domainAuthority,
        reliability: Math.round((domainAuthority + recency + relevance) / 3),
      };
    });

    return unified;
  }
}
