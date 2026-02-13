
export interface ArxivPaper {
    id: string
    title: string
    summary: string
    authors: string[]
    published: string
    link: string
    category: string
}

export async function searchArxiv(query: string, maxResults: number = 5): Promise<ArxivPaper[]> {
    try {
        const response = await fetch(
            `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`
        )

        if (!response.ok) {
            throw new Error(`ArXiv API error: ${response.statusText}`)
        }

        const xml = await response.text()
        return parseArxivResponse(xml)
    } catch (error) {
        console.error('Error fetching from arXiv:', error)
        return []
    }
}

function parseArxivResponse(xml: string): ArxivPaper[] {
    const papers: ArxivPaper[] = []

    // Simple regex parsing to avoid adding XML dependencies
    // Note: This is a basic implementation. For production robustness, use fast-xml-parser.
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    let match

    while ((match = entryRegex.exec(xml)) !== null) {
        const entry = match[1]

        const idMatch = entry.match(/<id>(.*?)<\/id>/)
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/)
        const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/)
        const publishedMatch = entry.match(/<published>(.*?)<\/published>/)
        const linksMatch = entry.match(/<link\s+title="pdf"\s+href="(.*?)"/) || entry.match(/<link\s+href="(.*?)"/)

        // Extract authors
        const authors: string[] = []
        const authorRegex = /<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g
        let authorMatch
        while ((authorMatch = authorRegex.exec(entry)) !== null) {
            authors.push(authorMatch[1])
        }

        if (titleMatch && summaryMatch) {
            papers.push({
                id: idMatch ? idMatch[1] : '',
                title: titleMatch[1].replace(/\n/g, ' ').trim(),
                summary: summaryMatch[1].replace(/\n/g, ' ').trim(),
                authors: authors,
                published: publishedMatch ? publishedMatch[1] : '',
                link: linksMatch ? linksMatch[1] : '',
                category: 'cs.AI' // Defaulting/Fallback
            })
        }
    }

    return papers
}
