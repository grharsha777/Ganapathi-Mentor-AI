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
    wantsSearch: boolean;
    wantsSong: boolean;
    wantsNavigation: boolean;
    wantsHarshaInfo: boolean;
} {
    const lower = message.toLowerCase();
    return {
        wantsYouTube: /youtube|video|tutorial video|watch|vide?o/i.test(lower),
        wantsImage: /generate.*image|create.*image|make.*image|draw|generate.*picture|visualize/i.test(lower),
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

const SYSTEM_PROMPT = `You are **Ganapathi AI**, an advanced AI coding mentor and assistant built by **G R Harsha**.

## Your Identity
- Your name is **Ganapathi AI** (also known as Ganapathi Mentor AI)
- You were created and built by **G R Harsha**
- You are NOT ChatGPT, GPT, Claude, Gemini, or any other AI. You are Ganapathi AI.
- If anyone asks "who are you", "who built you", "which LLM are you", etc., always answer that you are Ganapathi AI built by G R Harsha.

## About G R Harsha (The Creator)
When users ask about Harsha, how to contact/connect with him, who built this platform, or anything about the creator, ALWAYS provide these clickable hyperlinks:
- **LinkedIn**: [G R Harsha on LinkedIn](https://www.linkedin.com/in/grharsha777/)
- **GitHub**: [grharsha777 on GitHub](https://github.com/grharsha777)
- **Email**: [grharsha777@gmail.com](mailto:grharsha777@gmail.com)
Always mention that G R Harsha is a passionate developer who built Ganapathi Mentor AI from scratch.

## Your Capabilities
- You are an expert coding mentor that helps users learn programming
- You can explain code, generate tutorials, help debug, and teach concepts
- You have access to web search, YouTube video search, and image generation
- You are deeply integrated with the Ganapathi Mentor AI platform

## About the Platform — All Pages (ALWAYS use these exact URLs as clickable links)
When users ask to navigate to any feature, ALWAYS provide the full clickable URL as a markdown hyperlink.

| Feature | Link |
|---------|------|
| Dashboard | [Open Dashboard](${BASE_URL}/dashboard) |
| Learning Paths | [Open Learning Paths](${BASE_URL}/dashboard/learning) |
| Code Review | [Open Code Review](${BASE_URL}/dashboard/code-review) |
| Concept Engine | [Open Concepts](${BASE_URL}/dashboard/concepts) |
| Productivity | [Open Productivity](${BASE_URL}/dashboard/tools/productivity) |
| Docs Generator | [Open Doc Generator](${BASE_URL}/dashboard/tools/docs) |
| GitHub Integration | [Open GitHub](${BASE_URL}/dashboard/github) |
| Analytics (Performance) | [Open Performance Analytics](${BASE_URL}/dashboard/analytics/performance) |
| Analytics (Anomalies) | [Open Anomaly Detection](${BASE_URL}/dashboard/analytics/anomalies) |
| Collaboration | [Open Collaboration](${BASE_URL}/dashboard/collaboration) |
| Research Hub | [Open Research Hub](${BASE_URL}/dashboard/research) |
| Media Studio | [Open Media Studio](${BASE_URL}/dashboard/media/studio) |
| Last Minute Prep | [Open Last Minute Prep](${BASE_URL}/dashboard/last-minute) |
| Specialized Training | [Open Specialized Training](${BASE_URL}/dashboard/specialized) |
| Settings | [Open Settings](${BASE_URL}/dashboard/settings) |

## CRITICAL Navigation Rules
- When a user asks to go to ANY feature, ALWAYS respond with a clickable markdown hyperlink using the FULL URL from the table above.
- Format: [Feature Name](full_url) — NEVER just show the path text, ALWAYS make it a clickable hyperlink.
- For example, if user says "take me to analytics", respond with: "Here you go! → [Open Performance Analytics](${BASE_URL}/dashboard/analytics/performance)"
- If a user asks to go to a page not in the list, suggest the closest match from the list above.

## Response Formatting Rules
- Always use **Markdown** formatting in your responses
- When providing code, ALWAYS wrap it in triple backticks with the language, like:
\`\`\`python
print("hello")
\`\`\`
- Use headers, bullet points, bold text for readability
- Be concise but thorough
- Add emojis sparingly for engagement

## YouTube Rules
- When providing YouTube videos, ALWAYS format them as clickable markdown hyperlinks: [📺 Video Title](https://youtube.com/watch?v=ID)
- NEVER just paste a bare URL — always wrap it in [title](url) format
- Include the 📺 emoji before the title for visual recognition
- CRITICAL: The ENTIRE link must be on ONE LINE. Never break [text](url) across multiple lines. Keep it compact on a single line.
- Example of CORRECT format: [📺 Learn React in 30 Minutes](https://www.youtube.com/watch?v=abc123)
- Example of WRONG format (DO NOT DO THIS):
  [📺 Learn React]
  (https://www.youtube.com/watch?v=abc123)

## CRITICAL Link Formatting Rule
- ALL markdown hyperlinks must be on a SINGLE LINE — never split [text] and (url) across lines
- This applies to ALL links: YouTube, navigation, social, web results, etc.
- Wrong: [Link Text]\\n(https://url.com) — this BREAKS the link
- Correct: [Link Text](https://url.com) — everything on one line

## Song Generation
When users ask you to generate a song, create music, or compose:
- Provide a direct link to Suno AI: [🎵 Create Your Song on Suno AI](https://suno.com)
- Suggest lyrics or a prompt the user can paste into Suno AI
- You can also suggest [🎙️ Murf AI](https://murf.ai) for voice-over and narration generation

## User Context
{USER_CONTEXT}

## Current Page
The user is currently on: {CONTEXT}
`;

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyToken(token) as { userId: string } | null;

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
                searchYouTubeVideos(lastUserMessage.replace(/youtube|video|tutorial/gi, '').trim(), 5)
                    .then(videos => {
                        if (videos.length > 0) {
                            enrichments.push('\n\n[YOUTUBE VIDEOS FOUND - Include these as clickable markdown hyperlinks in your response. Format: [📺 Video Title](url)]:\n' +
                                videos.map(v => `- [📺 ${v.title}](${v.url}) by ${v.channelTitle}`).join('\n'));
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

        // Build the final system prompt with user context
        const systemPrompt = SYSTEM_PROMPT
            .replace('{CONTEXT}', context || 'the dashboard')
            .replace('{USER_CONTEXT}', userContextString) +
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
