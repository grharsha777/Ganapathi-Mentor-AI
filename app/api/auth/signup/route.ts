import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate a UUID-like string for compatibility if needed, or stick to Mongo ID
    // Using simple random string for ID if schema requires string
    const userId = crypto.randomUUID();

    const newUser = await User.create({
      _id: userId,
      email,
      full_name: fullName,
      password_hash: passwordHash,
      role: 'viewer'
    });

    const token = await signToken({ userId: newUser._id, email: newUser.email, role: newUser.role });

    const response = NextResponse.json({
      user: {
        id: newUser._id,
        email: newUser.email,
        full_name: newUser.full_name
      },
      token
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
