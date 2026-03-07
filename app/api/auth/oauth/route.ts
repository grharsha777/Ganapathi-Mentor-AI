import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log(`[OAuth Start] Provider: ${provider}, Next: ${next}`);

  if (provider !== 'google') {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('Missing GOOGLE_CLIENT_ID');
    return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent('Google login is not configured. Please add GOOGLE_CLIENT_ID to .env.local')}`, req.url));
  }

  const redirectUri = `${req.nextUrl.origin}/api/auth/oauth/callback`;
  const state = encodeURIComponent(JSON.stringify({ next }));

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.append('client_id', clientId);
  googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.append('response_type', 'code');
  googleAuthUrl.searchParams.append('scope', 'email profile');
  googleAuthUrl.searchParams.append('state', state);

  return NextResponse.redirect(googleAuthUrl.toString());
}
