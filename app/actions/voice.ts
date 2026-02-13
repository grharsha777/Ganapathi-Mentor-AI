'use server'

import { generateSpeech, getVoices } from '@/lib/integrations/elevenlabs'

export async function textToSpeechAction(text: string, voiceId?: string) {
    try {
        const audioBuffer = await generateSpeech(text, voiceId)
        if (!audioBuffer) return { error: 'Failed to generate audio' }

        // Convert ArrayBuffer to Base64 string to send to client
        const base64Audio = Buffer.from(audioBuffer).toString('base64')
        return { audio: `data:audio/mpeg;base64,${base64Audio}` }
    } catch (error) {
        console.error("TTS conversion failed", error)
        return { error: 'TTS failed' }
    }
}

export async function getVoicesAction() {
    return await getVoices()
}
