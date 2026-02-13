import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Session } from '@/models/Session';
import Question from '@/models/Question';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get('teamId');

        if (!teamId) {
            return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
        }

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        await connectToDatabase();

        // 1. Get sessions for the team
        const teamSessions = await Session.find({ team_id: teamId }).select('_id user_id topics');
        const sessionIds = teamSessions.map(s => s._id);

        // 2. Total Questions
        const totalQuestions = await Question.countDocuments({ session_id: { $in: sessionIds } });

        // 3. Active Users
        const activeUsers = new Set(teamSessions.map(s => s.user_id)).size;

        // 4. Top Topics
        const topicCounts: Record<string, number> = {};
        teamSessions.forEach(s => {
            if (s.topics && Array.isArray(s.topics)) {
                s.topics.forEach((t: string) => {
                    topicCounts[t] = (topicCounts[t] || 0) + 1;
                });
            }
        });

        const topTopics = Object.entries(topicCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(e => e[0]);

        return NextResponse.json({
            totalQuestions,
            activeUsers,
            topTopics: topTopics.length ? topTopics : ['General', 'Coding', 'Debug']
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
