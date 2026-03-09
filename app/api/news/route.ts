import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const query = searchParams.get('q') || '';
    // Note: page params differ between APIs, so we handle it generally
    // const page = searchParams.get('page') || '1'; 

    const newsDataKey = process.env.NEWSDATA_AI_KEY;
    const newsApiKey = process.env.NEWSAPI_ORG_KEY;

    if (!newsDataKey && !newsApiKey) {
        return NextResponse.json({ error: 'News API keys not configured' }, { status: 500 });
    }

    try {
        const fetchPromises = [];

        // --- 1. NewsData.ai ---
        if (newsDataKey) {
            // Map our categories to NewsData categories
            let ndCategory = '';
            if (category === 'ai' || category === 'developer' || category === 'technology') {
                ndCategory = '&category=technology';
            } else if (category === 'science') {
                ndCategory = '&category=science';
            } else if (category === 'world') {
                ndCategory = '&category=world';
            } else if (category === 'business') {
                ndCategory = '&category=business';
            } else if (category === 'health') {
                ndCategory = '&category=health';
            }

            let ndQuery = '';
            if (query) {
                ndQuery = `&q=${encodeURIComponent(query)}`;
            } else if (category === 'ai') {
                ndQuery = '&q=artificial%20intelligence%20OR%20machine%20learning';
            } else if (category === 'developer') {
                ndQuery = '&q=software%20developer%20OR%20programming';
            }

            // We explicitly request English language
            const ndUrl = `https://newsdata.io/api/1/news?apikey=${newsDataKey}&language=en${ndCategory}${ndQuery}&image=1`;

            fetchPromises.push(
                fetch(ndUrl, { next: { revalidate: 300 } })
                    .then(res => {
                        if (!res.ok) throw new Error(`NewsData API error: ${res.status}`);
                        return res.json();
                    })
                    .then(data => {
                        if (!data.results) return [];
                        return data.results.map((item: any) => ({
                            id: item.article_id || Math.random().toString(36).substring(7),
                            title: item.title,
                            description: item.description || item.content?.substring(0, 200) || '',
                            url: item.link,
                            imageUrl: item.image_url || null, // NewsData explicitly returns image_url
                            source: item.source_id || 'News',
                            author: item.creator ? item.creator[0] : null,
                            publishedAt: item.pubDate,
                            apiSource: 'newsdata',
                        }));
                    })
                    .catch(err => {
                        console.error('NewsData fetch failed:', err);
                        return []; // Fallback empty array so Promise.all doesn't fail
                    })
            );
        }

        // --- 2. NewsAPI.org ---
        if (newsApiKey) {
            let endpoint = 'top-headlines';
            let naCategory = '';
            let naQuery = '';

            if (query) {
                endpoint = 'everything';
                naQuery = `&q=${encodeURIComponent(query)}`;
            } else {
                if (category === 'world' || category === 'all') {
                    // For general world news we can just query top headlines for US
                    naCategory = '&country=us';
                } else if (category === 'ai') {
                    endpoint = 'everything';
                    naQuery = '&q="artificial intelligence" OR "machine learning"';
                } else if (category === 'developer') {
                    endpoint = 'everything';
                    naQuery = '&q="software developer" OR "programming"';
                } else {
                    // Valid categories for top-headlines: business, health, science, technology
                    naCategory = `&category=${category}&country=us`;
                    if (category === 'technology') naCategory = '&category=technology&country=us';
                }
            }

            const naUrl = `https://newsapi.org/v2/${endpoint}?apiKey=${newsApiKey}&language=en${naCategory}${naQuery}&pageSize=20`;

            fetchPromises.push(
                fetch(naUrl, { next: { revalidate: 300 } })
                    .then(res => {
                        if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);
                        return res.json();
                    })
                    .then(data => {
                        if (!data.articles) return [];
                        return data.articles
                            // Filter out empty/removed articles
                            .filter((item: any) => item.title && item.title !== '[Removed]')
                            .map((item: any) => ({
                                id: Math.random().toString(36).substring(7),
                                title: item.title,
                                description: item.description || item.content?.substring(0, 200) || '',
                                url: item.url,
                                imageUrl: item.urlToImage || null,
                                source: item.source?.name || 'News',
                                author: item.author,
                                publishedAt: item.publishedAt,
                                apiSource: 'newsapi',
                            }));
                    })
                    .catch(err => {
                        console.error('NewsAPI fetch failed:', err);
                        return [];
                    })
            );
        }

        // Resolve both APIs simultaneously
        const resultsArray = await Promise.all(fetchPromises);

        // Combine, flatten, and filter out items without images (since we want a highly visual UI)
        const combinedArticles = resultsArray.flat().filter(article => article.imageUrl);

        // Sort by publish date descending
        combinedArticles.sort((a, b) => {
            const dateA = new Date(a.publishedAt).getTime();
            const dateB = new Date(b.publishedAt).getTime();
            return dateB - dateA;
        });

        // Deduplicate by title similarity (rough implementation)
        const uniqueMap = new Map();
        combinedArticles.forEach(article => {
            // Create a simplified key from the title (alphanumeric only, lowercase, first 30 chars)
            if (!article.title) return;
            const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 30);
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, article);
            }
        });

        const finalArticles = Array.from(uniqueMap.values());

        return NextResponse.json({
            articles: finalArticles,
            totalResults: finalArticles.length,
            category,
        });

    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json(
            { error: 'Failed to fetch news' },
            { status: 500 }
        );
    }
}
