
export interface SearchResult {
    title: string
    link: string
    snippet: string
    source: string
}

export async function searchTavily(query: string, limit: number = 5): Promise<SearchResult[]> {
    const apiKey = process.env.TAVILY_API_KEY
    if (!apiKey) return []

    try {
        const res = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                query,
                search_depth: "basic", // "advanced" costs more
                include_answer: false,
                include_images: false,
                max_results: limit
            })
        })

        if (!res.ok) throw new Error('Tavily API error')

        const data = await res.json()

        return data.results.map((item: any) => ({
            title: item.title,
            link: item.url,
            snippet: item.content,
            source: 'Tavily (AI Search)'
        }))

    } catch (error) {
        console.error('Tavily Search Error:', error)
        return []
    }
}
