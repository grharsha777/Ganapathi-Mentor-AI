/**
 * Creative Studio - Image Generation API
 * Priority: Freepik > Stability > AIMLAPI
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { generateImage as freepikGenerate, isFreepikConfigured } from '@/lib/freepik';

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const AIMLAPI_API_KEY = process.env.AIMLAPI_API_KEY;

async function generateWithStability(prompt: string): Promise<string | null> {
  if (!STABILITY_API_KEY) return null;
  try {
    const res = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: 7,
        width: 1024,
        height: 1024,
        steps: 30,
        samples: 1,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const b64 = data?.artifacts?.[0]?.base64;
    if (b64) return `data:image/png;base64,${b64}`;
    return null;
  } catch (e) {
    console.error('Stability image gen error:', e);
    return null;
  }
}

async function generateWithAIMLAPI(prompt: string): Promise<string | null> {
  if (!AIMLAPI_API_KEY) return null;
  try {
    const res = await fetch('https://api.aimlapi.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIMLAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'stable-diffusion-v3-medium',
        prompt,
        image_size: 'square_hd',
        num_images: 1,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const url = data?.data?.[0]?.url ?? data?.images?.[0]?.url;
    const b64 = data?.data?.[0]?.b64_json ?? data?.images?.[0]?.b64_json;
    if (url) return url;
    if (b64) return `data:image/png;base64,${b64}`;
    return null;
  } catch (e) {
    console.error('AIMLAPI image gen error:', e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await req.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return NextResponse.json({ error: 'Missing or invalid prompt' }, { status: 400 });
    }

    if (!isFreepikConfigured() && !STABILITY_API_KEY && !AIMLAPI_API_KEY) {
      return NextResponse.json({
        error: 'Image generation disabled: configure FREEPIK_API_KEY, STABILITY_API_KEY, or AIMLAPI_API_KEY in .env.local',
      }, { status: 503 });
    }

    let image: string | null = null;
    let usedProvider: string = '';

    // 1. Try Freepik first (configured & working with rotation)
    if (!image && isFreepikConfigured()) {
      try {
        console.log(`[Studio] Attempting Freepik gen for: "${prompt}"`);
        const result = await freepikGenerate({ prompt, num_images: 1, image_size: 'square' });
        const img = result.images?.[0];
        if (img?.url) {
          image = img.url;
          usedProvider = 'freepik';
        } else if (img?.base64) {
          image = `data:image/png;base64,${img.base64}`;
          usedProvider = 'freepik';
        }
      } catch (e: any) {
        console.error('[Studio] Freepik primary/fallback failed:', e.message);
      }
    }

    // 2. Try Stability
    if (!image && STABILITY_API_KEY) {
      try {
        console.log(`[Studio] Falling back to Stability for: "${prompt}"`);
        image = await generateWithStability(prompt);
        if (image) usedProvider = 'stability';
      } catch (e: any) {
        console.error('[Studio] Stability fallback failed:', e.message);
      }
    }

    // 3. Try AIMLAPI
    if (!image && AIMLAPI_API_KEY) {
      try {
        console.log(`[Studio] Falling back to AIMLAPI for: "${prompt}"`);
        image = await generateWithAIMLAPI(prompt);
        if (image) usedProvider = 'aimlapi';
      } catch (e: any) {
        console.error('[Studio] AIMLAPI fallback failed:', e.message);
      }
    }

    if (!image) {
      console.error('[Studio] All image providers failed for prompt:', prompt);
      return NextResponse.json(
        { error: 'Image generation failed across all providers. Check your API quotas and environment variables.' },
        { status: 500 }
      );
    }

    console.log(`[Studio] Successfully generated image using ${usedProvider}`);
    return NextResponse.json({ image, provider: usedProvider });
  } catch (error: unknown) {
    console.error('[Studio] Global generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
