import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side logo proxy — fetches brand logos from Clearbit or Google Favicons.
 * This avoids CORS issues that block direct client-side requests.
 * Responses are cached for 7 days.
 */

export async function GET(req: NextRequest) {
    const domain = req.nextUrl.searchParams.get('domain');
    if (!domain) {
        return NextResponse.json({ error: 'domain parameter required' }, { status: 400 });
    }

    const cleanDomain = domain.replace(/^www\./, '').toLowerCase();

    // Try Clearbit Logo API (highest quality)
    try {
        const res = await fetch(`https://logo.clearbit.com/${encodeURIComponent(cleanDomain)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; HiveApp/1.0)',
                'Accept': 'image/*',
            },
            signal: AbortSignal.timeout(4000),
        });

        if (res.ok && res.headers.get('content-type')?.startsWith('image')) {
            const data = await res.arrayBuffer();
            return new NextResponse(data, {
                headers: {
                    'Content-Type': res.headers.get('content-type') || 'image/png',
                    'Cache-Control': 'public, max-age=604800, s-maxage=604800, immutable',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    } catch (e) {
        // Clearbit failed, try fallback
    }

    // Fallback 1: Google high-res favicon
    try {
        const googleUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${encodeURIComponent(cleanDomain)}&size=128`;
        const googleRes = await fetch(googleUrl, {
            signal: AbortSignal.timeout(4000),
        });

        if (googleRes.ok) {
            const data = await googleRes.arrayBuffer();
            return new NextResponse(data, {
                headers: {
                    'Content-Type': googleRes.headers.get('content-type') || 'image/png',
                    'Cache-Control': 'public, max-age=604800, s-maxage=604800, immutable',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    } catch (e) {
        // Google also failed
    }

    // Fallback 2: Google S2 favicons (always works)
    try {
        const s2Url = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanDomain)}&sz=128`;
        const s2Res = await fetch(s2Url, { signal: AbortSignal.timeout(4000) });

        if (s2Res.ok) {
            const data = await s2Res.arrayBuffer();
            return new NextResponse(data, {
                headers: {
                    'Content-Type': s2Res.headers.get('content-type') || 'image/png',
                    'Cache-Control': 'public, max-age=604800, s-maxage=604800, immutable',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    } catch {}

    // All sources failed
    return new NextResponse(null, { status: 404 });
}
