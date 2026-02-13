
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import MediaProject from '@/models/MediaProject';
import { verifyToken } from '@/lib/auth';

// This is a generic route to save media generation results
// Actual generation happens in specific routes (like /api/generate-video), which should call this or saving logic internally.
// But for now, we provide a way to save results from client or unified generation.

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;

        await connectToDatabase();
        const body = await req.json();

        const newMedia = await MediaProject.create({
            user_id: decoded.userId,
            ...body
        });

        return NextResponse.json({ success: true, media: newMedia });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;

        await connectToDatabase();
        const media = await MediaProject.find({ user_id: decoded.userId }).sort({ created_at: -1 });

        return NextResponse.json({ success: true, media });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
