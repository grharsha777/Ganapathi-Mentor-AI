import { extractDomain, scoreDomainAuthority } from '@/lib/research/ranking';

import type { ProviderSearchOptions, SearchProvider, UnifiedSearchResult } from '@/lib/research/types';

export class MockSearchProvider implements SearchProvider {
  getName(): string {
    return 'Mock Search';
  }

  getIcon(): string {
    return '🧪';
  }

  isAvailable(): boolean {
    return true;
  }

  async search(query: string, _options: ProviderSearchOptions): Promise<UnifiedSearchResult[]> {
    const references = [
      {
        title: `${query} - Industry Overview`,
        url: 'https://example.com/research-overview',
        snippet: 'Synthetic fallback result for development mode.',
      },
      {
        title: `${query} - Technical Whitepaper`,
        url: 'https://example.com/whitepaper',
        snippet: 'Synthetic whitepaper summary used when external providers are unavailable.',
      },
    ];

    return references.map((entry, index) => {
      const domain = extractDomain(entry.url);
      const authority = scoreDomainAuthority(domain);

      return {
        id: `mock-${index}`,
        title: entry.title,
        url: entry.url,
        snippet: entry.snippet,
        domain,
        provider: 'Mock Provider',
        providerType: 'mock',
        relevanceScore: 70 - index * 5,
        recencyScore: 60,
        domainAuthorityScore: authority,
        reliability: Math.round((authority + 60 + 70) / 3),
      };
    });
  }
}
