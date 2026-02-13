
export interface StackAnswer {
    answer_id: number
    is_accepted: boolean
    score: number
    body_markdown?: string // Filter needed for this
    link: string
    creation_date: number
}

export interface StackQuestion {
    question_id: number
    title: string
    link: string
    is_answered: boolean
    view_count: number
    score: number
    tags: string[]
    creation_date: number
    answers?: StackAnswer[]
}

export async function searchStackOverflow(query: string, tag?: string): Promise<StackQuestion[]> {
    const apiKey = process.env.STACK_APPS_KEY
    const baseUrl = 'https://api.stackexchange.com/2.3/search/advanced'

    // Construct URL
    const params = new URLSearchParams({
        order: 'desc',
        sort: 'relevance',
        site: 'stackoverflow',
        q: query,
        filter: '!nNPvSNp63x' // Custom filter to include body/answers potentially, or just use default wrapper
    })

    if (tag) params.append('tagged', tag)
    if (apiKey) params.append('key', apiKey)

    try {
        const res = await fetch(`${baseUrl}?${params.toString()}`)
        if (!res.ok) throw new Error(`StackExchange API Error: ${res.statusText}`)

        const data = await res.json()
        return data.items || []
    } catch (error) {
        console.error("StackExchange Search Error:", error)
        return []
    }
}
