/**
 * Unsplash image client — routes through our server-side proxy.
 * The Unsplash API key is NEVER exposed to the browser.
 * All requests hit /api/assets/unsplash which reads the key server-side only.
 */

export interface UnsplashImage {
  id: string;
  url: string;
  alt_description: string | null;
  photographer: string;
  photographer_url: string;
}

export async function fetchUnsplashImages(query: string, count: number = 3): Promise<UnsplashImage[]> {
  try {
    const params = new URLSearchParams({
      query,
      count: String(Math.min(count, 10)),
    });

    const response = await fetch(`/api/assets/unsplash?${params.toString()}`, {
      // Credentials needed so the httpOnly cookie (auth token) is sent
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn('[unsplash] Proxy returned', response.status);
      return [];
    }

    const data = await response.json();
    return data.images ?? [];
  } catch (error) {
    console.error('[unsplash] Failed to fetch images:', error);
    return [];
  }
}
