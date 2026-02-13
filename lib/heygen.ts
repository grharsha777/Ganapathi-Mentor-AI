const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_BASE_URL = 'https://api.heygen.com';

export interface VideoGenerationOptions {
    text: string;
    avatarId?: string;
    voiceId?: string;
    title?: string;
}

/**
 * List available HeyGen avatars
 */
export async function listAvatars() {
    if (!HEYGEN_API_KEY) throw new Error('HEYGEN_API_KEY is not configured');

    const response = await fetch(`${HEYGEN_BASE_URL}/v2/avatars`, {
        headers: { 'X-Api-Key': HEYGEN_API_KEY },
    });

    if (!response.ok) throw new Error('Failed to fetch avatars');
    const data = await response.json();
    return data.data?.avatars || [];
}

/**
 * List available voices
 */
export async function listVoices() {
    if (!HEYGEN_API_KEY) throw new Error('HEYGEN_API_KEY is not configured');

    const response = await fetch(`${HEYGEN_BASE_URL}/v2/voices`, {
        headers: { 'X-Api-Key': HEYGEN_API_KEY },
    });

    if (!response.ok) throw new Error('Failed to fetch voices');
    const data = await response.json();
    return data.data?.voices || [];
}

/**
 * Generate a video using HeyGen API
 */
export async function generateVideo(options: VideoGenerationOptions) {
    if (!HEYGEN_API_KEY) throw new Error('HEYGEN_API_KEY is not configured');

    const response = await fetch(`${HEYGEN_BASE_URL}/v2/video/generate`, {
        method: 'POST',
        headers: {
            'X-Api-Key': HEYGEN_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            video_inputs: [{
                character: {
                    type: 'avatar',
                    avatar_id: options.avatarId || 'Daisy-inskirt-20220818',
                    avatar_style: 'normal',
                },
                voice: {
                    type: 'text',
                    input_text: options.text,
                    voice_id: options.voiceId || '1bd001e7e50f421d891986aad5c21816',
                },
            }],
            dimension: { width: 1280, height: 720 },
            title: options.title || 'Generated Video',
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HeyGen API Error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
}

/**
 * Check video generation status
 */
export async function getVideoStatus(videoId: string) {
    if (!HEYGEN_API_KEY) throw new Error('HEYGEN_API_KEY is not configured');

    const response = await fetch(`${HEYGEN_BASE_URL}/v1/video_status.get?video_id=${videoId}`, {
        headers: { 'X-Api-Key': HEYGEN_API_KEY },
    });

    if (!response.ok) throw new Error('Failed to get video status');
    return await response.json();
}

/**
 * Check if HeyGen is configured
 */
export function isHeyGenConfigured(): boolean {
    return !!HEYGEN_API_KEY;
}
