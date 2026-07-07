import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ user: null }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(decoded.id).lean<{
        _id: unknown;
        email: string;
        full_name?: string;
        role?: string;
        metrics?: Record<string, unknown>;
    }>();

    if (!user) return NextResponse.json({ user: null }, { status: 401 });

    return NextResponse.json({
        user: {
            id: String(user._id),
            email: user.email ?? '',
            full_name: user.full_name ?? null,
            role: user.role ?? 'viewer',
            metrics: user.metrics ?? {
                total_sessions: 0,
                practice_points: 0,
                completed_lessons: 0,
                current_streak: 0,
                longest_streak: 0,
                last_active: new Date(),
                activities: []
            }
        }
    });
}
