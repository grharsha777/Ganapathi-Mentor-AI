import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log(`[Auth Callback] Start. Code present: ${!!code}, Error: ${errorParam}, Desc: ${errorDescription}`);

  if (errorParam) {
    console.error(`[Auth Callback Error] Provider returned error: ${errorParam} - ${errorDescription}`);
    return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent(errorDescription || errorParam)}`, req.url));
  }

  if (!code) {
    console.error('[Auth Callback Error] No code provided');
    return NextResponse.redirect(new URL('/auth/error?message=No code provided', req.url));
  }

  try {
    const supabase = await createClient();
    console.log('[Auth Callback] Exchanging code for session...');
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !user?.email) {
      console.error('[Auth Callback Error] Code exchange failed:', error);
      const errorMsg = error?.message || 'Authentication failed during code exchange';
      return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent(errorMsg), req.url));
    }

    console.log(`[Auth Callback] User authenticated: ${user.email}`);

    await connectToDatabase();
    console.log('[Auth Callback] Connected to MongoDB');

    let dbUser = await User.findOne({ email: user.email });
    if (!dbUser) {
      console.log('[Auth Callback] Creating new user in MongoDB...');
      try {
        dbUser = await User.create({
          _id: crypto.randomUUID(),
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          password_hash: null,
          role: 'viewer',
        });
        console.log('[Auth Callback] User created successfully');
      } catch (dbError: any) {
        console.error('[Auth Callback Error] Failed to create user in DB:', dbError);
        return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent('Database error: ' + dbError.message), req.url));
      }
    } else {
      console.log('[Auth Callback] Existing user found');
    }

    const token = await signToken({
      userId: dbUser._id,
      email: dbUser.email,
      role: dbUser.role,
    }); // Consider wrapping this in try/catch or assume it throws
    console.log('[Auth Callback] JWT signed');

    const response = NextResponse.redirect(new URL(next, req.url));
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    console.log('[Auth Callback] Token cookie set, redirecting to:', next);

    return response;
  } catch (e: any) {
    console.error('[Auth Callback Critical Error]', e);
    return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent(e.message || 'Callback failed'), req.url));
  }
}
