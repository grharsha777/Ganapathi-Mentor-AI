import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
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

        // Update user metrics
        const user = await User.findById(decoded.userId);
        if (user) {
            const now = new Date();
            const lastActive = user.metrics?.last_active ? new Date(user.metrics.last_active) : new Date(0);

            // Basic streak calculation: if active yesterday, increment. If active today, keep same. Otherwise reset to 1.
            const msInDay = 1000 * 60 * 60 * 24;
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
            const diffDays = Math.floor((today.getTime() - lastActiveDay.getTime()) / msInDay);

            let newStreak = user.metrics?.current_streak || 0;
            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            } else if (newStreak === 0) {
                newStreak = 1;
            }

            const newTotalSessions = (user.metrics?.total_sessions || 0) + 1;
            // Award points for completing a session (e.g., 50 points base + bonus for length, but stick to simple 50 for now)
            const newPoints = (user.metrics?.practice_points || 0) + 50;

            user.metrics = {
                ...user.metrics,
                total_sessions: newTotalSessions,
                practice_points: newPoints,
                current_streak: newStreak,
                longest_streak: Math.max(user.metrics?.longest_streak || 0, newStreak),
                last_active: now
            };
            await user.save();
        }

        // Summarize using AI (Mock for now, or real if questions existed)
        // Real implementation would fetch questions linked to this session
        // const questions = await Question.find({ session_id: sessionId });
        // const summary = await summarizeSession(questions.map(q => q.content));

        // session.summary = summary.summary;
        // session.topics = summary.topics;
        // await session.save();

        return NextResponse.json({ session, metricsUpdated: !!user });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
