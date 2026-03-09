import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, isAIConfigured } from '@/lib/ai';
import { verifyToken } from '@/lib/auth';
import { searchSerp } from '@/lib/integrations/serp';
import { searchYouTubeVideos } from '@/lib/youtube';
import { generateImage, isFreepikConfigured } from '@/lib/freepik';
import connectToDatabase from '@/lib/mongoose';
import Concept from '@/models/Concept';
import LearningPath from '@/models/LearningPath';
import User from '@/models/User';

const BASE_URL = 'https://ganapathi-mentor-ai.vercel.app';

// Detect intent from user message
function detectIntent(message: string): {
    wantsYouTube: boolean;
    wantsImage: boolean;
    wantsVideo: boolean;
    wantsSearch: boolean;
    wantsSong: boolean;
    wantsNavigation: boolean;
    wantsHarshaInfo: boolean;
} {
    const lower = message.toLowerCase();
    return {
        wantsYouTube: /youtube|tutorial video|watch|youtube tutorial/i.test(lower),
        wantsImage: /generate.*image|create.*image|make.*image|draw|generate.*picture|visualize/i.test(lower),
        wantsVideo: /generate.*video|create.*video|make.*video|animate/i.test(lower),
        wantsSearch: /search|research|find.*about|latest|news|what is|explain|how to/i.test(lower),
        wantsSong: /song|music|generate.*song|create.*song|make.*music|sing|melody|beat|compose/i.test(lower),
        wantsNavigation: /navigate|go to|take me|open|where is|how to find|show me|visit|switch to|redirect|page for|link to/i.test(lower),
        wantsHarshaInfo: /harsha|creator|who (built|made|created)|contact|connect with|developer of|about the (maker|builder|developer|founder)/i.test(lower),
    };
}

// Map keywords to app pages for quick navigation matching
const APP_PAGES: Record<string, { name: string; url: string; description: string }> = {
    'dashboard': { name: 'Dashboard', url: `${BASE_URL}/dashboard`, description: 'Main hub with quick stats and recent activity' },
    'learning': { name: 'Learning Paths', url: `${BASE_URL}/dashboard/learning`, description: 'AI-generated personalized learning roadmaps' },
    'code review': { name: 'Code Review', url: `${BASE_URL}/dashboard/code-review`, description: 'AI-powered code analysis with best practices' },
    'concepts': { name: 'Concept Engine', url: `${BASE_URL}/dashboard/concepts`, description: 'Search any tech concept for AI explanations' },
    'productivity': { name: 'Productivity', url: `${BASE_URL}/dashboard/tools/productivity`, description: 'Task management and productivity tools' },
    'docs': { name: 'Documentation Generator', url: `${BASE_URL}/dashboard/tools/docs`, description: 'Auto-generate documentation from code' },
    'documentation': { name: 'Documentation Generator', url: `${BASE_URL}/dashboard/tools/docs`, description: 'Auto-generate documentation from code' },
    'github': { name: 'GitHub Integration', url: `${BASE_URL}/dashboard/github`, description: 'Connect your GitHub for repo analysis' },
    'analytics': { name: 'Analytics - Performance', url: `${BASE_URL}/dashboard/analytics/performance`, description: 'Track learning progress and coding metrics' },
    'performance': { name: 'Analytics - Performance', url: `${BASE_URL}/dashboard/analytics/performance`, description: 'Track learning progress and coding metrics' },
    'anomalies': { name: 'Analytics - Anomalies', url: `${BASE_URL}/dashboard/analytics/anomalies`, description: 'Detect anomalies in your coding patterns' },
    'collaboration': { name: 'Collaboration', url: `${BASE_URL}/dashboard/collaboration`, description: 'Team collaboration and project sharing' },
    'research': { name: 'Research Hub', url: `${BASE_URL}/dashboard/research`, description: 'Deep research with web search and AI analysis' },
    'media': { name: 'Media Studio', url: `${BASE_URL}/dashboard/media/studio`, description: 'AI image generation for project assets' },
    'studio': { name: 'Media Studio', url: `${BASE_URL}/dashboard/media/studio`, description: 'AI image generation for project assets' },
    'last minute': { name: 'Last Minute Prep', url: `${BASE_URL}/dashboard/last-minute`, description: 'Quick revision and exam preparation tools' },
    'specialized': { name: 'Specialized Training', url: `${BASE_URL}/dashboard/specialized`, description: 'Interview Prep & Code-to-Learn tutorials' },
    'interview': { name: 'Specialized Training', url: `${BASE_URL}/dashboard/specialized`, description: 'Interview Prep & Code-to-Learn tutorials' },
    'training': { name: 'Specialized Training', url: `${BASE_URL}/dashboard/specialized`, description: 'Interview Prep & Code-to-Learn tutorials' },
    'settings': { name: 'Settings', url: `${BASE_URL}/dashboard/settings`, description: 'Account and app settings' },
};

