
interface GenerationResponse {
    artifacts: Array<{
        base64: string
        seed: number
        finishReason: string
    }>
}

export async function generateImage(prompt: string, height: number = 1024, width: number = 1024): Promise<string | null> {
    const apiKey = process.env.STABILITY_API_KEY
    const apiHost = process.env.API_HOST ?? 'https://api.stability.ai'
    const engineId = 'stable-diffusion-xl-1024-v1-0'

    if (!apiKey) {
        console.warn("Missing STABILITY_API_KEY")
        return null
    }

    try {
        const response = await fetch(
            `${apiHost}/v1/generation/${engineId}/text-to-image`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    text_prompts: [
                        {
                            text: prompt,
                        },
                    ],
                    cfg_scale: 7,
                    height,
                    width,
                    steps: 30,
                    samples: 1,
                }),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Non-200 response: ${errorText}`)
        }

        const responseJSON = (await response.json()) as GenerationResponse

        if (responseJSON.artifacts.length > 0) {
            return `data:image/png;base64,${responseJSON.artifacts[0].base64}`
        }

        return null

    } catch (error) {
        console.error('Stability AI Generation Error:', error)
        return null
    }
}
