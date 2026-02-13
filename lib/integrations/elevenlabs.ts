
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const BASE_URL = 'https://api.elevenlabs.io/v1'

export interface Voice {
    voice_id: string
    name: string
    preview_url: string
}

export async function getVoices(): Promise<Voice[]> {
    if (!ELEVENLABS_API_KEY) return []

    try {
        const res = await fetch(`${BASE_URL}/voices`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            }
        })

        if (!res.ok) throw new Error('Failed to fetch voices')
        const data = await res.json()
        return data.voices.map((v: any) => ({
            voice_id: v.voice_id,
            name: v.name,
            preview_url: v.preview_url
        })).slice(0, 10) // Limit to top 10 to save bandwidth/lists
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function generateSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM'): Promise<ArrayBuffer | null> {
    if (!ELEVENLABS_API_KEY) return null

    try {
        const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        })

        if (!res.ok) {
            const err = await res.text()
            console.error('ElevenLabs Error:', err)
            throw new Error('Failed to generate speech')
        }

        return await res.arrayBuffer()
    } catch (error) {
        console.error(error)
        return null
    }
}
