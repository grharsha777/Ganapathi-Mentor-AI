import { fetchWithTimeout } from '@/lib/learning/resources/http';
import { domainFromUrl, isDisallowedHost, isHttpUrl, isYouTubeSearchUrl } from '@/lib/learning/resources/url';

export interface UrlValidationResult {
  ok: boolean;
  url: string;
  finalUrl?: string;
  status?: number;
  contentType?: string | null;
  domain?: string;
  reason?: string;
}

const cache = new Map<string, { result: UrlValidationResult; expiresAt: number }>();
const DEFAULT_TTL_MS = 1000 * 60 * 60;

export async function validateUrl(url: string): Promise<UrlValidationResult> {
  const trimmed = url.trim();
  if (!trimmed) return { ok: false, url, reason: 'Empty URL' };
  if (!isHttpUrl(trimmed)) return { ok: false, url, reason: 'Not an http/https URL' };
  if (isDisallowedHost(trimmed)) return { ok: false, url, reason: 'Search engine URL is not a resource' };
  if (isYouTubeSearchUrl(trimmed)) return { ok: false, url, reason: 'YouTube search results are fallback-only' };

  const now = Date.now();
  const cached = cache.get(trimmed);
  if (cached && cached.expiresAt > now) {
    return cached.result;
  }

  const domain = domainFromUrl(trimmed);

  try {
    const response = await fetchWithTimeout(trimmed, { method: 'GET', timeoutMs: 3500 });
    const contentType = response.headers.get('content-type');
    const finalUrl = response.url || trimmed;
    const status = response.status;

    const ok = response.ok && status >= 200 && status < 400;
    const result: UrlValidationResult = {
      ok,
      url: trimmed,
      finalUrl,
      status,
      contentType,
      domain,
      reason: ok ? undefined : `HTTP ${status}`,
    };

    cache.set(trimmed, { result, expiresAt: now + DEFAULT_TTL_MS });
    return result;
  } catch (error) {
    const result: UrlValidationResult = {
      ok: false,
      url: trimmed,
      domain,
      reason: error instanceof Error ? error.message : 'Validation failed',
    };
    cache.set(trimmed, { result, expiresAt: now + 10 * 60 * 1000 });
    return result;
  }
}

