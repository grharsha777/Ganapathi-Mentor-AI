import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import Feedback from '@/models/Feedback';

const WEB3FORMS_KEY = 'f119865c-01dd-43f0-bcc6-6e5439c7f000';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { category, message, rating } = await req.json();

        if (!message?.trim()) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 1. Save to MongoDB (permanent record)
        try {
            await connectToDatabase();
            await Feedback.create({
                user_id: decoded.userId,
                user_email: decoded.email || 'Unknown',
                user_name: decoded.full_name || decoded.email || 'Anonymous',
                category: category || 'suggestion',
                rating: rating || 0,
                message: message.trim(),
            });
            console.log('[Feedback] Saved to MongoDB');
            return NextResponse.json({ success: true, message: 'Feedback saved to database.' });
        } catch (dbErr) {
            console.error('[Feedback] DB save failed:', dbErr);
            return NextResponse.json({ error: 'Failed to save feedback to database' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Feedback Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to send feedback' }, { status: 500 });
    }
}
