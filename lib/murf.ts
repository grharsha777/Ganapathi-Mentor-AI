const MURF_API_KEYS = [
    process.env.MURF_API_KEY,
    process.env.MURF_API_KEY_2
].filter(Boolean) as string[];

const MURF_BASE_URL = 'https://api.murf.ai/v1';

export interface TextToSpeechOptions {
    text: string;
    voiceId?: string;
    style?: string;
    rate?: number;
    pitch?: number;
    format?: 'MP3' | 'WAV' | 'FLAC';
}

/**
 * Generate speech from text using Murf API with automatic key rotation
 */
export async function generateSpeech(options: TextToSpeechOptions) {
    if (MURF_API_KEYS.length === 0) throw new Error('Murf API keys not configured');

    let lastError: Error | null = null;

    for (const apiKey of MURF_API_KEYS) {
        try {
            const response = await fetch(`${MURF_BASE_URL}/speech/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey,
                },
                body: JSON.stringify({
                    text: options.text,
                    voiceId: options.voiceId || 'en-US-natalie',
                    style: options.style || 'Conversational',
                    rate: options.rate || 0,
                    pitch: options.pitch || 0,
                    format: options.format || 'MP3',
                    channelType: 'MONO',
                    sampleRate: 48000,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Murf API Error: ${errorData.message || response.statusText}`);
            }

            return await response.json();
        } catch (e: any) {
            console.error(`Murf attempt with key ${apiKey.slice(0, 8)}... failed:`, e.message);
            lastError = e;
            // Continue to next key
        }
    }

    throw lastError || new Error('Murf speech generation failed');
}

/**
 * List available Murf voices (using the first available key)
 */
export async function listVoices() {
    if (MURF_API_KEYS.length === 0) throw new Error('Murf API keys not configured');

    const response = await fetch(`${MURF_BASE_URL}/speech/voices`, {
        headers: { 'api-key': MURF_API_KEYS[0] },
    });

    if (!response.ok) throw new Error('Failed to fetch voices');
    return await response.json();
}

export function isMurfConfigured(): boolean {
    return MURF_API_KEYS.length > 0;
}
