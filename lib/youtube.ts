const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
    url: string;
}

/**
 * Search YouTube for relevant tutorial/educational videos.
 * Filters to recent videos (last 3 years) that are embeddable & publicly accessible.
 */
export async function searchYouTubeVideos(query: string, maxResults: number = 5): Promise<YouTubeVideo[]> {
    console.log(`[YouTube] Searching for: ${query}, Key configured: ${!!YOUTUBE_API_KEY}, Key length: ${YOUTUBE_API_KEY?.length}`);
    if (!YOUTUBE_API_KEY) {
        console.error('[YouTube] API Key is missing in lib/youtube.ts');
        throw new Error('YOUTUBE_API_KEY is not configured');
    }

    // Only return videos published in the last 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    const publishedAfter = threeYearsAgo.toISOString();

    const params = new URLSearchParams({
        part: 'snippet',
        q: `${query} tutorial 2024`,
        maxResults: maxResults.toString(),
        type: 'video',
        order: 'relevance',
        relevanceLanguage: 'en',
        safeSearch: 'strict',
        videoDuration: 'medium',
        videoEmbeddable: 'true',
        publishedAfter,
        key: YOUTUBE_API_KEY,
    });

    const response = await fetch(`${YOUTUBE_BASE_URL}/search?${params}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`YouTube API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    return (data.items || []).map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
}

/**
 * Get video details (for richer data)
 */
export async function getVideoDetails(videoId: string) {
    if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY is not configured');

    const params = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        id: videoId,
        key: YOUTUBE_API_KEY,
    });

    const response = await fetch(`${YOUTUBE_BASE_URL}/videos?${params}`);

    if (!response.ok) throw new Error('Failed to fetch video details');

    const data = await response.json();
    const video = data.items?.[0];
    if (!video) return null;

    return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails?.high?.url,
        channelTitle: video.snippet.channelTitle,
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount,
        duration: video.contentDetails?.duration,
        url: `https://www.youtube.com/watch?v=${video.id}`,
    };
}
