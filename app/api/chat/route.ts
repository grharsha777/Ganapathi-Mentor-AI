import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, isAIConfigured } from '@/lib/ai';
import { verifyToken } from '@/lib/auth';
import { searchSerp } from '@/lib/integrations/serp';
import { searchYouTubeVideos } from '@/lib/youtube';
import { generateImage, isFreepikConfigured } from '@/lib/freepik';

// Detect intent from user message
function detectIntent(message: string): { wantsYouTube: boolean; wantsImage: boolean; wantsSearch: boolean; wantsSong: boolean } {
    const lower = message.toLowerCase();
    return {
        wantsYouTube: /youtube|video|tutorial video|watch|vide?o/i.test(lower),
        wantsImage: /generate.*image|create.*image|make.*image|draw|generate.*picture|visualize/i.test(lower),
        wantsSearch: /search|research|find.*about|latest|news|what is|explain|how to/i.test(lower),
        wantsSong: /song|music|generate.*song|create.*song|make.*music|sing|melody|beat|compose/i.test(lower),
    };
}

const SYSTEM_PROMPT = `You are **Ganapathi AI**, an advanced AI coding mentor and assistant built by **G R Harsha**.

## Your Identity
- Your name is **Ganapathi AI** (also known as Ganapathi Mentor AI)
- You were created and built by **G R Harsha**
- You are NOT ChatGPT, GPT, Claude, Gemini, or any other AI. You are Ganapathi AI.
- If anyone asks "who are you", "who built you", "which LLM are you", etc., always answer that you are Ganapathi AI built by G R Harsha.

## Your Capabilities
- You are an expert coding mentor that helps users learn programming
- You can explain code, generate tutorials, help debug, and teach concepts
- You have access to web search, YouTube video search, and image generation
- You are deeply integrated with the Ganapathi Mentor AI platform

## About the Platform (for app tutorials)
The Ganapathi Mentor AI platform has these features and pages:
- **Dashboard** (/dashboard) — Main hub with quick stats and recent activity
- **Concept Engine** (/dashboard/concepts) — Search any tech concept for AI explanations at Beginner/Intermediate/Advanced levels, with YouTube videos, web research, and AI-generated visuals
- **AI Chat** — This chatbot! Available on every page via the floating button
- **Creative Studio** (/dashboard/media/studio) — AI image generation for project assets
- **Code Review** (/dashboard/code-review) — Paste code for AI-powered analysis with best practices
- **Learning Paths** (/dashboard/learning) — AI-generated personalized learning roadmaps
- **Documentation Generator** (/dashboard/docs) — Auto-generate documentation from code
- **Productivity** (/dashboard/productivity) — Task management and productivity tools
- **Advanced Training** (/dashboard/specialized) — Interview Prep & Code-to-Learn tutorials
- **Analytics** (/dashboard/analytics) — Track learning progress and coding metrics
- **GitHub Integration** — Connect your GitHub for repo analysis

## Response Formatting Rules
- Always use **Markdown** formatting in your responses
- When providing code, ALWAYS wrap it in triple backticks with the language, like:
\`\`\`python
print("hello")
\`\`\`
- When providing YouTube videos, format them as clickable markdown links: [Video Title](https://youtube.com/watch?v=ID)
- Use headers, bullet points, bold text for readability
- Be concise but thorough
- Add emojis sparingly for engagement

## Song Generation
When users ask you to generate a song, create music, or compose:
- Provide a direct link to Suno AI: [Create Your Song on Suno AI](https://suno.com)
- Suggest lyrics or a prompt the user can paste into Suno AI
- You can also suggest [Murf AI](https://murf.ai) for voice-over and narration generation
- Format these as clear, clickable links

## Context
The user is currently on: {CONTEXT}
`;

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyToken(token);

    if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
        const { messages, context } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
        }

        if (!isAIConfigured()) {
            return new Response("AI chat is not configured. Add MISTRAL_API_KEY or GROQ_API_KEY to .env.local to enable the assistant.", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // Get the latest user message for intent detection
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
        const intent = detectIntent(lastUserMessage);

        // Gather enrichment data in parallel
        const enrichments: string[] = [];

        const enrichmentTasks: Promise<void>[] = [];

        if (intent.wantsYouTube) {
            enrichmentTasks.push(
                searchYouTubeVideos(lastUserMessage.replace(/youtube|video|tutorial/gi, '').trim(), 5)
                    .then(videos => {
                        if (videos.length > 0) {
                            enrichments.push('\n\n[YOUTUBE VIDEOS FOUND - Include these as clickable links in your response]:\n' +
                                videos.map(v => `- [${v.title}](${v.url}) by ${v.channelTitle}`).join('\n'));
                        }
                    })
                    .catch(() => { })
            );
        }

        if (intent.wantsSearch) {
            enrichmentTasks.push(
                searchSerp(lastUserMessage, 4)
                    .then(results => {
                        if (results.length > 0) {
                            enrichments.push('\n\n[WEB SEARCH RESULTS - Use these to enhance your answer]:\n' +
                                results.map(r => `- ${r.title}: ${r.snippet} (${r.link})`).join('\n'));
                        }
                    })
                    .catch(() => { })
            );
        }

        if (intent.wantsImage && isFreepikConfigured()) {
            enrichmentTasks.push(
                generateImage({ prompt: lastUserMessage.replace(/generate|create|make|draw/gi, '').trim(), num_images: 1 })
                    .then(result => {
                        const img = result.images?.[0];
                        if (img?.url) {
                            enrichments.push(`\n\n[IMAGE GENERATED - Include this image in your response using markdown]:\n![Generated Image](${img.url})`);
                        } else if (img?.base64) {
                            enrichments.push(`\n\n[IMAGE GENERATED - Include this in your response]:\n![Generated Image](data:image/png;base64,${img.base64})`);
                        }
                    })
                    .catch(() => { })
            );
        }

        // Handle song intent — add Suno AI guidance
        if (intent.wantsSong) {
            enrichments.push('\n\n[SONG GENERATION REQUEST - The user wants to create music. Provide a direct link to Suno AI (https://suno.com) and suggest a creative prompt/lyrics they can use. Also mention Murf AI (https://murf.ai) for voiceovers.]');
        }

        await Promise.allSettled(enrichmentTasks);

        // Build the final system prompt
        const systemPrompt = SYSTEM_PROMPT.replace('{CONTEXT}', context || 'the dashboard') +
            (enrichments.length > 0 ? '\n\n## Additional Context from Tools\n' + enrichments.join('\n') : '');

        try {
            const response = await chatCompletion(messages, systemPrompt);
            return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
        } catch (chatError: unknown) {
            console.error("Chat Completion Error:", chatError);
            const errMsg = chatError instanceof Error ? chatError.message : 'Unknown error';
            const friendlyMsg = errMsg.includes('quota') || errMsg.includes('credit') || errMsg.includes('billing')
                ? "AI service limit reached. Please try again in a few minutes or add credits to your API provider."
                : `Sorry, I couldn't process that right now. Error: ${errMsg}`;
            return new Response(friendlyMsg, { headers: { 'Content-Type': 'text/plain' }, status: 200 });
        }
    } catch (error: unknown) {
        console.error("Chat Error:", error);
        const msg = error instanceof Error ? error.message : 'Failed to generate response';
        return new Response(`Sorry, something went wrong: ${msg}`, { headers: { 'Content-Type': 'text/plain' }, status: 200 });
    }
}
