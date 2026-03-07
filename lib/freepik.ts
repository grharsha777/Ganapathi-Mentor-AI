const FREEPIK_API_KEYS = [
    process.env.FREEPIK_API_KEY,
    process.env.FREEPIK_API_KEY_2
].filter(Boolean) as string[];

const FREEPIK_BASE_URL = 'https://api.freepik.com/v1';

export interface FreepikImageOptions {
    prompt: string;
    negative_prompt?: string;
    num_images?: number;
    image_size?: 'square' | 'landscape' | 'portrait';
}

/**
 * Generate images using Freepik AI with automatic key rotation
 */
export async function generateImage(options: FreepikImageOptions) {
    if (FREEPIK_API_KEYS.length === 0) throw new Error('Freepik API keys not configured');

    let lastError: Error | null = null;

    // Try each key in sequence (simple rotation/fallback)
    for (const apiKey of FREEPIK_API_KEYS) {
        try {
            const response = await fetch(`${FREEPIK_BASE_URL}/ai/text-to-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-freepik-api-key': apiKey,
                },
                body: JSON.stringify({
                    prompt: options.prompt,
                    negative_prompt: options.negative_prompt || '',
                    num_images: options.num_images || 1,
                    image: {
                        size: options.image_size || 'square',
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Freepik API Error: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            return {
                images: (data.data || []).map((img: any) => ({
                    base64: img.base64,
                    url: img.url || null,
                })),
            };
        } catch (e: any) {
            console.error(`Freepik attempt with key ${apiKey.slice(0, 8)}... failed:`, e.message);
            lastError = e;
            // Continue to next key
        }
    }

    throw lastError || new Error('Freepik generation failed');
}

export function isFreepikConfigured(): boolean {
    return FREEPIK_API_KEYS.length > 0;
}
