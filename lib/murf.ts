const MURF_API_KEY = process.env.MURF_API_KEY;
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
 * Generate speech from text using Murf API
 */
export async function generateSpeech(options: TextToSpeechOptions) {
    if (!MURF_API_KEY) throw new Error('MURF_API_KEY is not configured');

    const response = await fetch(`${MURF_BASE_URL}/speech/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': MURF_API_KEY,
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
}

/**
 * List available Murf voices
 */
export async function listVoices() {
    if (!MURF_API_KEY) throw new Error('MURF_API_KEY is not configured');

    const response = await fetch(`${MURF_BASE_URL}/speech/voices`, {
        headers: { 'api-key': MURF_API_KEY },
    });

    if (!response.ok) throw new Error('Failed to fetch voices');
    return await response.json();
}

export function isMurfConfigured(): boolean {
    return !!MURF_API_KEY;
}
