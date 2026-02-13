
export interface SerpResult {
    title: string
    link: string
    snippet: string
    source: string
}

export async function searchSerp(query: string, limit: number = 5): Promise<SerpResult[]> {
    const apiKey = process.env.SERP_API_KEY
    if (!apiKey) return []

    try {
        const params = new URLSearchParams({
            q: query,
            api_key: apiKey,
            engine: 'google',
            num: limit.toString()
        })

        const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`)

        if (!res.ok) throw new Error('SerpAPI error')

        const data = await res.json()

        return (data.organic_results || []).map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            source: 'Google (via SerpAPI)'
        }))

    } catch (error) {
        console.error('SerpAPI Search Error:', error)
        return []
    }
}
