'use server'

import { searchArxiv } from '@/lib/integrations/arxiv'
import { searchSemanticScholar } from '@/lib/integrations/semantic-scholar'
import { searchWikipedia } from '@/lib/integrations/wikipedia'
import { searchWikipediaPython } from '@/lib/integrations/wikipedia-python'
import { searchTavily } from '@/lib/integrations/tavily'
import { searchSerp } from '@/lib/integrations/serp'

export async function searchResearchPapers(query: string) {
    try {
        const [arxiv, semantic, wikiJs, wikiPy, tavily, serp] = await Promise.all([
            searchArxiv(query),
            searchSemanticScholar(query),
            searchWikipedia(query),
            searchWikipediaPython(query),
            searchTavily(query),
            searchSerp(query)
        ])

        // Merge Wikipedia results
        const wiki = [...wikiJs]
        if (!wiki.some(w => w.title.toLowerCase() === wikiPy.title.toLowerCase())) {
            wiki.unshift({
                id: Math.floor(Math.random() * 100000), // Temporary numeric ID
                title: `${wikiPy.title} (Verified)`,
                snippet: wikiPy.summary,
                url: wikiPy.url
            })
        }

        // Combine web results
        const web = [...serp, ...tavily]

        return {
            arxiv,
            semantic,
            wiki,
            web,
            apiKeys: {
                tavily: !!process.env.TAVILY_API_KEY,
                serp: !!process.env.SERP_API_KEY,
                semanticScholar: !!process.env.SEMANTIC_SCHOLAR_API_KEY
            }
        }
    } catch (error) {
        console.error('Error in searchResearchPapers action:', error)
        return {
            arxiv: [],
            semantic: [],
            wiki: [],
            web: [],
            apiKeys: {
                tavily: !!process.env.TAVILY_API_KEY,
                serp: !!process.env.SERP_API_KEY,
                semanticScholar: !!process.env.SEMANTIC_SCHOLAR_API_KEY
            }
        }
    }
}
