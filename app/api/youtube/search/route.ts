import { NextRequest, NextResponse } from 'next/server';
import { searchYouTubeVideos } from '@/lib/youtube';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const maxResults = parseInt(searchParams.get('maxResults') || '5');

        if (!query) {
            return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
        }

        const videos = await searchYouTubeVideos(query, maxResults);
        return NextResponse.json({ videos });

    } catch (error: any) {
        console.error('YouTube Search Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to search videos' }, { status: 500 });
    }
}
