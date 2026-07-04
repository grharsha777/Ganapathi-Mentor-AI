import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log(`[OAuth Start] Provider: ${provider}, Next: ${next}`);

  if (provider !== 'google' && provider !== 'github') {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  const redirectUri = `${req.nextUrl.origin}/api/auth/oauth/callback`;
  // We include provider in state to know which one to use in the callback
  const state = encodeURIComponent(JSON.stringify({ next, provider }));

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('Missing GOOGLE_CLIENT_ID');
      return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent('Google login is not configured. Please add GOOGLE_CLIENT_ID to .env.local')}`, req.url));
    }

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', clientId);
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'email profile');
    googleAuthUrl.searchParams.append('state', state);

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  if (provider === 'github') {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      console.error('Missing GITHUB_CLIENT_ID');
      return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent('GitHub login is not configured. Please add GITHUB_CLIENT_ID to .env.local')}`, req.url));
    }

    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.append('client_id', clientId);
    githubAuthUrl.searchParams.append('redirect_uri', redirectUri);
    githubAuthUrl.searchParams.append('scope', 'user:email read:user');
    githubAuthUrl.searchParams.append('state', state);

    return NextResponse.redirect(githubAuthUrl.toString());
  }
}
