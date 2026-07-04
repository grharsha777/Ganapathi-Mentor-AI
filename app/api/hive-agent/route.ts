import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, isAIConfigured } from '@/lib/ai';

const AGENT_SYSTEM_PROMPT = `You are **Ganapathi IDE Agent** — an elite AI coding assistant embedded in a browser-based IDE.

## Your Capabilities
- You can READ files the user has open and SUGGEST edits
- You can SUGGEST terminal commands to run
- You can ANALYZE code for bugs, performance issues, and security vulnerabilities
- You can EXPLAIN code architecture and suggest improvements
- You can help with Git operations (commit messages, conflict resolution)
- You can debug errors from terminal output

## Response Format Rules
- When suggesting code changes, wrap them in \`\`\`language blocks with the filename as a comment on line 1
- When suggesting terminal commands, prefix with \`> \` 
- Be extremely concise — this is an IDE, not a chat app
- Use bullet points for multiple suggestions
- If you detect an error, explain the root cause in 1-2 lines then provide the fix

## Privacy & Security
- NEVER store or log API keys, tokens, or credentials
- If you see credentials in code, warn the user immediately
- Suggest .env patterns for any hardcoded secrets

## Personality
- Act like a senior engineer pair-programming with the user
- Be direct, fast, and highly competent
- Celebrate good code patterns when you see them
`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, fileContext, terminalContext, projectName } = body;

        // Check for user-provided API key (privacy: sent via header, never stored)
        const userApiKey = req.headers.get('x-user-api-key');
        const userApiProvider = req.headers.get('x-user-api-provider');

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
        }

        // Build context-aware system prompt
        let contextPrompt = AGENT_SYSTEM_PROMPT;

        if (projectName) {
            contextPrompt += `\n\n## Current Project\nProject: ${projectName}\n`;
        }

        if (fileContext) {
            contextPrompt += `\n\n## Currently Open File\nPath: ${fileContext.path}\nLanguage: ${fileContext.language || 'unknown'}\nLines: ${fileContext.lines || 'unknown'}\n\n### File Content:\n\`\`\`${fileContext.language || ''}\n${fileContext.content?.substring(0, 8000) || 'No content'}\n\`\`\`\n`;
        }

        if (terminalContext) {
            contextPrompt += `\n\n## Recent Terminal Output\n\`\`\`\n${terminalContext.substring(0, 3000)}\n\`\`\`\n`;
        }

        // Use user's API key if provided, otherwise fall back to server keys
        if (userApiKey && userApiProvider) {
            // Dynamic provider routing with user's own key
            const providerConfig: Record<string, { baseUrl: string; model: string }> = {
                'mistral': { baseUrl: 'https://api.mistral.ai/v1', model: 'mistral-large-latest' },
                'groq': { baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
                'openai': { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
                'grok': { baseUrl: 'https://api.x.ai/v1', model: 'grok-3-latest' },
            };

            const config = providerConfig[userApiProvider] || providerConfig['groq'];

            try {
                const { default: OpenAI } = await import('openai');
                const client = new OpenAI({ apiKey: userApiKey, baseURL: config.baseUrl });

                const completion = await client.chat.completions.create({
                    model: config.model,
                    messages: [
                        { role: 'system', content: contextPrompt },
                        ...messages.map((m: any) => ({ role: m.role, content: m.content })),
                    ],
                    temperature: 0.3,
                    max_tokens: 4096,
                });

                const responseText = completion.choices[0]?.message?.content || 'No response generated.';
                return new Response(responseText, { headers: { 'Content-Type': 'text/plain' } });
            } catch (apiError: any) {
                const errMsg = apiError?.message || 'API call failed';
                if (errMsg.includes('401') || errMsg.includes('Unauthorized') || errMsg.includes('invalid')) {
                    return new Response(`❌ Invalid API key for ${userApiProvider}. Please check your key and try again.`, {
                        headers: { 'Content-Type': 'text/plain' }, status: 200
                    });
                }
                return new Response(`❌ ${userApiProvider} API error: ${errMsg}`, {
                    headers: { 'Content-Type': 'text/plain' }, status: 200
                });
            }
        }

        // Fall back to server-configured AI
        if (!isAIConfigured()) {
            return new Response(
                '⚠️ No AI configured. Add your API key in the IDE settings panel (bottom-right gear icon) to enable the AI Agent.',
                { headers: { 'Content-Type': 'text/plain' } }
            );
        }

        const responseText = await chatCompletion(messages, contextPrompt);
        return new Response(responseText, { headers: { 'Content-Type': 'text/plain' } });

    } catch (error: any) {
        console.error('Hive Agent Error:', error);
        return new Response(`Sorry, something went wrong: ${error?.message || 'Unknown error'}`, {
            headers: { 'Content-Type': 'text/plain' }, status: 200
        });
    }
}
