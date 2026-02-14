import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0 // Expire immediately
    });
    return response;
}
