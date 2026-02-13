import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech, isMurfConfigured } from '@/lib/murf';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        if (!isMurfConfigured()) {
            return NextResponse.json({ error: 'Text-to-speech is not configured. Add MURF_API_KEY to .env.local' }, { status: 503 });
        }

        const { text, voiceId } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
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
