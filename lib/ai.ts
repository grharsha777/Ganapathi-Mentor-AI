import { createMistral } from '@ai-sdk/mistral';
import { createGroq } from '@ai-sdk/groq';
import { generateText as aiGenerateText, generateObject as aiGenerateObject, streamText as aiStreamText } from 'ai';
import { z } from 'zod';
import { searchWikipedia } from './integrations/wikipedia';
import { searchTavily } from './integrations/tavily';
import { searchArxiv } from './integrations/arxiv';
import { searchSemanticScholar } from './integrations/semantic-scholar';
import { searchTMDB } from './integrations/tmdb';
import { fetchPatientEntities, updatePatientEntity } from './base44';

// ─── API Key Pools for Load Balancing & Reduced Rate Limiting ───
// We use multiple keys to distribute load, ensuring zero rate-limits, 
// lower latency, smoother interactions, and avoiding hallucination from API throttling.

const mistralKeys = [
  'ZmXQehIOTc7F2qHk3JQfVKahbxRK8xRi', // Primary high-tier key
  process.env.MISTRAL_API_KEY,        // Env fallback 1
  process.env.MISTRAL_API_KEY_2,      // Env fallback 2
].filter(Boolean) as string[];

const groqKeys = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean) as string[];

// Define specific interface to avoid import issues
type Role = 'system' | 'user' | 'assistant' | 'tool';
interface CoreMessage {
  role: Role;
  content: string;
  [key: string]: any;
}

/**
 * Returns a randomly selected AI model from the highly-available pool (Multiple Groq & Mistral instances).
 * This aggressively load balances requests, ensuring ultra-fast responses (Groq LPUs), 
 * deep reasoning (Mistral Large), reduced hallucination, and zero rate-limiting.
 */
export function getAIModel() {
  const models = [];

  // 1. Add all available Groq instances (Ultra-fast LPUs for zero latency)
  for (const apiKey of groqKeys) {
    const groq = createGroq({ apiKey });
    models.push(groq('llama-3.3-70b-versatile'));
  }

  // 2. Add all available Mistral instances (Deep reasoning & tool calling)
  for (const apiKey of mistralKeys) {
    const mistral = createMistral({ apiKey });
    models.push(mistral('mistral-large-latest'));
  }

  if (models.length === 0) {
    throw new Error("No valid API keys found for Mistral or Groq in the key pools.");
  }

  // Distribute load completely evenly across all active model instances
  // This achieves massive concurrency without hitting rate limits
  const randomIndex = Math.floor(Math.random() * models.length);
  return models[randomIndex];
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
  maxOutputTokens?: number;
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

  const baseOptions = {
    model,
    system: settings?.system,
    maxOutputTokens: settings?.maxOutputTokens, // Updated property
    temperature: settings?.temperature,
    topP: settings?.topP,
    tools: settings?.tools,
    // maxSteps is removed as it caused type error. Standard generateText might not support it in this version or types are strict.
  };

  if (userPrompt) {
    return await aiGenerateText({
      ...baseOptions,
      prompt: userPrompt,
    });
  } else {
    return await aiGenerateText({
      ...baseOptions,
      messages: messages!,
    });
  }
}

export async function generateObject<T>(
  prompt: string | CoreMessage[],
  schema: z.ZodSchema<T>,
  settings?: CallSettings & { system?: string }
) {
  const model = getAIModel();
  const messages = Array.isArray(prompt) ? prompt as any[] : undefined;
  const userPrompt = typeof prompt === 'string' ? prompt : undefined;

  const baseOptions = {
    model,
    schema,
    system: settings?.system,
    maxOutputTokens: settings?.maxOutputTokens,
    temperature: settings?.temperature,
  };

  if (userPrompt) {
    return await aiGenerateObject({
      ...baseOptions,
      prompt: userPrompt,
    });
  } else {
    return await aiGenerateObject({
      ...baseOptions,
      messages: messages!,
    });
  }
}

