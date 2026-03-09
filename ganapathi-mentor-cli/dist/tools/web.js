"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webTools = void 0;
exports.web_search = web_search;
exports.webTools = [
    {
        type: "function",
        function: {
            name: "web_search",
            description: "Perform a basic web search (returns JSON results from DuckDuckGo HTML parsing)",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The search query" }
                },
                required: ["query"]
            }
        }
    }
];
async function web_search(query) {
    // A simplified fetch for DuckDuckGo's HTML version
    // Note: For a true robust tool, consider a dedicated API (like SerpAPI), but for this MVP:
    try {
        const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
        const html = await response.text();
        // We do a very basic regex extraction of result snippets/titles to keep dependencies light
        // (A real scraper would use cheerio, but we are keeping the dependency tree clean)
        const resultRegex = /<a class="result__url" href="([^"]+)">(.*?)<\/a>.*?<a class="result__snippet[^>]+>(.*?)<\/a>/gs;
        let match;
        const results = [];
        let count = 0;
        while ((match = resultRegex.exec(html)) !== null && count < 5) {
            // Clean tags out of the match
            const url = match[1];
            const snippet = match[3].replace(/<\/?[^>]+(>|$)/g, "");
            results.push(`URL: ${url}\nSnippet: ${snippet}`);
            count++;
        }
        if (results.length === 0) {
            return "No results found or rate limited. Sorry!";
        }
        return results.join('\n\n');
    }
    catch (err) {
        return `Web search error: ${err.message}`;
    }
}
