import { NextRequest, NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════════
   AI Agent Proxy — Enterprise-grade, privacy-first
   
   - User's API key is sent per-request, NEVER stored server-side
   - Supports: OpenAI, Anthropic, Groq, Mistral, Grok (xAI), Gemini
   - All keys transit over HTTPS only
   ═══════════════════════════════════════════════════════════════ */

interface ProviderConfig {
    url: string;
    headers: Record<string, string>;
    body: Record<string, unknown>;
    extractText: (data: any) => string;
}

function buildProvider(provider: string, apiKey: string, model: string, messages: any[]): ProviderConfig | null {
    const systemMsg = messages.find((m: any) => m.role === 'system')?.content || '';
    const chatMsgs = messages.filter((m: any) => m.role !== 'system');

    const openaiLike = (url: string, defaultModel: string): ProviderConfig => ({
        url,
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: { model: model || defaultModel, messages, max_tokens: 4096, temperature: 0.7 },
        extractText: (d) => d.choices?.[0]?.message?.content || '',
    });

    switch (provider) {
        case 'openai':
            return openaiLike('https://api.openai.com/v1/chat/completions', 'gpt-4o-mini');
        case 'groq':
            return openaiLike('https://api.groq.com/openai/v1/chat/completions', 'llama-3.1-8b-instant');
        case 'mistral':
            return openaiLike('https://api.mistral.ai/v1/chat/completions', 'mistral-small-latest');
        case 'grok':
            return openaiLike('https://api.x.ai/v1/chat/completions', 'grok-beta');
        case 'anthropic':
            return {
                url: 'https://api.anthropic.com/v1/messages',
                headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
                body: { model: model || 'claude-3-haiku-20240307', messages: chatMsgs, system: systemMsg, max_tokens: 4096 },
                extractText: (d) => d.content?.[0]?.text || '',
            };
        case 'gemini': {
            const mdl = model || 'gemini-1.5-flash';
            return {
                url: `https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${apiKey}`,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    contents: chatMsgs.map((m: any) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
                    ...(systemMsg ? { systemInstruction: { parts: [{ text: systemMsg }] } } : {}),
                    generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
                },
                extractText: (d) => d.candidates?.[0]?.content?.parts?.[0]?.text || '',
            };
        }
        default:
            return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { provider, apiKey, model, messages } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ error: 'API key is required. Configure your AI provider key in IDE Settings.' }, { status: 400 });
        }
        if (!provider) {
            return NextResponse.json({ error: 'AI provider is required.' }, { status: 400 });
        }

        const config = buildProvider(provider, apiKey, model, messages);
        if (!config) {
            return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
        }

        const response = await fetch(config.url, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify(config.body),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || errData.error || errData.message || `Provider returned ${response.status}`;

            if (response.status === 401 || response.status === 403) {
                return NextResponse.json({ error: `Invalid API key for ${provider}. Please check your key in IDE Settings.` }, { status: 401 });
            }
            if (response.status === 429) {
                return NextResponse.json({ error: 'Rate limit exceeded. Please wait and try again.' }, { status: 429 });
            }
            return NextResponse.json({ error: String(errMsg) }, { status: response.status });
        }

        const data = await response.json();
        const text = config.extractText(data);

        if (!text) {
            return NextResponse.json({ error: 'Empty response from AI provider.' }, { status: 500 });
        }

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error('[AI Agent]', error);
        return NextResponse.json({ error: error.message || 'AI request failed' }, { status: 500 });
    }
}
