const SERP_API_KEY = process.env.SERP_API_KEY;
const SERP_BASE_URL = 'https://serpapi.com/search.json';

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    position: number;
}

/**
 * Search the web using SerpAPI (Google Search)
 */
export async function searchWeb(query: string, num: number = 5): Promise<SearchResult[]> {
    if (!SERP_API_KEY) throw new Error('SERP_API_KEY is not configured');

    const params = new URLSearchParams({
        q: query,
        engine: 'google',
        api_key: SERP_API_KEY,
        num: num.toString(),
    });

    const response = await fetch(`${SERP_BASE_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`SERP API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const organicResults = data.organic_results || [];

    return organicResults.map((r: any) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
        position: r.position,
    }));
}

/**
 * Search for programming-related content
 */
export async function searchProgrammingDocs(query: string): Promise<SearchResult[]> {
    return searchWeb(`${query} programming documentation tutorial`, 5);
}

export function isSerpConfigured(): boolean {
    return !!SERP_API_KEY;
}
