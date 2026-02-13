/**
 * AIML API Client - DEPRECATED
 * This module now re-exports from lib/ai.ts for backward compatibility.
 * All new code should import from '@/lib/ai' directly.
 */

import { chatCompletion, isAIConfigured } from './ai';

export type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

export interface ChatCompletionOptions {
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

export interface ImageGenerationOptions {
    prompt: string;
    negative_prompt?: string;
    model?: string;
    size?: string;
    n?: number;
}

/**
 * Generate chat completion (compatibility wrapper)
 */
export async function generateChatCompletion(options: ChatCompletionOptions) {
    const content = await chatCompletion(
        options.messages,
        undefined
    );

    // Return a Response-like object for streaming compatibility
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
        }
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    });
}

/**
 * Non-streaming chat completion (compatibility wrapper)
 */
export { chatCompletion };

/**
 * Check if AI is configured (compatibility wrapper)
 */
export function isAIMLConfigured(): boolean {
    return isAIConfigured();
}
