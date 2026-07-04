import { fetchWithTimeout } from '@/lib/learning/resources/http';

export interface YouTubeOEmbed {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
}

export async function fetchYouTubeOEmbed(watchUrl: string): Promise<YouTubeOEmbed | null> {
  try {
    const endpoint = new URL('https://www.youtube.com/oembed');
    endpoint.searchParams.set('url', watchUrl);
    endpoint.searchParams.set('format', 'json');

    const response = await fetchWithTimeout(endpoint.toString(), { timeoutMs: 3500 });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as YouTubeOEmbed;
  } catch {
    return null;
  }
}

