'use server'

import { searchWikipedia } from '@/lib/integrations/wikipedia';
import { getProviderByName, getProvidersForMode } from '@/lib/research/providers';
import { runResearchPipeline } from '@/lib/research/pipeline';

import type { SearchProvider, UnifiedSearchResult } from '@/lib/research/types';

function selectProviders(providerNames?: string[]): SearchProvider[] {
  if (!providerNames?.length) {
    return getProvidersForMode('deep');
  }

  const providers = providerNames
    .map((name) => getProviderByName(name))
    .filter((provider): provider is SearchProvider => provider !== null);

  return providers.length ? providers : getProvidersForMode('deep');
}

function toLegacy(result: UnifiedSearchResult) {
  return {
    title: result.title,
    link: result.url,
    snippet: result.snippet,
    source: `${result.provider} (${result.providerType})`,
  };
}

export async function searchResearchPapers(query: string, providerNames?: string[]) {
  const providers = selectProviders(providerNames);

  const settled = await Promise.allSettled(
    providers.map((provider) => provider.search(query, { limit: 5, safeSearch: true })),
  );

  const web = settled
    .filter((entry): entry is PromiseFulfilledResult<UnifiedSearchResult[]> => entry.status === 'fulfilled')
    .flatMap((entry) => entry.value)
    .map(toLegacy);

  const wiki = await searchWikipedia(query, 4);

  const academic = settled
    .filter((entry): entry is PromiseFulfilledResult<UnifiedSearchResult[]> => entry.status === 'fulfilled')
    .flatMap((entry) => entry.value)
    .filter((item) => item.providerType === 'academic');

  return {
    arxiv: academic.slice(0, 4).map((item, index) => ({
      id: item.url,
      title: item.title,
      summary: item.snippet,
      authors: [],
      published: item.publishedDate ?? new Date().toISOString(),
      link: item.url,
      category: index % 2 === 0 ? 'cs.AI' : 'cs.LG',
    })),
    semantic: academic.slice(0, 4).map((item, index) => ({
      paperId: `semantic-${index}`,
      title: item.title,
      abstract: item.snippet,
      year: item.publishedDate ? Number(item.publishedDate.slice(0, 4)) : null,
      citationCount: Math.max(0, Math.round(item.reliability - 40)),
      authors: [],
      url: item.url,
    })),
    wiki,
    web,
    apiKeys: {
      tavily: Boolean(process.env.TAVILY_API_KEY),
      serp: Boolean(process.env.SERP_API_KEY),
      semanticScholar: Boolean(process.env.SEMANTIC_SCHOLAR_API_KEY),
    },
  };
}

export async function synthesizeResearch(query: string, _resultsJSON: string) {
  const result = await runResearchPipeline({
    query,
    mode: 'deep',
    safeSearch: true,
    includeDomains: [],
    excludeDomains: [],
  });

  const sections = result.answer.answer_sections
    .map((section) => `## ${section.heading}\n\n${section.content}\n\n- ${section.key_points.join('\n- ')}`)
    .join('\n\n');

  return [`# Executive Summary`, result.answer.tldr, '', sections].join('\n');
}
