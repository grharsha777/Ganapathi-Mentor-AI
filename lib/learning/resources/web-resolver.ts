import { searchSerp } from '@/lib/integrations/serp';
import { searchTavily } from '@/lib/integrations/tavily';
import { scoreDomainAuthority } from '@/lib/research/ranking';

import { domainFromUrl, isDisallowedHost, isHttpUrl, looksLikeDocHost, normalizeUrl } from '@/lib/learning/resources/url';
import { validateUrl } from '@/lib/learning/resources/validate';

import type { LearningResource } from '@/lib/learning/types';

type WebCandidate = {
  title: string;
  url: string;
  snippet: string;
  provider: string;
  domain: string;
  authority: number;
};

function toCandidate(entry: { title: string; link: string; snippet: string; source: string }): WebCandidate | null {
  const url = entry.link?.trim();
  if (!url || !isHttpUrl(url) || isDisallowedHost(url)) return null;
  const normalized = normalizeUrl(url);
  const domain = domainFromUrl(normalized);
  return {
    title: entry.title,
    url: normalized,
    snippet: entry.snippet,
    provider: entry.source,
    domain,
    authority: scoreDomainAuthority(domain),
  };
}

function rankCandidates(candidates: WebCandidate[], preferDocs: boolean): WebCandidate[] {
  const sorted = [...candidates].sort((a, b) => b.authority - a.authority);
  if (!preferDocs) return sorted;
  return sorted.sort((a, b) => Number(looksLikeDocHost(b.domain)) - Number(looksLikeDocHost(a.domain)) || b.authority - a.authority);
}

function dedupeByUrl(candidates: WebCandidate[]): WebCandidate[] {
  const seen = new Set<string>();
  const out: WebCandidate[] = [];
  for (const c of candidates) {
    const key = c.url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

function buildWebResource(params: {
  id: string;
  type: 'article' | 'doc';
  title: string;
  url: string;
  domain: string;
  provider: string;
  snippet: string;
  confidence: LearningResource['confidence'];
  relevance: string;
}): LearningResource {
  return {
    id: params.id,
    type: params.type,
    title: params.title,
    url: params.url,
    is_completed: false,
    confidence: params.confidence,
    provider: params.provider,
    domain: params.domain,
    relevance_note: params.relevance,
    freshness: 'unknown',
    metadata: {
      snippet: params.snippet,
    },
  };
}

export async function resolveWebResources(input: {
  query: string;
  limit: number;
  preferDocs?: boolean;
  type: 'article' | 'doc';
  relevance: string;
}): Promise<LearningResource[]> {
  const [tavily, serp] = await Promise.allSettled([
    searchTavily(input.query, Math.max(3, input.limit)),
    searchSerp(input.query, Math.max(3, input.limit)),
  ]);

  const raw = [
    ...(tavily.status === 'fulfilled' ? tavily.value : []),
    ...(serp.status === 'fulfilled' ? serp.value : []),
  ];

  const candidates = dedupeByUrl(
    raw
      .map((entry) => toCandidate(entry))
      .filter((entry): entry is WebCandidate => Boolean(entry)),
  );

  const ranked = rankCandidates(candidates, Boolean(input.preferDocs));
  const output: LearningResource[] = [];

  for (const candidate of ranked) {
    if (output.length >= input.limit) break;
    const validation = await validateUrl(candidate.url);
    if (!validation.ok) continue;
    output.push(
      buildWebResource({
        id: `${input.type}-${candidate.domain}-${output.length}`,
        type: input.type,
        title: candidate.title,
        url: validation.finalUrl ?? candidate.url,
        domain: candidate.domain,
        provider: looksLikeDocHost(candidate.domain) ? 'Official Docs' : candidate.provider,
        snippet: candidate.snippet,
        confidence: candidate.authority >= 82 ? 'verified' : 'unverified',
        relevance: input.relevance,
      }),
    );
  }

  return output;
}

