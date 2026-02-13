
export interface WikiResult {
    id: number
    title: string
    snippet: string
    url: string
}

export async function searchWikipedia(query: string, limit: number = 5): Promise<WikiResult[]> {
    try {
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            list: 'search',
            srsearch: query,
            srlimit: limit.toString(),
            origin: '*'
        })

        const res = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`, {
            headers: {
                'User-Agent': 'GanapathiMentorAI/1.0 (contact@ganapathimentor.ai)'
            }
        })

        if (!res.ok) throw new Error('Wikipedia API error')

        const data = await res.json()

        return data.query.search.map((item: any) => ({
            id: item.pageid,
            title: item.title,
            snippet: item.snippet.replace(/<[^>]*>/g, ''), // Strip HTML tags
            url: `https://en.wikipedia.org/?curid=${item.pageid}`
        }))

    } catch (error) {
        console.error('Wikipedia Search Error:', error)
        return []
    }
}
