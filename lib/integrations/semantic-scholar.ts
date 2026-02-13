
export interface SemanticPaper {
    paperId: string
    title: string
    abstract: string | null
    year: number | null
    citationCount: number
    authors: { name: string }[]
    url: string
}

export async function searchSemanticScholar(query: string, limit: number = 5): Promise<SemanticPaper[]> {
    const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY

    // Base headers
    const headers: HeadersInit = {}
    if (apiKey) {
        headers['x-api-key'] = apiKey
    }

    try {
        const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,abstract,authors,year,citationCount,url`

        const response = await fetch(url, { headers })

        if (response.status === 429) {
            console.warn('Semantic Scholar rate limit reached. Returning empty list.')
            return []
        }

        if (!response.ok) {
            // Fallback or error handling
            console.error('Semantic Scholar API error:', response.statusText)
            return []
        }

        const data = await response.json()
        return data.data || []

    } catch (error) {
        console.error('Error fetching from Semantic Scholar:', error)
        return []
    }
}
