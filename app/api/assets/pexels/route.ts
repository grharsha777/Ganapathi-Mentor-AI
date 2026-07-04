import { NextRequest, NextResponse } from 'next/server';

/**
 * Pexels API proxy — search for high-quality images and videos.
 * Supports both photo and video search.
 */

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get('query');
    const type = req.nextUrl.searchParams.get('type') || 'photos'; // 'photos' or 'videos'
    const perPage = req.nextUrl.searchParams.get('per_page') || '5';
    const orientation = req.nextUrl.searchParams.get('orientation') || 'landscape';

    if (!query) {
        return NextResponse.json({ error: 'query parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'PEXELS_API_KEY is not configured' }, { status: 500 });
    }

    try {
        const baseUrl = type === 'videos'
            ? `https://api.pexels.com/videos/search`
            : `https://api.pexels.com/v1/search`;

        const url = `${baseUrl}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=${orientation}`;

        const res = await fetch(url, {
            headers: { 'Authorization': apiKey },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Pexels API error: ${res.status} ${text}`);
        }

        const data = await res.json();

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error: any) {
        console.error('Pexels API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch from Pexels' },
            { status: 500 }
        );
    }
}
