import type { UnifiedSearchResult } from '@/lib/research/types';

const AUTHORITY_BOOSTS: Record<string, number> = {
  'arxiv.org': 98,
  'semanticscholar.org': 95,
  'nature.com': 92,
  'science.org': 92,
  'wikipedia.org': 84,
  'github.com': 82,
  'stackoverflow.com': 80,
  'reuters.com': 88,
  'bbc.com': 87,
  'nytimes.com': 87,
};

export function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

export function scoreDomainAuthority(domain: string): number {
  for (const [knownDomain, score] of Object.entries(AUTHORITY_BOOSTS)) {
    if (domain.endsWith(knownDomain)) {
      return score;
    }
  }

  if (domain.endsWith('.gov') || domain.endsWith('.edu')) {
    return 90;
  }

  if (domain.endsWith('.org')) {
    return 72;
  }

  return 62;
}

export function scoreRecency(publishedDate?: string): number {
  if (!publishedDate) {
    return 50;
  }

  const timestamp = Date.parse(publishedDate);
  if (Number.isNaN(timestamp)) {
    return 50;
  }

  const ageDays = Math.max(0, (Date.now() - timestamp) / (1000 * 60 * 60 * 24));
  if (ageDays <= 2) return 100;
  if (ageDays <= 7) return 92;
  if (ageDays <= 30) return 80;
  if (ageDays <= 180) return 65;
  if (ageDays <= 365) return 55;
  return 40;
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString().toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function deduplicateResults(results: UnifiedSearchResult[]): UnifiedSearchResult[] {
  const byKey = new Map<string, UnifiedSearchResult>();

  for (const result of results) {
    const key = normalizeUrl(result.url) || `${result.title.toLowerCase().trim()}:${result.domain}`;
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, result);
      continue;
    }

    const existingScore = combinedScore(existing);
    const candidateScore = combinedScore(result);
    if (candidateScore > existingScore) {
      byKey.set(key, result);
    }
  }

  return Array.from(byKey.values());
}

export function combinedScore(result: UnifiedSearchResult): number {
  return result.relevanceScore * 0.45 + result.recencyScore * 0.2 + result.domainAuthorityScore * 0.35;
}

export function rankResults(results: UnifiedSearchResult[]): UnifiedSearchResult[] {
  return [...results].sort((a, b) => combinedScore(b) - combinedScore(a));
}
