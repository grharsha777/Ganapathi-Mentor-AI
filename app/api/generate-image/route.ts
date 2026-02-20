import { NextRequest, NextResponse } from 'next/server';
import { generateImage as freepikGenerate, isFreepikConfigured } from '@/lib/freepik';
import { generateImage as picsartGenerate } from '@/lib/picsart';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyToken(token);

    if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
        const { prompt, width, height } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Try Freepik first (verified working), fallback to Picsart/HF
        if (isFreepikConfigured()) {
            const result = await freepikGenerate({ prompt });
            return NextResponse.json(result);
        }

        // Try Hugging Face next
        try {
            const { generateImageHuggingFace, isHuggingFaceConfigured, blobToBase64 } = await import('@/lib/huggingface');
            if (isHuggingFaceConfigured()) {
                const imageBlob = await generateImageHuggingFace(prompt, width, height);
                const base64 = await blobToBase64(imageBlob);
                return NextResponse.json({
                    data: [
                        { url: `data:${imageBlob.type || 'image/png'};base64,${base64}` }
                    ]
                });
            }
        } catch (e) {
            console.warn("HF Image fallback failed, trying Picsart", e);
        }

        // Fallback to Picsart
        const result = await picsartGenerate({
            prompt,
            width: width || 1024,
            height: height || 1024
        });
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Image Generation Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
    }
}