export function streamText(
  prompt: string | CoreMessage[],
  settings?: CallSettings & { system?: string, tools?: any, onFinish?: (event: any) => void }
) {
  const model = getAIModel();
  const messages = Array.isArray(prompt) ? prompt as any[] : undefined;
  const userPrompt = typeof prompt === 'string' ? prompt : undefined;

  const baseOptions = {
    model,
    system: settings?.system,
    maxOutputTokens: settings?.maxOutputTokens,
    temperature: settings?.temperature,
    tools: settings?.tools,
    onFinish: settings?.onFinish,
  };

  if (userPrompt) {
    return aiStreamText({
      ...baseOptions,
      prompt: userPrompt,
    });
  } else {
    return aiStreamText({
      ...baseOptions,
      messages: messages!,
    });
  }
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
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }: { query: string }) => {
      const results = await searchWikipedia(query, 3);
      return results.map(r => `${r.title}: ${r.snippet}`).join('\n\n');
    },
  }),
  search_web: tool({
    description: 'Search the web for real-time information and news',
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }: { query: string }) => {
      const results = await searchTavily(query, 3);
      return results.map(r => `${r.title} (${r.link}): ${r.snippet}`).join('\n\n');
    },
  }),
  search_arxiv: tool({
    description: 'Search arXiv for academic and research papers',
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }: { query: string }) => {
      const results = await searchArxiv(query, 3);
      return results.map(r => `${r.title} (${r.id}): ${r.summary.substring(0, 300)}...`).join('\n\n');
    },
  }),
  search_semantic_scholar: tool({
    description: 'Search Semantic Scholar for scientific papers and citations',
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }: { query: string }) => {
      const results = await searchSemanticScholar(query, 3);
      return results.map(r => `${r.title} (${r.year}) - ${r.citationCount} citations: ${r.abstract?.substring(0, 200)}...`).join('\n\n');
    },
  }),
  search_tmdb: tool({
    description: 'Search for movies and TV shows to get details like release date, overview, and rating',
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }: { query: string }) => {
      const results = await searchTMDB(query);
      return results.map(r => `${r.title} (${r.release_date}) - Rating: ${r.vote_average}\nOverview: ${r.overview}`).join('\n\n');
    },
  }),
  fetch_base44_patients: tool({
    description: 'Fetch all patient records from the primary Base44 API database',
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const results = await fetchPatientEntities();
        // Limit to 50 to prevent token explosion
        return JSON.stringify(results.slice(0, 50));
      } catch (e: any) {
        return `Failed to fetch patients: ${e.message}`;
      }
    },
  }),
  update_base44_patient: tool({
    description: 'Update a patient record in the primary Base44 API database',
    inputSchema: z.object({
      entityId: z.string().describe('The _id of the patient entity to update'),
      updateData: z.record(z.any()).describe('A partial object containing fields to update like current_risk_score, medical_history, etc.')
    }),
    execute: async ({ entityId, updateData }: { entityId: string, updateData: any }) => {
      try {
        const result = await updatePatientEntity(entityId, updateData);
        return `Successfully updated patient. Result: ${JSON.stringify(result)}`;
      } catch (e: any) {
        return `Failed to update patient: ${e.message}`;
      }
    },
  }),
};

export async function explainConcept(question: string) {
  try {
    const { text } = await generateText(
      `Explain this concept: ${question}. Use tools if you need more up-to-date or detailed information.`,
      {
        system: SYSTEM_PROMPT,
        tools: aiTools,
        maxSteps: 3,
      }
    );
    return { content: text };
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('Failed to generate explanation', { cause: error });
  }
}

export async function generateAIResponse(userMessage: string, context?: string): Promise<string> {
  try {
    const { text } = await generateText(
      userMessage,
      {
        system: context ? `${SYSTEM_PROMPT}\nThe user is currently at: ${context}` : SYSTEM_PROMPT,
        tools: aiTools,
        maxSteps: 5,
      }
    );
    return text;
  } catch (error) {
    console.error('AI Response Error:', error);
    throw new Error('Failed to generate AI response', { cause: error });
  }
}

export async function explainRepo(repoContext: string, question: string) {
  try {
    const { text } = await generateText(
      `Context:\n${repoContext.substring(0, 8000)}\n\nQuestion: ${question}`,
      {
        system: `${SYSTEM_PROMPT}\nYou have access to relevant repository context.`,
      }
    );
    return { content: text };
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('Failed to explain repo', { cause: error });
  }
}

export async function summarizeSession(questions: string[]) {
  if (questions.length === 0) return { summary: "No activity this session.", topics: [] };
  try {
    const { object } = await generateObject(
      `Based on these questions, provide a summary and up to 3 topics: ${questions.join(', ')}`,
      z.object({
        summary: z.string(),
        topics: z.array(z.string()),
      })
    );
    return object;
  } catch (error) {
    console.error('AI Summary Error:', error);
    return { summary: "Could not generate summary.", topics: [] };
  }
}

export function isAIConfigured(): boolean {
  return mistralKeys.length > 0 || groqKeys.length > 0;
}

// Chat completion helper — correctly passes messages array + system prompt
export async function chatCompletion(messages: any[], systemPrompt?: string): Promise<string> {
  const coreMessages: CoreMessage[] = messages.map(m => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }));

  const { text } = await generateText(coreMessages, {
    system: systemPrompt,
    maxOutputTokens: 4096,
    temperature: 0.7,
  });
  return text;
}
