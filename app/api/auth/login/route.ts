import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+password_hash');

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      console.warn(`Login failed for email: ${email} - Password mismatch.`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    console.log(`Password matched for user: ${user.email}. Generating token.`);

    const token = await signToken({ userId: user._id.toString(), email: user.email, role: user.role });
    console.log(`Token generated for user: ${user.email}.`);

    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });
    console.log(`Setting authentication cookie for user: ${user.email}.`);

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Detailed login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
