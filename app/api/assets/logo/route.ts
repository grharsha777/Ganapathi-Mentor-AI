import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json({ error: 'Search query (name) is required' }, { status: 400 });
        }

        const apiKey = process.env.API_NINJAS_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API_NINJAS_KEY is not configured' }, { status: 500 });
        }

        const response = await fetch(`https://api.api-ninjas.com/v1/logo?name=${encodeURIComponent(name)}`, {
            headers: {
                'X-Api-Key': apiKey,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Logo API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch logos' },
            { status: 500 }
        );
    }
}
