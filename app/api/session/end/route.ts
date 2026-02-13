import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Session } from '@/models/Session';
import { verifyToken } from '@/lib/auth';
import { summarizeSession } from '@/lib/ai';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        await connectToDatabase();
        const { sessionId } = await req.json();

        if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 });

        const session = await Session.findById(sessionId);
        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        // Mark as ended
        session.ended_at = new Date();
        await session.save();

        // Summarize using AI (Mock for now, or real if questions existed)
        // Real implementation would fetch questions linked to this session
        // const questions = await Question.find({ session_id: sessionId });
        // const summary = await summarizeSession(questions.map(q => q.content));

        // session.summary = summary.summary;
        // session.topics = summary.topics;
        // await session.save();

        return NextResponse.json(session);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
