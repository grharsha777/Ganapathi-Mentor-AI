/**
 * AWS Bedrock AI Inference Client
 * 
 * Provides multi-model inference via Amazon Bedrock for enterprise-grade AI operations.
 * Supports Claude 3.5 Sonnet, Llama 3, Mistral Large, and Titan models.
 * 
 * @module lib/aws/bedrock
 * @requires @aws-sdk/client-bedrock-runtime
 */

import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';

const REGION = process.env.AWS_REGION || 'ap-south-1';

const bedrockClient = new BedrockRuntimeClient({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

export type BedrockModel =
    | 'anthropic.claude-3-5-sonnet-20241022-v2:0'
    | 'anthropic.claude-3-haiku-20240307-v1:0'
    | 'meta.llama3-1-70b-instruct-v1:0'
    | 'mistral.mistral-large-2407-v1:0'
    | 'amazon.titan-text-premier-v2:0';

interface BedrockInferenceOptions {
    model: BedrockModel;
    prompt: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
}

interface BedrockResponse {
    content: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
}

/**
 * Invoke a Bedrock model for text generation.
 * Automatically formats the request body based on the model provider.
 */
export async function invokeBedrockModel(options: BedrockInferenceOptions): Promise<BedrockResponse> {
    const {
        model,
        prompt,
        systemPrompt = 'You are Ganapathi Mentor AI, a legendary senior architect and code mentor.',
        maxTokens = 4096,
        temperature = 0.7,
        topP = 0.9,
        stopSequences = [],
    } = options;

    const startTime = Date.now();

    let body: Record<string, unknown>;

    if (model.startsWith('anthropic.')) {
        body = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: maxTokens,
            temperature,
            top_p: topP,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
            stop_sequences: stopSequences,
        };
    } else if (model.startsWith('meta.')) {
        body = {
            prompt: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
            max_gen_len: maxTokens,
            temperature,
            top_p: topP,
        };
    } else if (model.startsWith('mistral.')) {
        body = {
            prompt: `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`,
            max_tokens: maxTokens,
            temperature,
            top_p: topP,
            stop: stopSequences,
        };
    } else {
        // Amazon Titan
        body = {
            inputText: `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`,
            textGenerationConfig: {
                maxTokenCount: maxTokens,
                temperature,
                topP,
                stopSequences,
            },
        };
    }

    const command = new InvokeModelCommand({
        modelId: model,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(body),
    });

    const response = await bedrockClient.send(command);
    const parsed = JSON.parse(new TextDecoder().decode(response.body));
    const latencyMs = Date.now() - startTime;

    let content = '';
    let inputTokens = 0;
    let outputTokens = 0;

    if (model.startsWith('anthropic.')) {
        content = parsed.content?.[0]?.text || '';
        inputTokens = parsed.usage?.input_tokens || 0;
        outputTokens = parsed.usage?.output_tokens || 0;
    } else if (model.startsWith('meta.')) {
        content = parsed.generation || '';
        inputTokens = parsed.prompt_token_count || 0;
        outputTokens = parsed.generation_token_count || 0;
    } else if (model.startsWith('mistral.')) {
        content = parsed.outputs?.[0]?.text || '';
    } else {
        content = parsed.results?.[0]?.outputText || '';
        inputTokens = parsed.inputTextTokenCount || 0;
        outputTokens = parsed.results?.[0]?.tokenCount || 0;
    }

    return { content, model, inputTokens, outputTokens, latencyMs };
}

/**
 * Stream responses from Bedrock models.
 * Used for real-time chat interfaces and code generation.
 */
export async function streamBedrockModel(
    options: BedrockInferenceOptions,
    onChunk: (chunk: string) => void
): Promise<void> {
    const { model, prompt, systemPrompt, maxTokens = 4096, temperature = 0.7 } = options;

    let body: Record<string, unknown>;

    if (model.startsWith('anthropic.')) {
        body = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: maxTokens,
            temperature,
            system: systemPrompt || 'You are Ganapathi Mentor AI.',
            messages: [{ role: 'user', content: prompt }],
        };
    } else {
        body = {
            inputText: `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`,
            textGenerationConfig: { maxTokenCount: maxTokens, temperature },
        };
    }

    const command = new InvokeModelWithResponseStreamCommand({
        modelId: model,
        contentType: 'application/json',
        body: JSON.stringify(body),
    });

    const response = await bedrockClient.send(command);

    if (response.body) {
        for await (const event of response.body) {
            if (event.chunk?.bytes) {
                const parsed = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
                if (parsed.type === 'content_block_delta') {
                    onChunk(parsed.delta?.text || '');
                } else if (parsed.outputText) {
                    onChunk(parsed.outputText);
                }
            }
        }
    }
}

/**
 * Batch inference for code review analysis.
 * Runs multiple models in parallel and aggregates results.
 */
export async function batchCodeAnalysis(code: string, language: string): Promise<{
    security: BedrockResponse;
    performance: BedrockResponse;
    architecture: BedrockResponse;
}> {
    const baseOptions = {
        maxTokens: 2048,
        temperature: 0.3,
    };

    const [security, performance, architecture] = await Promise.all([
        invokeBedrockModel({
            ...baseOptions,
            model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
            prompt: `Analyze this ${language} code for security vulnerabilities. List CVE references where applicable:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            systemPrompt: 'You are a senior security engineer specializing in application security and OWASP compliance.',
        }),
        invokeBedrockModel({
            ...baseOptions,
            model: 'anthropic.claude-3-haiku-20240307-v1:0',
            prompt: `Analyze this ${language} code for performance issues. Include Big-O complexity analysis:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            systemPrompt: 'You are a performance engineering specialist with expertise in algorithmic optimization.',
        }),
        invokeBedrockModel({
            ...baseOptions,
            model: 'mistral.mistral-large-2407-v1:0',
            prompt: `Review this ${language} code for architectural patterns, SOLID principles, and design improvements:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            systemPrompt: 'You are a principal software architect with 20 years of experience in enterprise systems.',
        }),
    ]);

    return { security, performance, architecture };
}

export default bedrockClient;
