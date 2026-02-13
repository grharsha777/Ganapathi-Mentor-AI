import { createMistral } from '@ai-sdk/mistral';
import { createGroq } from '@ai-sdk/groq';
import { generateText as aiGenerateText, generateObject as aiGenerateObject, streamText as aiStreamText } from 'ai';
import { z } from 'zod';
import { searchWikipedia } from './integrations/wikipedia';
import { searchTavily } from './integrations/tavily';
import { searchArxiv } from './integrations/arxiv';
import { searchSemanticScholar } from './integrations/semantic-scholar';
import { searchTMDB } from './integrations/tmdb';

// Environment Variables
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Define specific interface to avoid import issues
type Role = 'system' | 'user' | 'assistant' | 'tool';
interface CoreMessage {
  role: Role;
  content: string;
  [key: string]: any;
}

/**
 * Returns the best available AI model instance.
 * Priority: MISTRAL -> GROQ
 */
export function getAIModel() {
  // 1. Mistral AI (Primary)
  if (MISTRAL_API_KEY) {
    const mistral = createMistral({ apiKey: MISTRAL_API_KEY });
    return mistral('mistral-large-latest');
  }

  // 2. Groq (Secondary / Fast Inference)
  if (GROQ_API_KEY) {
    const groq = createGroq({ apiKey: GROQ_API_KEY });
    return groq('llama-3.3-70b-versatile');
  }

  throw new Error("No valid API keys found for Mistral or Groq. Please configure MISTRAL_API_KEY or GROQ_API_KEY in .env.local");
}

/**
 * Returns model if any LLM key is configured, otherwise null.
 */
export function getAIModelOrNull() {
  try {
    return getAIModel();
  } catch {
    return null;
  }
}

