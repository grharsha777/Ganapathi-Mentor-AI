const PICSART_API_KEY = process.env.PICSART_API_KEY;
const PICSART_BASE_URL = 'https://api.picsart.io/tools/1.0';

export interface PicsartGenerateOptions {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    count?: number;
}

export async function generateImage(options: PicsartGenerateOptions) {
    if (!PICSART_API_KEY) {
        throw new Error('PICSART_API_KEY is not configured');
    }

    const response = await fetch(`${PICSART_BASE_URL}/text2image`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Picsart-API-Key': PICSART_API_KEY,
        },
        body: JSON.stringify({
            prompt: options.prompt,
            negative_prompt: options.negative_prompt || '',
            width: options.width || 1024,
            height: options.height || 1024,
            count: options.count || 1,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Picsart API Error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
}
