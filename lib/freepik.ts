const FREEPIK_API_KEY = process.env.FREEPIK_API_KEY;
const FREEPIK_BASE_URL = 'https://api.freepik.com/v1';

export interface FreepikImageOptions {
    prompt: string;
    negative_prompt?: string;
    num_images?: number;
    image_size?: 'square' | 'landscape' | 'portrait';
}

/**
 * Generate images using Freepik AI
 */
export async function generateImage(options: FreepikImageOptions) {
    if (!FREEPIK_API_KEY) throw new Error('FREEPIK_API_KEY is not configured');

    const response = await fetch(`${FREEPIK_BASE_URL}/ai/text-to-image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-freepik-api-key': FREEPIK_API_KEY,
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
    // Return array of base64 images
    return {
        images: (data.data || []).map((img: any) => ({
            base64: img.base64,
            url: img.url || null,
        })),
    };
}

export function isFreepikConfigured(): boolean {
    return !!FREEPIK_API_KEY;
}
