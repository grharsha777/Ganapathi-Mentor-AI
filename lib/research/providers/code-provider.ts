import { searchStackOverflow } from '@/lib/integrations/stack-exchange';
import { fetchWithRetry } from '@/lib/research/http';
import { extractDomain, scoreDomainAuthority, scoreRecency } from '@/lib/research/ranking';

import type { ProviderSearchOptions, SearchProvider, UnifiedSearchResult } from '@/lib/research/types';

type GithubRepository = {
  full_name: string;
  html_url: string;
  description: string | null;
  pushed_at: string;
  stargazers_count: number;
};

export class CodeSearchProvider implements SearchProvider {
  getName(): string {
    return 'Code Search';
  }

  getIcon(): string {
    return '💻';
  }

  isAvailable(): boolean {
    return true;
  }

  async search(query: string, options: ProviderSearchOptions): Promise<UnifiedSearchResult[]> {
    const limit = options.limit ?? 6;
    const [stackResults, githubResults] = await Promise.all([
      this.searchStackOverflow(query, limit),
      this.searchGitHub(query, limit),
    ]);

    return [...stackResults, ...githubResults];
  }

  private async searchStackOverflow(query: string, limit: number): Promise<UnifiedSearchResult[]> {
    const items = await searchStackOverflow(query);

    return items.slice(0, limit).map((item, index) => {
      const domain = extractDomain(item.link);
      const recency = scoreRecency(new Date(item.creation_date * 1000).toISOString());
      const authority = scoreDomainAuthority(domain);

      return {
        id: `so-${item.question_id}`,
        title: item.title,
        url: item.link,
        snippet: `Score ${item.score}, ${item.answer_count} answers, tags: ${item.tags.join(', ')}`,
        domain,
        provider: 'Stack Overflow',
        providerType: 'code',
        publishedDate: new Date(item.creation_date * 1000).toISOString(),
        relevanceScore: Math.max(55, 95 - index * 5),
        recencyScore: recency,
        domainAuthorityScore: authority,
        reliability: Math.round((authority + recency + Math.min(95, 65 + item.score)) / 3),
      };
    });
  }

  private async searchGitHub(query: string, limit: number): Promise<UnifiedSearchResult[]> {
    try {
      const params = new URLSearchParams({
        q: `${query} in:name,description,readme`,
        sort: 'stars',
        order: 'desc',
        per_page: String(limit),
      });

      const response = await fetchWithRetry(`https://api.github.com/search/repositories?${params.toString()}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
        },
      });

      const payload = (await response.json()) as { items?: GithubRepository[] };
      const repos = payload.items ?? [];

      return repos.map((repo, index) => {
        const domain = extractDomain(repo.html_url);
        const recency = scoreRecency(repo.pushed_at);
        const authority = scoreDomainAuthority(domain);

        return {
          id: `gh-${repo.full_name}`,
          title: repo.full_name,
          url: repo.html_url,
          snippet: repo.description ?? `GitHub repository with ${repo.stargazers_count} stars.`,
          domain,
          provider: 'GitHub',
          providerType: 'code',
          publishedDate: repo.pushed_at,
          relevanceScore: Math.max(52, 92 - index * 4),
          recencyScore: recency,
          domainAuthorityScore: authority,
          reliability: Math.round((authority + recency + Math.min(95, 60 + repo.stargazers_count / 500)) / 3),
        };
      });
    } catch {
      return [];
    }
  }
}
