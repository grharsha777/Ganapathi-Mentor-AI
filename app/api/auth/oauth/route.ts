import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log(`[OAuth Start] Provider: ${provider}, Next: ${next}`);

  if (provider !== 'google') {
    console.error('[OAuth Error] Invalid provider:', provider);
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const redirectUrl = `${req.nextUrl.origin}/api/auth/oauth/callback?next=${encodeURIComponent(next)}`;
    console.log(`[OAuth] Redirect URL: ${redirectUrl}`);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'github',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('[OAuth Error] Supabase signInWithOAuth failed:', error);
      return NextResponse.redirect(new URL('/auth/error?message=' + encodeURIComponent(error.message), req.url));
    }

    if (data?.url) {
      console.log(`[OAuth] Redirecting to provider URL: ${data.url}`);
      return NextResponse.redirect(data.url);
    }

    console.error('[OAuth Error] No redirect URL returned from Supabase');
    return NextResponse.redirect(new URL('/auth/error?message=No redirect URL', req.url));
  } catch (e) {
    console.error('[OAuth Critical Error]', e);
    return NextResponse.redirect(new URL('/auth/error?message=OAuth failed', req.url));
  }
}
