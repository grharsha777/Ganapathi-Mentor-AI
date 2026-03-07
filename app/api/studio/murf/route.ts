import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { generateSpeech, isMurfConfigured } from '@/lib/murf';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        if (!isMurfConfigured()) {
            return NextResponse.json({
                error: 'Murf AI is not configured. Please add MURF_API_KEY to .env.local'
            }, { status: 503 });
        }

        const body = await req.json();
        const { text, voiceId, style, rate, pitch } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const result = await generateSpeech({
            text,
            voiceId,
            style,
            rate,
            pitch
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Murf API Route Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to generate speech'
        }, { status: 500 });
    }
}
