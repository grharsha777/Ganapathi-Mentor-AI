const SUNO_API_KEY = process.env.SUNO_API_KEY;
const SUNO_BASE_URL = 'https://apibox.erweima.ai';

export interface MusicGenerationOptions {
    prompt: string;
    style?: string;
    title?: string;
    customMode?: boolean;
    instrumental?: boolean;
    waitAudio?: boolean;
}

/**
 * Generate music using Suno API
 */
export async function generateMusic(options: MusicGenerationOptions) {
    if (!SUNO_API_KEY) throw new Error('SUNO_API_KEY is not configured');

    const response = await fetch(`${SUNO_BASE_URL}/api/v1/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUNO_API_KEY}`,
        },
        body: JSON.stringify({
            prompt: options.prompt,
            style: options.style || '',
            title: options.title || 'Generated Track',
            customMode: options.customMode || false,
            instrumental: options.instrumental || false,
            waitAudio: options.waitAudio !== undefined ? options.waitAudio : true,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Suno API Error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
}

/**
 * Check generation status
 */
export async function getMusicStatus(taskId: string) {
    if (!SUNO_API_KEY) throw new Error('SUNO_API_KEY is not configured');

    const response = await fetch(`${SUNO_BASE_URL}/api/v1/generate/record?taskId=${taskId}`, {
        headers: {
            'Authorization': `Bearer ${SUNO_API_KEY}`,
        },
    });

    if (!response.ok) throw new Error('Failed to get music generation status');
    return await response.json();
}

export function isSunoConfigured(): boolean {
    return !!SUNO_API_KEY;
}
