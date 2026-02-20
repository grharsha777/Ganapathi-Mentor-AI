import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech, isMurfConfigured } from '@/lib/murf';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { text, voiceId } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Try Hugging Face Kokoro if Murf is absent
        if (!isMurfConfigured()) {
            try {
                const { generateSpeechHuggingFace, isHuggingFaceConfigured, blobToBase64 } = await import('@/lib/huggingface');
                if (isHuggingFaceConfigured()) {
                    const audioBlob = await generateSpeechHuggingFace(text.substring(0, 1000));
                    const base64 = await blobToBase64(audioBlob);

                    return NextResponse.json({
                        audioFile: `data:audio/wav;base64,${base64}`
                    });
                }
            } catch (hfError) {
                console.warn("HF TTS fallback failed:", hfError);
                return NextResponse.json({ error: 'TTS is not configured properly or HF failed.' }, { status: 503 });
            }
            return NextResponse.json({ error: 'Text-to-speech is not configured. Add MURF_API_KEY or HUGGINGFACE_API_KEY' }, { status: 503 });
        }

        // Truncate to 5000 chars to avoid API limits
        const truncatedText = text.substring(0, 5000);

        const result = await generateSpeech({
            text: truncatedText,
            voiceId: voiceId || 'en-US-natalie',
            style: 'Conversational',
            format: 'MP3',
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('TTS Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate speech' }, { status: 500 });
    }
}