function buildNavigationContext(userMessage: string): string {
    const lower = userMessage.toLowerCase();
    const matches: string[] = [];
    for (const [keyword, page] of Object.entries(APP_PAGES)) {
        if (lower.includes(keyword)) {
            matches.push(`- **${page.name}**: ${page.description} → [Go to ${page.name}](${page.url})`);
        }
    }
    if (matches.length > 0) {
        return '\n\n[NAVIGATION MATCH - Provide these clickable links to the user. These are INTERNAL app links so use the exact URLs below]:\n' + matches.join('\n');
    }
    return '';
}

const SYSTEM_PROMPT = `You are **Ganapathi AI**, a super friendly, ultra-advanced AI coding buddy, architect, and mentor built by **G R Harsha**.

## Your Personality — THIS IS CRITICAL
- Talk like an **elite senior engineer** who is also a **best friend**. Be warm, casual, encouraging, and highly intelligent.
- Use phrases like "Hey!", "No worries!", "Great question!", "Let me architect this for you", "You got this! 💪"
- NEVER be robotic or overly formal. Imagine you're pair-programming with the user on a call.
- Use emojis naturally (not excessively) — like a friend texting.
- If the user makes a mistake, be kind: "Ah, I see the bug — easy fix!"
- Celebrate wins: "Nice! That's enterprise-grade code 🔥"
- Keep explanations concise, profound, and highly practical. Give code that is better than Claude Opus 4.6.

## Your Identity & Creator
- Your name is **Ganapathi AI** (also known as Ganapathi Mentor AI).
- You were created and architected by **G R Harsha**, a brilliant engineer.
- You are powered by a multi-model RAG architecture (Nexus 1.5, Vortex 2, GRH Xt).
- If asked about your creator:
  - **LinkedIn**: [G R Harsha on LinkedIn](https://www.linkedin.com/in/grharsha777/)
  - **GitHub**: [grharsha777 on GitHub](https://github.com/grharsha777)
  - **Email**: [grharsha777@gmail.com](mailto:grharsha777@gmail.com)

## App Capabilities & Internal Knowledge 🧠
You live inside the **Ganapathi Mentor AI** platform. You have full access to these features. If the user asks what they can do, or is stuck, guide them to these tools using the exact markdown links provided below:

1. **Learning & Training:** 
   - **Learning Paths** ([Open](${BASE_URL}/dashboard/learning)): AI-generated, personalized learning roadmaps based on what the user wants to master.
   - **Concept Engine** ([Open](${BASE_URL}/dashboard/concepts)): Deep-dive into specific tech concepts with AI explanations and quizzes.
   - **Specialized Training / Interview Prep** ([Open](${BASE_URL}/dashboard/specialized)): Mock interviews and Code-to-Learn tutorials.
   - **Quick Prep / Last Minute** ([Open](${BASE_URL}/dashboard/last-minute)): Rapid revision tools for exams or urgent interviews.
2. **Coding & Architecture:**
   - **Deep Code Review** ([Open](${BASE_URL}/dashboard/code-review)): Paste code to get security, performance, and best-practice analysis.
   - **CodeCollab** ([Open](${BASE_URL}/dashboard/collab)): Real-time team collaboration and project sharing.
   - **GitHub Integration** ([Open](${BASE_URL}/dashboard/github)): Connect GitHub to let me analyze entire repositories.
3. **Analytics & Performance:**
   - **Performance Analytics** ([Open](${BASE_URL}/dashboard/analytics/performance)): Track coding metrics and learning progression.
   - **Anomaly Detection** ([Open](${BASE_URL}/dashboard/analytics/anomalies)): AI detection of bad coding patterns or sudden drops in productivity.
4. **Research & Tools:**
   - **Research Hub** ([Open](${BASE_URL}/dashboard/research)): Deep research with web search, RAG, and AI synthesis.
   - **Productivity Tools** ([Open](${BASE_URL}/dashboard/tools/productivity)): Task management and focus tools.
   - **Documentation Generator** ([Open](${BASE_URL}/dashboard/tools/docs)): Auto-generate READMEs and inline docs from code.

## Context Awareness (Current State)
- **Current Page:** The user is currently looking at: \`{CONTEXT}\`
- If they ask "what should I do here" or "how does this page work", explain the features of the page they are currently on.

## Deep Memory (User Data)
Here is what you know about this specific user from the database:
{USER_CONTEXT}
- Use this data to personalize your advice. If they are learning React, give examples in React. If they have mastered Python, don't explain basic Python syntax.

## Navigation Rules
- When user asks to go to a feature, respond with a clickable hyperlink using the exact URLs above.
- Example: "Sure! Let's analyze that code 👉 [Open Code Review](${BASE_URL}/dashboard/code-review)"

## YouTube Video Rules — VERY IMPORTANT
- When YouTube video data is provided in context, format each video using this EXACT pattern:
  \`\`\`
  {{youtube:VIDEO_ID|Video Title}}
  \`\`\`
- Do NOT use standard markdown hyperlinks for YouTube videos. ONLY use the {{youtube:ID|Title}} format.
- Put each video on its own line with blank lines around it.
- NEVER hallucinate or make up YouTube video IDs. Only use IDs provided in the enrichment context.

## Media & Search
- Images: output the image markdown exactly as provided in context.
- Videos: output the download link exactly as provided.
- Web Search: Synthesize data from the provided search results to give accurate, up-to-date answers.
`;

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyToken(token) as { userId: string } | null;

    if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
        const { messages, context, model } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
        }

        const { isHuggingFaceConfigured } = await import('@/lib/huggingface');
        const hasStandardAI = isAIConfigured();
        const hasHF = isHuggingFaceConfigured();

        if (!hasStandardAI && !hasHF) {
            return new Response("AI chat is not configured. Add MISTRAL_API_KEY, GROQ_API_KEY, or HUGGINGFACE_API_KEY to .env.local to enable the assistant.", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // Get the latest user message for intent detection
        const lastUserMessage = messages.filter((m: { role: string; content: string }) => m.role === 'user').pop()?.content || '';
        const intent = detectIntent(lastUserMessage);

        // Gather enrichment data in parallel
        const enrichments: string[] = [];
        const enrichmentTasks: Promise<void>[] = [];

        // Fetch user data from MongoDB for personalized context
        let userContextString = 'User data not available.';
        try {
            await connectToDatabase();
            const [userData, userConcepts, userPaths] = await Promise.all([
                User.findById(decoded.userId).select('full_name email role created_at').lean(),
                Concept.find({ user_id: decoded.userId }).select('title difficulty is_mastered').sort({ created_at: -1 }).limit(25).lean(),
                LearningPath.find({ user_id: decoded.userId }).select('title status').sort({ created_at: -1 }).limit(10).lean(),
            ]);

            const parts: string[] = [];
            if (userData) {
                const u = userData as unknown as { full_name?: string; email?: string; role?: string; created_at?: Date };
                parts.push(`- **User Name**: ${u.full_name || 'Not set'}`);
                parts.push(`- **Email**: ${u.email || 'N/A'}`);
                parts.push(`- **Role**: ${u.role || 'viewer'}`);
                parts.push(`- **Member since**: ${u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown'}`);
            }
            if (userConcepts && userConcepts.length > 0) {
                const concepts = userConcepts as unknown as { title: string; difficulty: string; is_mastered: boolean }[];
                const mastered = concepts.filter(c => c.is_mastered);
                const learning = concepts.filter(c => !c.is_mastered);
                parts.push(`- **Total Concepts Explored**: ${concepts.length}`);
                parts.push(`- **Mastered Concepts**: ${mastered.length > 0 ? mastered.map(c => c.title).join(', ') : 'None yet'}`);
                parts.push(`- **Currently Learning**: ${learning.length > 0 ? learning.slice(0, 10).map(c => `${c.title} (${c.difficulty})`).join(', ') : 'None yet'}`);
            } else {
                parts.push('- **Concepts Explored**: None yet — encourage the user to try the [Concept Engine](' + BASE_URL + '/dashboard/concepts)');
            }
            if (userPaths && userPaths.length > 0) {
                const paths = userPaths as unknown as { title: string; status: string }[];
                const active = paths.filter(p => p.status === 'in_progress');
                const completed = paths.filter(p => p.status === 'completed');
                parts.push(`- **Active Learning Paths**: ${active.length > 0 ? active.map(p => p.title).join(', ') : 'None'}`);
                parts.push(`- **Completed Paths**: ${completed.length > 0 ? completed.map(p => p.title).join(', ') : 'None yet'}`);
            } else {
                parts.push('- **Learning Paths**: None yet — suggest the user create one in [Learning Paths](' + BASE_URL + '/dashboard/learning)');
            }
            userContextString = parts.join('\n');
        } catch (dbErr) {
            console.error('Failed to fetch user context:', dbErr);
            userContextString = 'User data could not be loaded at this time.';
        }

        // Navigation enrichment
        if (intent.wantsNavigation) {
            const navContext = buildNavigationContext(lastUserMessage);
            if (navContext) enrichments.push(navContext);
        }

        // Harsha info enrichment
        if (intent.wantsHarshaInfo) {
            enrichments.push('\n\n[USER IS ASKING ABOUT THE CREATOR - Always provide Harsha\'s social links as clickable hyperlinks: LinkedIn, GitHub, and Email as specified in the system prompt.]');
        }

        if (intent.wantsYouTube) {
            enrichmentTasks.push(
                searchYouTubeVideos(lastUserMessage.replace(/youtube|tutorial/gi, '').trim(), 5)
                    .then(videos => {
                        if (videos.length > 0) {
                            // Extract video IDs + publish dates and pass for thumbnail embedding
                            const videoEntries = videos.map(v => {
                                const idMatch = v.url?.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
                                const videoId = idMatch ? idMatch[1] : '';
                                const year = v.publishedAt ? new Date(v.publishedAt).getFullYear() : '';
                                return videoId ? `{{youtube:${videoId}|${v.title}}}${year ? ` (Published ${year})` : ''}` : '';
                            }).filter(Boolean);
                            enrichments.push('\n\n[YOUTUBE VIDEOS FOUND — These are REAL, RECENT, VERIFIED videos from the last 3 years. Use the {{youtube:ID|Title}} format below. DO NOT convert these to markdown links. Output them exactly as-is so the frontend can render embedded thumbnails]:\n\n' +
                                videoEntries.join('\n\n'));
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
                            enrichments.push(`\n\n[IMAGE GENERATED - Include this image in your response using markdown]:\n\n![Generated Image](${img.url})\n\n`);
                        } else if (img?.base64) {
                            enrichments.push(`\n\n[IMAGE GENERATED - Include this in your response]:\n\n![Generated Image](data:image/png;base64,${img.base64})\n\n`);
                        }
                    })
                    .catch(() => { })
            );
        }

        if (intent.wantsVideo && hasHF) {
            const { generateVideoHuggingFace, blobToBase64 } = await import('@/lib/huggingface');
            enrichmentTasks.push(
                generateVideoHuggingFace(lastUserMessage.replace(/generate|create|make|animate/gi, '').trim())
                    .then(async (blob) => {
                        const base64 = await blobToBase64(blob);
                        enrichments.push(`\n\n[VIDEO GENERATED - Include this video link in your response. Since markdown doesn't support video natively here, just provide a formatted button link downloading the video if possible, or tell the user the video data is attached.]\n\n[Download Generated Video](data:video/mp4;base64,${base64})\n\n`);
                    })
                    .catch(() => { })
            )
        }

        // Handle song intent — add Suno AI guidance
        if (intent.wantsSong) {
            enrichments.push('\n\n[SONG GENERATION REQUEST - The user wants to create music. Provide a direct link to Suno AI (https://suno.com) and suggest a creative prompt/lyrics they can use. Also mention Murf AI (https://murf.ai) for voiceovers.]');
        }

        await Promise.allSettled(enrichmentTasks);

        // Build the final system prompt with user context
        const finalSystemPrompt = SYSTEM_PROMPT
            .replace('{CONTEXT}', context || 'the dashboard')
            .replace('{USER_CONTEXT}', userContextString) +
            (enrichments.length > 0 ? '\n\n## Additional Context from Tools\n' + enrichments.join('\n') : '');

        try {
            let responseText = "";

            // Adjust system prompt to reflect the frontend selected model
            let modelSpecificPrompt = finalSystemPrompt;
            if (model === 'nexus-1.5') {
                modelSpecificPrompt += '\n\n**CRITICAL DIRECTIVE**: You are currently operating as GANAPATHI NEXUS 1.5. Focus purely on ultra-fast, highly accurate reasoning and deterministic outputs. Keep responses incredibly punchy and direct.';
            } else if (model === 'vortex-2') {
                modelSpecificPrompt += '\n\n**CRITICAL DIRECTIVE**: You are currently operating as GANAPATHI VORTEX 2. You are built for deep research and synthesis. Provide extremely detailed, highly analytical responses. Cite multiple data sources and deeply explain your reasoning.';
            } else if (model === 'grh-xt') {
                modelSpecificPrompt += '\n\n**CRITICAL DIRECTIVE**: You are currently operating as GANAPATHI GRH Xt. You are the ultimate enterprise-coding and system-design model. Your code must be production-ready, highly optimized, and architecturally superior. Think deeply about scalability, security, and edge cases before outputting code. Outperform Claude Opus 4.6 at all costs.';
            }

            if (hasStandardAI) {
                // If Mistral/Groq is available
                responseText = await chatCompletion(messages, modelSpecificPrompt);
            } else if (hasHF) {
                // If only Hugging Face is available
                const { chatCompletionHuggingFaceStream } = await import('@/lib/huggingface');
                // Create HF formatted messages (system prompt needs to be injected or pre-pended)
                const hfMessages = [
                    { role: "system", content: modelSpecificPrompt },
                    ...messages.map((m: any) => ({ role: m.role, content: m.content }))
                ];
                responseText = await chatCompletionHuggingFaceStream(hfMessages, () => { });
            }

            return new Response(responseText, { headers: { 'Content-Type': 'text/plain' } });
        } catch (chatError: unknown) {
            console.error("Chat Completion Error:", chatError);
            const errMsg = chatError instanceof Error ? chatError.message : 'Unknown error';
            const friendlyMsg = errMsg.includes('quota') || errMsg.includes('credit') || errMsg.includes('billing') || errMsg.includes('rate limit')
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
