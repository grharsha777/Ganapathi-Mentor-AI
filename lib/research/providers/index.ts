import { AcademicSearchProvider } from '@/lib/research/providers/academic-provider';
import { CodeSearchProvider } from '@/lib/research/providers/code-provider';
import { MockSearchProvider } from '@/lib/research/providers/mock-provider';
import { NewsSearchProvider } from '@/lib/research/providers/news-provider';
import { WebSearchProvider } from '@/lib/research/providers/web-provider';
import { getDefaultProvidersForMode } from '@/lib/research/config';

import type { ResearchMode } from '@/lib/research/schemas';
import type { SearchProvider } from '@/lib/research/types';

const providerRegistry: Record<string, SearchProvider> = {
  web: new WebSearchProvider(),
  academic: new AcademicSearchProvider(),
  news: new NewsSearchProvider(),
  code: new CodeSearchProvider(),
  mock: new MockSearchProvider(),
};

export function getProviderByName(name: string): SearchProvider | null {
  return providerRegistry[name] ?? null;
}

export function getProvidersForMode(mode: ResearchMode): SearchProvider[] {
  return getDefaultProvidersForMode(mode).map((providerId) => providerRegistry[providerId]);
}

export function listAvailableProviders(): SearchProvider[] {
  const active = Object.values(providerRegistry).filter((provider) => provider.isAvailable());
  return active.length ? active : [providerRegistry.mock];
}
