import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const decoded = await verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ user: null }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(decoded.userId);

    if (!user) return NextResponse.json({ user: null }, { status: 401 });

    return NextResponse.json({
        user: {
            id: user._id,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        }
    });
}
