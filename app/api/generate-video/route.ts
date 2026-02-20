import { NextRequest, NextResponse } from 'next/server';
import { generateVideo, getVideoStatus, listAvatars } from '@/lib/heygen';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { action, text, avatarId, voiceId, title, videoId, provider } = await req.json();

        if (action === 'generate') {
            if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

            // If user explicitly asks for advanced HF model, skip HeyGen
            if (provider === 'huggingface') {
                try {
                    const { generateVideoHuggingFace, isHuggingFaceConfigured, blobToBase64 } = await import('@/lib/huggingface');
                    if (isHuggingFaceConfigured()) {
                        const videoBlob = await generateVideoHuggingFace(text);
                        const base64 = await blobToBase64(videoBlob);
                        return NextResponse.json({
                            video_id: `hf-${Date.now()}`,
                            status: "completed",
                            video_url: `data:${videoBlob.type || 'video/mp4'};base64,${base64}`
                        });
                    } else {
                        return NextResponse.json({ error: 'Hugging Face API key not configured' }, { status: 400 });
                    }
                } catch (hfError: any) {
                    console.error("HF Video failed:", hfError);
                    return NextResponse.json({ error: hfError.message || 'Failed to generate video using Hugging Face' }, { status: 500 });
                }
            }

            try {
                // Primary: HeyGen
                const result = await generateVideo({ text, avatarId, voiceId, title });
                return NextResponse.json(result);
            } catch (heyGenError) {
                console.warn("HeyGen Video failed, trying Hugging Face Wan-AI", heyGenError);
                try {
                    const { generateVideoHuggingFace, isHuggingFaceConfigured, blobToBase64 } = await import('@/lib/huggingface');
                    if (isHuggingFaceConfigured()) {
                        const videoBlob = await generateVideoHuggingFace(text);
                        const base64 = await blobToBase64(videoBlob);

                        return NextResponse.json({
                            // Returning base64 video matching standard response types or a custom one the frontend handles
                            video_id: `hf-${Date.now()}`,
                            status: "completed", // HF is synchronous in this SDK call usually, or returns early
                            video_url: `data:${videoBlob.type || 'video/mp4'};base64,${base64}`
                        });
                    }
                } catch (hfError) {
                    console.error("HF Video fallback failed:", hfError);
                }

                return NextResponse.json({ error: 'Failed to generate video using any provider.' }, { status: 500 });
            }
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
