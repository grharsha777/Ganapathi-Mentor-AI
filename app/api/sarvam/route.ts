import { NextRequest, NextResponse } from 'next/server';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || 'sk_x1kck5c0_74tssEAqj35wI6F9dxNvHwcG'; // Fallback to provided key if missing
const SARVAM_BASE_URL = 'https://api.sarvam.ai';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, text, sourceLanguage, targetLanguage, speaker } = body;

        if (!SARVAM_API_KEY) {
            return NextResponse.json({ error: 'Sarvam API key not configured' }, { status: 500 });
        }

        const headers = {
            'api-subscription-key': SARVAM_API_KEY,
            'Content-Type': 'application/json'
        };

        if (action === 'translate') {
            const payload = {
                input: text,
                source_language_code: sourceLanguage || "en-IN",
                target_language_code: targetLanguage || "hi-IN",
                speaker_gender: speaker || "Male",
                mode: "formal",
                model: "sarvam-translate:v1"
            };

            const res = await fetch(`${SARVAM_BASE_URL}/translate`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const textErr = await res.text();
                throw new Error(`Sarvam Translation failed: ${textErr}`);
            }

            const data = await res.json();
            return NextResponse.json({ translated_text: data.translated_text || data.output });
        }

        else if (action === 'tts') {
            const payload = {
                inputs: [text],
                target_language_code: targetLanguage || "hi-IN",
                speaker: speaker || "aditya",
                pace: 1.0,
                speech_sample_rate: 8000,
                enable_preprocessing: true,
                model: "bulbul:v3"
            };

            const res = await fetch(`${SARVAM_BASE_URL}/text-to-speech`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const textErr = await res.text();
                throw new Error(`Sarvam TTS failed: ${textErr}`);
            }

            const data = await res.json();
            // Sarvam API returns { audios: [ "base64_string" ] }
            if (data.audios && data.audios.length > 0) {
                return NextResponse.json({ audio_base64: data.audios[0] });
            } else {
                return NextResponse.json({ error: 'No audio returned from Sarvam API' }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

    } catch (error: any) {
        console.error('Sarvam API error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
