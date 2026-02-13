'use server'

import { generateImage } from '@/lib/integrations/stability'

export async function generateImageAction(prompt: string) {
    try {
        const image = await generateImage(prompt)
        if (!image) return { error: 'Failed to generate image. Check API key.' }
        return { image }
    } catch (error) {
        console.error("Image Gen Server Action Error", error)
        return { error: 'Generation failed' }
    }
}
