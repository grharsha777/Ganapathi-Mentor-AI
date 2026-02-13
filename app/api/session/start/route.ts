import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Session } from '@/models/Session';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        await connectToDatabase();
        const body = await req.json().catch(() => ({}));
        const { teamId } = body;

        // Check for existing active session
        const activeSession = await Session.findOne({
            user_id: decoded.userId,
            ended_at: null
        }).sort({ started_at: -1 });

        if (activeSession) {
            // Update teamId if changed
            if (teamId && activeSession.team_id?.toString() !== teamId) {
                activeSession.team_id = teamId;
                await activeSession.save();
            }
            return NextResponse.json(activeSession);
        }

        // Create new session
        const newSession = await Session.create({
            user_id: decoded.userId,
            team_id: teamId || null,
            started_at: new Date()
        });

        return NextResponse.json(newSession);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
