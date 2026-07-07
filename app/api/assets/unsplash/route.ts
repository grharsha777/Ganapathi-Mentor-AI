import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        // Auth check — only authenticated users can trigger image fetches
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = req.nextUrl;
        const query = searchParams.get('query');
        const count = Math.min(Number(searchParams.get('count') ?? '3'), 10);

        if (!query) {
            return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
        }

        const apiKey = process.env.UNSPLASH_API_KEY;
        if (!apiKey) {
            console.warn('[unsplash-proxy] UNSPLASH_API_KEY not configured — returning empty result');
            return NextResponse.json({ images: [] });
        }

        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
            {
                headers: { Authorization: `Client-ID ${apiKey}` },
                next: { revalidate: 3600 }, // Cache for 1 hour server-side
            }
        );

        if (!response.ok) {
            console.warn('[unsplash-proxy] Unsplash API error:', response.status, response.statusText);
            return NextResponse.json({ images: [] });
        }

        const data = await response.json();
        const images = (data.results ?? []).map((img: any) => ({
            id: img.id,
            url: img.urls?.regular ?? '',
            alt_description: img.alt_description ?? null,
            photographer: img.user?.name ?? 'Unknown',
            photographer_url: img.user?.links?.html ?? '',
        }));

        return NextResponse.json({ images });
    } catch (error) {
        console.error('[unsplash-proxy] Error:', error);
        return NextResponse.json({ images: [] });
    }
}
