import { extractDomain, scoreDomainAuthority } from '@/lib/research/ranking';

const DISALLOWED_HOSTS = new Set([
  'google.com',
  'www.google.com',
  'bing.com',
  'www.bing.com',
  'duckduckgo.com',
  'www.duckduckgo.com',
]);

export const PREFERRED_DOC_HOSTS = [
  'react.dev',
  'nextjs.org',
  'nodejs.org',
  'developer.mozilla.org',
  'docs.docker.com',
  'kubernetes.io',
  'docs.github.com',
  'docs.aws.amazon.com',
  'cloud.google.com',
  'learn.microsoft.com',
  'docs.python.org',
  'pkg.go.dev',
  'rust-lang.org',
  'docs.rs',
];

export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeUrl(input: string): string {
  try {
    const url = new URL(input);
    url.hash = '';

    const params = url.searchParams;
    for (const key of Array.from(params.keys())) {
      if (key.startsWith('utm_') || key === 'gclid' || key === 'fbclid') {
        params.delete(key);
      }
    }
    url.search = params.toString() ? `?${params.toString()}` : '';

    return url.toString();
  } catch {
    return input.trim();
  }
}

export function domainFromUrl(url: string): string {
  return extractDomain(url);
}

export function isDisallowedHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return DISALLOWED_HOSTS.has(host);
  } catch {
    return true;
  }
}

export function isYouTubeWatchUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') return Boolean(parsed.pathname.replace('/', '').trim());
    if (host !== 'youtube.com' && host !== 'm.youtube.com') return false;
    return parsed.pathname === '/watch' && Boolean(parsed.searchParams.get('v'));
  } catch {
    return false;
  }
}

export function isYouTubeSearchUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host !== 'youtube.com' && host !== 'm.youtube.com') return false;
    return parsed.pathname === '/results' && Boolean(parsed.searchParams.get('search_query'));
  } catch {
    return false;
  }
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = parsed.pathname.replace('/', '').trim();
      return id.length ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/shorts/')[1]?.split('/')[0]?.trim();
        return id || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function looksLikeDocHost(domain: string): boolean {
  const normalized = domain.replace(/^www\./, '').toLowerCase();
  return PREFERRED_DOC_HOSTS.some((host) => normalized === host || normalized.endsWith(`.${host}`));
}

export function scoreTrust(domain: string): number {
  return scoreDomainAuthority(domain);
}

