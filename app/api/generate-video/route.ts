import { NextRequest, NextResponse } from 'next/server';
import { generateVideo, getVideoStatus, listAvatars } from '@/lib/heygen';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { action, text, avatarId, voiceId, title, videoId } = await req.json();

        if (action === 'generate') {
            if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });
            const result = await generateVideo({ text, avatarId, voiceId, title });
            return NextResponse.json(result);
        }

        if (action === 'status') {
            if (!videoId) return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
            const result = await getVideoStatus(videoId);
            return NextResponse.json(result);
        }

        if (action === 'avatars') {
            const avatars = await listAvatars();
            return NextResponse.json({ avatars });
        }

        return NextResponse.json({ error: 'Invalid action. Use "generate", "status", or "avatars"' }, { status: 400 });

    } catch (error: any) {
        console.error('Video Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to process video request' }, { status: 500 });
    }
}
