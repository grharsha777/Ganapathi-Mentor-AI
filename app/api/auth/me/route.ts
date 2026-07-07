import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ user: null }, { status: 401 });

    const userId = decoded.id ?? decoded.userId;
    if (!userId) return NextResponse.json({ user: null }, { status: 401 });

    await connectToDatabase();

    let user: {
        _id: unknown;
        email: string;
        full_name?: string;
        role?: string;
        metrics?: Record<string, unknown>;
    } | null = null;

    // Try findById first (works for valid ObjectId strings from standard sign-up/login)
    // Fall back to findOne by email to handle legacy UUID-based IDs or migrated accounts
    if (mongoose.isValidObjectId(userId)) {
        user = await User.findById(userId).lean<{
            _id: unknown;
            email: string;
            full_name?: string;
            role?: string;
            metrics?: Record<string, unknown>;
        }>();
    }

    // If not found by id (e.g. old UUID-based id), try by email from JWT
    if (!user && decoded.email) {
        user = await User.findOne({ email: decoded.email }).lean<{
            _id: unknown;
            email: string;
            full_name?: string;
            role?: string;
            metrics?: Record<string, unknown>;
        }>();
    }

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
