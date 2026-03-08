import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const stateParams = searchParams.get('state');

  let nextUrl = '/dashboard';
  if (stateParams) {
    try {
      const decodedState = JSON.parse(decodeURIComponent(stateParams));
      if (decodedState.next) nextUrl = decodedState.next;
    } catch (e) {
      console.error('Failed to parse OAuth state parameter:', e);
    }
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error?message=Authorization code missing', req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${req.nextUrl.origin}/api/auth/oauth/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Failed to fetch tokens');

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    if (!userRes.ok) throw new Error('Failed to get user profile');

    await connectToDatabase();

    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create({
        _id: crypto.randomUUID(),
        email: userData.email,
        full_name: userData.name,
        avatar_url: userData.picture,
        role: 'viewer'
      });
    } else if (!user.avatar_url && userData.picture) {
      user.avatar_url = userData.picture;
      await user.save();
    }

    const token = await signToken({ userId: user._id, email: user.email, role: user.role });

    const response = NextResponse.redirect(new URL(nextUrl, req.url));
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('OAuth Callback Error:', error);
    const errorMessage = error.message || 'An unknown error occurred during authentication';
    // Provide more context for common errors
    let userFriendlyMessage = errorMessage;
    if (errorMessage.includes('Failed to fetch tokens')) {
      userFriendlyMessage = 'Google authentication failed (token exchange). Please check your GOOGLE_CLIENT_SECRET.';
    } else if (errorMessage.includes('Failed to get user profile')) {
      userFriendlyMessage = 'Google authentication failed (profile retrieval).';
    } else if (errorMessage.includes('MONGODB_URI')) {
      userFriendlyMessage = 'Database connection error. Please configure MONGODB_URI.';
    }

    return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent(userFriendlyMessage)}`, req.url));
  }
}
