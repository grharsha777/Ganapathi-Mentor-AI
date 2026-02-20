import { InferenceClient } from "@huggingface/inference";

// Ensure we have a token (either one they added as HUGGINGFACE_API_KEY or fallback to HF_TOKEN)
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;

// Initialize the client
export const hf = HF_TOKEN ? new InferenceClient(HF_TOKEN) : null;

export function isHuggingFaceConfigured() {
    return !!hf;
}

/**
 * Image Generation via SDXL / Fal.ai
 * (Using user-provided stabilityai/stable-diffusion-xl-base-1.0 as the requested base)
 */
export async function generateImageHuggingFace(prompt: string, width: number = 1024, height: number = 1024): Promise<Blob> {
    if (!hf) throw new Error("Hugging Face API key not configured");

    // Note: HF inference takes size hints or num_inference_steps via parameters
    const response = await hf.textToImage({
        provider: "together", // as per user snippet
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        inputs: prompt,
        parameters: { num_inference_steps: 30 }, // Using a solid default step count
    });

    // The Inference SDK might return a Blob directly, but depending on the version types can differ.
    return response as unknown as Blob;
}

/**
 * Video Generation via Wan-AI (Text-to-Video)
 */
export async function generateVideoHuggingFace(prompt: string): Promise<Blob> {
    if (!hf) throw new Error("Hugging Face API key not configured");

    const videoBlob = await hf.textToVideo({
        provider: "fal-ai", // as per user snippet
        model: "Wan-AI/Wan2.2-TI2V-5B",
        inputs: prompt,
    });

    return videoBlob;
}

/**
 * Text-to-Speech via Kokoro
 */
export async function generateSpeechHuggingFace(text: string): Promise<Blob> {
    if (!hf) throw new Error("Hugging Face API key not configured");

    const audioBlob = await hf.textToSpeech({
        provider: "fal-ai", // as per user snippet
        model: "hexgrad/Kokoro-82M",
        inputs: text,
    });

    return audioBlob;
}

/**
 * Convert Blob to Base64 (Useful for API JSON responses)
 */
export async function blobToBase64(blob: Blob): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
}

/**
 * Chat Completion Stream via Google Gemma 3
 */
export async function chatCompletionHuggingFaceStream(messages: any[], onChunk: (chunk: string) => void): Promise<string> {
    if (!hf) throw new Error("Hugging Face API key not configured");

    let fullOutput = "";

    const stream = hf.chatCompletionStream({
        model: "google/gemma-3-27b-it:featherless-ai", // as per user snippet
        messages: messages,
    });

    for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
            const delta = chunk.choices[0].delta?.content || "";
            fullOutput += delta;
            onChunk(delta);
        }
    }

    return fullOutput;
}
