export interface UnsplashImage {
  id: string;
  url: string;
  alt_description: string | null;
  photographer: string;
  photographer_url: string;
}

export async function fetchUnsplashImages(query: string, count: number = 3): Promise<UnsplashImage[]> {
  const apiKey = process.env.NEXT_PUBLIC_UNSPLASH_KEY;
  if (!apiKey) {
    console.warn('Unsplash API key is missing');
    return [];
  }

  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`, {
      headers: {
        Authorization: `Client-ID ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.warn('Unsplash API error:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.results.map((img: any) => ({
      id: img.id,
      url: img.urls.regular,
      alt_description: img.alt_description,
      photographer: img.user.name,
      photographer_url: img.user.links.html,
    }));
  } catch (error) {
    console.error('Failed to fetch Unsplash images:', error);
    return [];
  }
}
