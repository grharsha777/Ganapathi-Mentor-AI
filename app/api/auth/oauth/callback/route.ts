import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const stateParams = searchParams.get('state');

  let nextUrl = '/dashboard';
  let provider = 'google';
  if (stateParams) {
    try {
      const decodedState = JSON.parse(decodeURIComponent(stateParams));
      if (decodedState.next) nextUrl = decodedState.next;
      if (decodedState.provider) provider = decodedState.provider;
    } catch (e) {
      console.error('Failed to parse OAuth state parameter:', e);
    }
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error?message=Authorization code missing', req.url));
  }

  const redirectUri = `${req.nextUrl.origin}/api/auth/oauth/callback`;

  try {
    let userData: { email: string; name: string; picture?: string };

    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
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
      if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Failed to fetch Google tokens');

      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const googleData = await userRes.json();
      if (!userRes.ok) throw new Error('Failed to get Google user profile');
      
      userData = {
        email: googleData.email,
        name: googleData.name,
        picture: googleData.picture
      };
    } else if (provider === 'github') {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        })
      });
      const tokenData = await tokenRes.json();
      if (tokenData.error) throw new Error(tokenData.error_description || 'Failed to fetch GitHub tokens');
      
      const userRes = await fetch('https://api.github.com/user', {
        headers: { 
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      const githubData = await userRes.json();
      if (!userRes.ok) throw new Error('Failed to get GitHub user profile');

      let email = githubData.email;
      if (!email) {
        // Fetch emails if primary email is not public
        const emailRes = await fetch('https://api.github.com/user/emails', {
          headers: { 
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });
        const emails = await emailRes.json();
        const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
        if (primaryEmail) {
          email = primaryEmail.email;
        }
      }

      if (!email) throw new Error('No email found for GitHub user');

      userData = {
        email: email,
        name: githubData.name || githubData.login,
        picture: githubData.avatar_url
      };
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    await connectToDatabase();

    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create({
        email: userData.email,
        full_name: userData.name,
        avatar_url: userData.picture,
        role: 'viewer'
      });
    } else if (!user.avatar_url && userData.picture) {
      user.avatar_url = userData.picture;
      await user.save();
    }

    const token = await signToken({ id: user._id.toString(), email: user.email, role: user.role });

    const response = NextResponse.redirect(new URL(nextUrl, req.url));
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('OAuth Callback Error:', error);
    const errorMessage = error.message || 'An unknown error occurred during authentication';
    // Provide more context for common errors
    let userFriendlyMessage = errorMessage;
    if (errorMessage.includes('fetch Google tokens')) {
      userFriendlyMessage = 'Google authentication failed (token exchange). Please check your GOOGLE_CLIENT_SECRET.';
    } else if (errorMessage.includes('fetch GitHub tokens')) {
      userFriendlyMessage = 'GitHub authentication failed (token exchange). Please check your GITHUB_CLIENT_SECRET.';
    } else if (errorMessage.includes('get Google user profile')) {
      userFriendlyMessage = 'Google authentication failed (profile retrieval).';
    } else if (errorMessage.includes('get GitHub user profile')) {
      userFriendlyMessage = 'GitHub authentication failed (profile retrieval).';
    } else if (errorMessage.includes('MONGODB_URI')) {
      userFriendlyMessage = 'Database connection error. Please configure MONGODB_URI.';
    }

    return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent(userFriendlyMessage)}`, req.url));
  }
}
