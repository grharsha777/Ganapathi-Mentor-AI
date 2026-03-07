import { NextRequest, NextResponse } from 'next/server';
import {
    generateVideo,
    checkVideoStatus,
    isVideoGenerationConfigured,
    getVideoProvider
} from '@/lib/video-generation';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { action, text, style, provider, videoId, aspect_ratio } = await req.json();

        // Check if generation is configured
        if (action === 'generate') {
            if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

            if (!isVideoGenerationConfigured()) {
                return NextResponse.json(
                    { error: 'Video generation not configured. Set KLING_ACCESS_KEY or RUNWAY_API_KEY' },
                    { status: 503 }
                );
            }

            try {
                const result = await generateVideo({
                    text,
                    style: style || 'cinematic',
                    provider: provider as any,
                    aspect_ratio: aspect_ratio as any
                });

                return NextResponse.json({
                    video_id: result.videoId,
                    status: result.status,
                    video_url: result.videoUrl,
                    provider: result.provider,
                    message: result.status === 'processing' ? 'Generation started' : 'Generation complete'
                });
            } catch (error: any) {
                console.error('Video generation failed:', error);
                return NextResponse.json({ error: error.message || 'Failed to generate video' }, { status: 500 });
            }
        }

        // Handle Polling Status
        if (action === 'status') {
            if (!videoId || !provider) {
                return NextResponse.json({ error: 'videoId and provider required for status check' }, { status: 400 });
            }

            try {
                const result = await checkVideoStatus(videoId, provider);
                return NextResponse.json(result);
            } catch (error: any) {
                console.error('Status check failed:', error);
                return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Video Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
