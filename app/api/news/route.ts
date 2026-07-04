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
    const gnewsApiKey = process.env.GNEWS_API_KEY;
    const mediaStackKey = "d27b5acb1d8581946c0ffb9e8dd12d51"; // Provided explicitly
    const serpApiKey = process.env.SERP_API_KEY;

    if (!newsDataKey && !newsApiKey && !gnewsApiKey && !mediaStackKey && !serpApiKey) {
        return NextResponse.json({ error: 'News API keys not configured' }, { status: 500 });
    }

    try {
        const fetchPromises = [];

        // 1. MediaStack
        if (mediaStackKey) {
            let msCategory = 'general';
            if (category === 'ai' || category === 'technology' || category === 'developer') {
                msCategory = 'technology';
            } else if (category === 'science') {
                msCategory = 'science';
            } else if (category === 'business') {
                msCategory = 'business';
            } else if (category === 'health') {
                msCategory = 'health';
            } else if (category === 'movies' || category === 'stories') {
                msCategory = 'entertainment';
            } else if (category === 'cricket') {
                msCategory = 'sports';
            }

            const msSearch = query ? `&keywords=${encodeURIComponent(query)}` : '';
            const msUrl = `http://api.mediastack.com/v1/news?access_key=${mediaStackKey}&languages=en&categories=${msCategory}&limit=100${msSearch}`;

            fetchPromises.push(
                fetch(msUrl, { next: { revalidate: 300 } })
                    .then(res => res.ok ? res.json() : Promise.reject(`MediaStack Error: ${res.status}`))
                    .then(data => {
                        if (!data?.data) return [];
                        return data.data.map((item: any) => ({
                            id: Math.random().toString(36).substring(7),
                            title: item.title,
                            description: item.description || '',
                            url: item.url,
                            imageUrl: item.image || null,
                            source: item.source || 'MediaStack',
                            author: item.author || null,
                            publishedAt: item.published_at,
                            apiSource: 'mediastack',
                            hasVideo: item.url?.includes('youtube.com') || false,
                        }));
                    })
                    .catch(err => { console.error(err); return []; })
            );
        }

        // 2. SerpAPI (Google News / YouTube fallback)
        if (serpApiKey) {
            // We use standard Google Search with tbm=nws for News, or engine=google_news
            let serpQ = query || category;
            if (category === 'all') serpQ = 'global news';
            if (category === 'ai') serpQ = 'artificial intelligence';
            if (category === 'cricket') serpQ = 'cricket highlights';
            if (category === 'god_stories') serpQ = 'mythology spirituality stories';

            // Fetch News from SerpAPI
            const serpNewsUrl = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(serpQ)}&gl=us&hl=en&api_key=${serpApiKey}`;
            
            fetchPromises.push(
                fetch(serpNewsUrl, { next: { revalidate: 300 } })
                    .then(res => res.ok ? res.json() : Promise.reject(`SerpAPI News Error: ${res.status}`))
                    .then(data => {
                        if (!data?.news_results) return [];
                        return data.news_results.map((item: any) => ({
                            id: Math.random().toString(36).substring(7),
                            title: item.title,
                            description: item.snippet || item.source?.name || '',
                            url: item.link,
                            imageUrl: item.thumbnail || null, // SerpAPI returns thumbnail usually
                            source: item.source?.name || 'SerpAPI News',
                            author: null,
                            publishedAt: item.date || new Date().toISOString(),
                            apiSource: 'serpapi',
                            hasVideo: item.link?.includes('youtube.com') || false,
                        }));
                    })
                    .catch(err => { console.error(err); return []; })
            );

            // Fetch Videos from SerpAPI if specific category
            if (['movies', 'cricket', 'technology', 'god_stories'].includes(category)) {
                const serpVideoUrl = `https://serpapi.com/search.json?engine=youtube&search_query=${encodeURIComponent(serpQ)}&api_key=${serpApiKey}`;
                fetchPromises.push(
                    fetch(serpVideoUrl, { next: { revalidate: 300 } })
                        .then(res => res.ok ? res.json() : Promise.reject(`SerpAPI YouTube Error`))
                        .then(data => {
                            if (!data?.video_results) return [];
                            return data.video_results.slice(0, 5).map((item: any) => ({
                                id: item.id || Math.random().toString(36).substring(7),
                                title: item.title,
                                description: item.description || '',
                                url: item.link,
                                imageUrl: item.thumbnail?.static || null,
                                source: item.channel?.name || 'YouTube',
                                author: item.channel?.name || null,
                                publishedAt: item.published_date || new Date().toISOString(),
                                apiSource: 'youtube',
                                hasVideo: true,
                                videoThumbnailId: item.id // can be used for iframe preview
                            }));
                        })
                        .catch(err => { console.error(err); return []; })
                );
            }
        }

        // 3. NewsData.ai (Scaled UP)
        if (newsDataKey) {
            let ndCategory = '';
            if (['ai', 'developer', 'technology'].includes(category)) ndCategory = '&category=technology';
            else if (category === 'cricket') ndCategory = '&category=sports';
            else if (category === 'movies' || category === 'god_stories') ndCategory = '&category=entertainment';
            else if (['science', 'world', 'business', 'health'].includes(category)) ndCategory = `&category=${category}`;

            let ndQuery = '';
            if (query) ndQuery = `&q=${encodeURIComponent(query)}`;
            else if (category === 'ai') ndQuery = '&q=artificial%20intelligence';
            else if (category === 'god_stories') ndQuery = '&q=religion%20OR%20mythology%20OR%20spirituality';

            const ndUrl = `https://newsdata.io/api/1/news?apikey=${newsDataKey}&language=en${ndCategory}${ndQuery}&image=1&size=50`;

            fetchPromises.push(
                fetch(ndUrl, { next: { revalidate: 300 } })
                    .then(res => res.ok ? res.json() : Promise.reject(`NewsData Error: ${res.status}`))
                    .then(data => {
                        if (!data.results) return [];
                        return data.results.map((item: any) => ({
                            id: item.article_id || Math.random().toString(36).substring(7),
                            title: item.title,
                            description: item.description || item.content?.substring(0, 200) || '',
                            url: item.link,
                            imageUrl: item.image_url || null,
                            source: item.source_id || 'NewsData',
                            author: item.creator ? item.creator[0] : null,
                            publishedAt: item.pubDate,
                            apiSource: 'newsdata',
                            hasVideo: item.video_url || item.link?.includes('youtube.com') ? true : false,
                        }));
                    })
                    .catch(err => { console.error('NewsData fetch failed:', err); return []; })
            );
        }

        // 4. Bing News (via SerpAPI)
        if (serpApiKey) {
            let serpQ = query || category;
            if (category === 'all') serpQ = 'global news';
            if (category === 'ai') serpQ = 'artificial intelligence';
            if (category === 'cricket') serpQ = 'cricket highlights';
            if (category === 'god_stories') serpQ = 'mythology spirituality stories';

            const bingNewsUrl = `https://serpapi.com/search.json?engine=bing_news&q=${encodeURIComponent(serpQ)}&api_key=${serpApiKey}`;
            fetchPromises.push(
                fetch(bingNewsUrl, { next: { revalidate: 300 } })
                    .then(res => res.ok ? res.json() : Promise.reject(`SerpAPI Bing Error`))
                    .then(data => {
                        if (!data?.organic_results) return [];
                        return data.organic_results.map((item: any) => ({
                            id: Math.random().toString(36).substring(7),
                            title: item.title,
                            description: item.snippet || '',
                            url: item.link,
                            imageUrl: item.thumbnail || null,
                            source: item.source || 'Bing News',
                            author: null,
                            publishedAt: item.date || new Date().toISOString(),
                            apiSource: 'bing',
                            hasVideo: item.link?.includes('youtube.com') || false,
                        }));
                    })
                    .catch(err => { console.error(err); return []; })
            );
        }

        // 5. GNews.io
        if (gnewsApiKey) {
            let endpoint = 'top-headlines';
            let gnCategory = 'general';
            let gnQuery = '';

            if (query) {
                endpoint = 'search';
                gnQuery = `&q=${encodeURIComponent(query)}`;
            } else {
                if (['world', 'all'].includes(category)) gnCategory = 'general';
                else if (category === 'ai') { endpoint = 'search'; gnQuery = '&q="artificial intelligence"'; }
                else if (category === 'developer') { endpoint = 'search'; gnQuery = '&q="software developer"'; }
                else if (category === 'god_stories') { endpoint = 'search'; gnQuery = '&q=religion OR spirituality'; }
                else if (category === 'cricket') { endpoint = 'search'; gnQuery = '&q=cricket'; }
                else if (category === 'movies') { endpoint = 'search'; gnQuery = '&q=movies'; }
                else gnCategory = category;
            }

            const gnCategoryParam = endpoint === 'top-headlines' ? `&category=${gnCategory}` : '';
            const gnUrl = `https://gnews.io/api/v4/${endpoint}?apikey=${gnewsApiKey}&lang=en&max=20${gnCategoryParam}${gnQuery}`;

            fetchPromises.push(
                fetch(gnUrl, { next: { revalidate: 300 } })
                    .then(res => res.ok ? res.json() : Promise.reject(`GNews Error: ${res.status}`))
                    .then(data => {
                        if (!data.articles) return [];
                        return data.articles.map((item: any) => ({
                            id: Math.random().toString(36).substring(7),
                            title: item.title,
                            description: item.description || item.content?.substring(0, 200) || '',
                            url: item.url,
                            imageUrl: item.image || null,
                            source: item.source?.name || 'GNews',
                            author: null,
                            publishedAt: item.publishedAt,
                            apiSource: 'gnews',
                            hasVideo: item.url?.includes('youtube.com') || false,
                        }));
                    })
                    .catch(err => { console.error('GNews fetch failed:', err); return []; })
            );
        }

        // 6. NewsAPI.org
        if (newsApiKey) {
            let endpoint = 'top-headlines';
            let naQuery = query ? `&q=${encodeURIComponent(query)}` : '';
            if (!query) {
                if (category === 'ai') { endpoint = 'everything'; naQuery = '&q="artificial intelligence"'; }
                else if (category === 'cricket') { endpoint = 'everything'; naQuery = '&q=cricket'; }
                else if (category === 'god_stories') { endpoint = 'everything'; naQuery = '&q=religion OR mythology OR divine'; }
                else if (category === 'movies') { endpoint = 'everything'; naQuery = '&q=movies OR hollywood'; }
            }
            
            const naUrl = `https://newsapi.org/v2/${endpoint}?apiKey=${newsApiKey}&language=en&pageSize=100${naQuery}${endpoint==='top-headlines' ? '&country=us' : ''}`;
            
            fetchPromises.push(
                fetch(naUrl, { next: { revalidate: 300 } })
                    .then(res => res.ok ? res.json() : Promise.reject(`NewsAPI error: ${res.status}`))
                    .then(data => {
                        if (!data.articles) return [];
                        return data.articles
                            .filter((item: any) => item.title && item.title !== '[Removed]')
                            .map((item: any) => ({
                                id: Math.random().toString(36).substring(7),
                                title: item.title,
                                description: item.description || '',
                                url: item.url,
                                imageUrl: item.urlToImage || null,
                                source: item.source?.name || 'NewsAPI',
                                author: item.author,
                                publishedAt: item.publishedAt,
                                apiSource: 'newsapi',
                                hasVideo: item.url?.includes('youtube.com') || false,
                            }));
                    })
                    .catch(err => { console.error('NewsAPI fetch failed:', err); return []; })
            );
        }

        // Resolving Mass Matrix Async
        const resultsArray = await Promise.all(fetchPromises);
        const combinedArticles = resultsArray.flat().filter(article => article.imageUrl);

        // Sort completely combined timeline descending
        combinedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        // Hard Deduplication matrix
        const uniqueMap = new Map();
        combinedArticles.forEach(article => {
            if (!article.title) return;
            const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 35);
            if (!uniqueMap.has(key)) { uniqueMap.set(key, article); }
        });

        const finalArticles = Array.from(uniqueMap.values());

        return NextResponse.json({
            articles: finalArticles,
            totalResults: finalArticles.length,
            category,
        });

    } catch (error) {
        console.error('Error fetching massive payload:', error);
        return NextResponse.json({ error: 'Failed to fetch global news' }, { status: 500 });
    }
}
