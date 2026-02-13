import { NextRequest, NextResponse } from 'next/server';
import { generateMusic, isSunoConfigured } from '@/lib/suno';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        if (!isSunoConfigured()) {
            return NextResponse.json({ error: 'Music generation is not configured. Add SUNO_API_KEY to .env.local' }, { status: 503 });
        }

        const { prompt, style, title } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const result = await generateMusic({
            prompt,
            style: style || 'Lo-fi',
            title: title || 'AI Generated Track',
            waitAudio: true,
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Music Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate music' }, { status: 500 });
    }
}
