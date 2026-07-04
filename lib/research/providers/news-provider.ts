import { fetchWithRetry } from '@/lib/research/http';
import { extractDomain, scoreDomainAuthority, scoreRecency } from '@/lib/research/ranking';

import type { ProviderSearchOptions, SearchProvider, UnifiedSearchResult } from '@/lib/research/types';

type NewsApiArticle = {
  title?: string;
  url?: string;
  description?: string;
  publishedAt?: string;
  source?: { name?: string };
};

type GdeltArticle = {
  title?: string;
  url?: string;
  seendate?: string;
  sourcecountry?: string;
};

export class NewsSearchProvider implements SearchProvider {
  getName(): string {
    return 'News Search';
  }

  getIcon(): string {
    return '📰';
  }

  isAvailable(): boolean {
    return true;
  }

  async search(query: string, options: ProviderSearchOptions): Promise<UnifiedSearchResult[]> {
    const limit = options.limit ?? 6;
    const [newsApiResults, gdeltResults] = await Promise.all([
      this.searchNewsApi(query, limit, options.dateRange),
      this.searchGdelt(query, limit, options.dateRange),
    ]);

    return [...newsApiResults, ...gdeltResults];
  }

  private async searchNewsApi(
    query: string,
    limit: number,
    dateRange?: { from?: string; to?: string },
  ): Promise<UnifiedSearchResult[]> {
    const apiKey = process.env.NEWSAPI_ORG_KEY;
    if (!apiKey) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: String(limit),
        apiKey,
      });
      if (dateRange?.from) {
        params.set('from', dateRange.from);
      }
      if (dateRange?.to) {
        params.set('to', dateRange.to);
      }

      const response = await fetchWithRetry(`https://newsapi.org/v2/everything?${params.toString()}`);
      const payload = (await response.json()) as { articles?: NewsApiArticle[] };
      const articles = payload.articles ?? [];

      return articles
        .filter((article): article is Required<Pick<NewsApiArticle, 'title' | 'url'>> & NewsApiArticle =>
          Boolean(article.title && article.url),
        )
        .map((article, index) => {
          const domain = extractDomain(article.url);
          const recency = scoreRecency(article.publishedAt);
          const authority = scoreDomainAuthority(domain);

          return {
            id: `newsapi-${index}-${article.url}`,
            title: article.title,
            url: article.url,
            snippet: article.description ?? `Coverage by ${article.source?.name ?? domain}`,
            domain,
            provider: article.source?.name || 'NewsAPI',
            providerType: 'news' as const,
            publishedDate: article.publishedAt,
            relevanceScore: Math.max(55, 96 - index * 6),
            recencyScore: recency,
            domainAuthorityScore: authority,
            reliability: Math.round((authority + recency + 76) / 3),
          };
        });
    } catch {
      return [];
    }
  }

  private async searchGdelt(
    query: string,
    limit: number,
    dateRange?: { from?: string; to?: string },
  ): Promise<UnifiedSearchResult[]> {
    try {
      const params = new URLSearchParams({
        query:
          dateRange?.from && dateRange?.to
            ? `${query} AND date>${dateRange.from.split('T')[0]} AND date<${dateRange.to.split('T')[0]}`
            : query,
        format: 'json',
        maxrecords: String(limit),
        sort: 'datedesc',
      });

      const response = await fetchWithRetry(`https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`);
      const payload = (await response.json()) as { articles?: GdeltArticle[] };
      const articles = payload.articles ?? [];

      return articles
        .filter((article): article is Required<Pick<GdeltArticle, 'title' | 'url'>> & GdeltArticle =>
          Boolean(article.title && article.url),
        )
        .map((article, index) => {
          const domain = extractDomain(article.url);
          const publishedDate = article.seendate
            ? `${article.seendate.substring(0, 4)}-${article.seendate.substring(4, 6)}-${article.seendate.substring(6, 8)}`
            : undefined;
          const recency = scoreRecency(publishedDate);
          const authority = scoreDomainAuthority(domain);

          return {
            id: `gdelt-${index}-${article.url}`,
            title: article.title,
            url: article.url,
            snippet: `International news coverage (${article.sourcecountry ?? 'global'})`,
            domain,
            provider: 'GDELT',
            providerType: 'news' as const,
            publishedDate,
            relevanceScore: Math.max(50, 90 - index * 6),
            recencyScore: recency,
            domainAuthorityScore: authority,
            reliability: Math.round((authority + recency + 70) / 3),
          };
        });
    } catch {
      return [];
    }
  }
}
