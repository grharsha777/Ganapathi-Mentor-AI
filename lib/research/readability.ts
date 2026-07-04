import { fetchWithRetry } from '@/lib/research/http';

import type { UnifiedSearchResult } from '@/lib/research/types';

function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPrimaryContent(html: string): string {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (articleMatch?.[0]) {
    return stripHtml(articleMatch[0]);
  }

  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  if (mainMatch?.[0]) {
    return stripHtml(mainMatch[0]);
  }

  return stripHtml(html);
}

export async function enrichWithFullText(
  results: UnifiedSearchResult[],
  topK: number,
): Promise<UnifiedSearchResult[]> {
  const selected = results.slice(0, topK);

  const settled = await Promise.allSettled(
    selected.map(async (result) => {
      try {
        const response = await fetchWithRetry(result.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'GanapathiMentorResearch/1.0',
          },
          signal: AbortSignal.timeout(7000),
        });

        const html = await response.text();
        const extracted = extractPrimaryContent(html).slice(0, 2400);
        return {
          ...result,
          fullText: extracted || result.snippet,
        };
      } catch {
        return {
          ...result,
          fullText: result.snippet,
        };
      }
    }),
  );

  const enriched = settled.map((entry, index) => {
    if (entry.status === 'fulfilled') {
      return entry.value;
    }

    return {
      ...selected[index],
      fullText: selected[index].snippet,
    };
  });

  return [...enriched, ...results.slice(topK)];
}