// Configuration Types
export interface CallSettings {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

// ------------------------------------------------------------------
// Wrapper Functions (Standardize AI Access)
// ------------------------------------------------------------------

export async function generateText(
  prompt: string | CoreMessage[],
  settings?: CallSettings & { system?: string, tools?: any, maxSteps?: number }
) {
  const model = getAIModel();
  const messages = Array.isArray(prompt) ? prompt as any[] : undefined;
  const userPrompt = typeof prompt === 'string' ? prompt : undefined;

  return await aiGenerateText({
    model,
    messages,
    prompt: userPrompt,
    system: settings?.system,
    maxTokens: settings?.maxTokens,
    temperature: settings?.temperature,
    topP: settings?.topP,
    tools: settings?.tools,
    maxSteps: settings?.maxSteps,
  });
}

export async function generateObject<T>(
  prompt: string | CoreMessage[],
  schema: z.ZodSchema<T>,
  settings?: CallSettings & { system?: string }
) {
  const model = getAIModel();
  const messages = Array.isArray(prompt) ? prompt as any[] : undefined;
  const userPrompt = typeof prompt === 'string' ? prompt : undefined;

  return await aiGenerateObject({
    model,
    messages,
    prompt: userPrompt,
    schema,
    system: settings?.system,
    maxTokens: settings?.maxTokens,
    temperature: settings?.temperature,
  });
}

export function streamText(
  prompt: string | CoreMessage[],
  settings?: CallSettings & { system?: string, tools?: any, onFinish?: (event: any) => void }
) {
  const model = getAIModel();
  const messages = Array.isArray(prompt) ? prompt as any[] : undefined;
  const userPrompt = typeof prompt === 'string' ? prompt : undefined;

  return aiStreamText({
    model,
    messages,
    prompt: userPrompt,
    system: settings?.system,
    maxTokens: settings?.maxTokens,
    temperature: settings?.temperature,
    tools: settings?.tools,
    onFinish: settings?.onFinish,
  });
}


const SYSTEM_PROMPT = `
You are Ganapathi Mentor AI, an expert AI Copilot for a tech learning platform.
Your goal is to help developers learn faster, understand code, and build better software.
Tone: Concise, friendly, encouraging, and technically accurate.
Format your responses in Markdown.
If the user asks for code, provide it in a code block with the language specified.
`;

// ... (Tools definitions can remain, or we can import 'tool' from ai if needed)
// To stay safe on imports, let's redefine tool helper or import it.
// Attempting to import 'tool' from 'ai'
import { tool } from 'ai';

export const aiTools = {
  search_wikipedia: tool({
    description: 'Search Wikipedia for information on a topic',
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => {
      const results = await searchWikipedia(query, 3);
      return results.map(r => `${r.title}: ${r.snippet}`).join('\n\n');
    },
  }),
  search_web: tool({
    description: 'Search the web for real-time information and news',
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => {
      const results = await searchTavily(query, 3);
      return results.map(r => `${r.title} (${r.link}): ${r.snippet}`).join('\n\n');
    },
  }),
  search_arxiv: tool({
    description: 'Search arXiv for academic and research papers',
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => {
      const results = await searchArxiv(query, 3);
      return results.map(r => `${r.title} (${r.id}): ${r.summary.substring(0, 300)}...`).join('\n\n');
    },
  }),
  search_semantic_scholar: tool({
    description: 'Search Semantic Scholar for scientific papers and citations',
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => {
      const results = await searchSemanticScholar(query, 3);
      return results.map(r => `${r.title} (${r.year}) - ${r.citationCount} citations: ${r.abstract?.substring(0, 200)}...`).join('\n\n');
    },
  }),
  search_tmdb: tool({
    description: 'Search for movies and TV shows to get details like release date, overview, and rating',
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => {
      const results = await searchTMDB(query);
      return results.map(r => `${r.title} (${r.release_date}) - Rating: ${r.vote_average}\nOverview: ${r.overview}`).join('\n\n');
    },
  }),
};

export async function explainConcept(question: string) {
  try {
    const { text } = await generateText({
      system: SYSTEM_PROMPT,
      prompt: `Explain this concept: ${question}. Use tools if you need more up-to-date or detailed information.`,
      tools: aiTools,
      maxSteps: 3,
    });
    return { content: text };
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('Failed to generate explanation');
  }
}

export async function generateAIResponse(userMessage: string, context?: string): Promise<string> {
  try {
    const { text } = await generateText({
      system: context ? `${SYSTEM_PROMPT}\nThe user is currently at: ${context}` : SYSTEM_PROMPT,
      prompt: userMessage,
      tools: aiTools,
      maxSteps: 5,
    });
    return text;
  } catch (error) {
    console.error('AI Response Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function explainRepo(repoContext: string, question: string) {
  try {
    const { text } = await generateText({
      system: `${SYSTEM_PROMPT}\nYou have access to relevant repository context.`,
      prompt: `Context:\n${repoContext.substring(0, 8000)}\n\nQuestion: ${question}`,
    });
    return { content: text };
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('Failed to explain repo');
  }
}

export async function summarizeSession(questions: string[]) {
  if (questions.length === 0) return { summary: "No activity this session.", topics: [] };
  try {
    const { object } = await generateObject({
      schema: z.object({
        summary: z.string(),
        topics: z.array(z.string()),
      }),
      prompt: `Based on these questions, provide a summary and up to 3 topics: ${questions.join(', ')}`,
    });
    return object;
  } catch (error) {
    console.error('AI Summary Error:', error);
    return { summary: "Could not generate summary.", topics: [] };
  }
}

export function isAIConfigured(): boolean {
  return !!(MISTRAL_API_KEY || GROQ_API_KEY);
}

// Chat completion helper — correctly passes messages array + system prompt
export async function chatCompletion(messages: any[], systemPrompt?: string): Promise<string> {
  const coreMessages: CoreMessage[] = messages.map(m => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }));

  const { text } = await generateText(coreMessages, {
    system: systemPrompt,
    maxTokens: 4096,
    temperature: 0.7,
  });
  return text;
}
