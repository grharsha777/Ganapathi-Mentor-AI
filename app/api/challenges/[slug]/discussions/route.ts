import { NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import Discussion from '@/models/Discussion';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const resolvedParams = await params;
        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        const discussions = await Discussion.find({ challengeSlug: resolvedParams.slug })
                                          .sort({ created_at: -1 });
        
        return NextResponse.json({ discussions });
    } catch (error: any) {
        console.error('Fetch discussions error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const resolvedParams = await params;
        const body = await request.json();
        
        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        const { content, codeSnippet, language, isMentor } = body;

        const newDiscussion = await Discussion.create({
            challengeSlug: resolvedParams.slug,
            author: isMentor ? 'Ganapathi AI Mentor' : 'Learner',
            authorAvatar: isMentor ? '🤖' : '👩‍💻',
            content,
            codeSnippet: codeSnippet || '',
            language: language || '',
            isMentor: !!isMentor
        });

        return NextResponse.json({ discussion: newDiscussion });
    } catch (error: any) {
        console.error('Post discussion error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
