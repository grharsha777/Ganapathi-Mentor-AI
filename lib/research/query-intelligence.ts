import { generateObject } from '@/lib/ai';
import { queryIntelligenceSchema } from '@/lib/research/schemas';

import type { QueryIntelligence } from '@/lib/research/schemas';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'in', 'on', 'to', 'vs', 'what', 'how', 'is', 'are',
]);

function detectLanguage(query: string): string {
  const nonAsciiCount = query.split('').filter((char) => char.charCodeAt(0) > 127).length;
  if (nonAsciiCount > 0) {
    return 'multilingual';
  }
  return 'en';
}

function classifyIntent(query: string): QueryIntelligence['intent'] {
  const normalized = query.toLowerCase();
  if (/(compare|vs\.?|versus|difference between)/.test(normalized)) return 'comparative';
  if (/(why|impact|analyze|tradeoffs|pros and cons)/.test(normalized)) return 'analytical';
  if (/(brainstorm|creative|ideas|design concept)/.test(normalized)) return 'creative';
  if (/(overview|explore|learn|guide)/.test(normalized)) return 'exploratory';
  return 'factual';
}

function decomposeQuery(query: string): string[] {
  const splitters = /\?|\band\b|\bthen\b|\bplus\b|,/gi;
  const chunks = query
    .split(splitters)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (chunks.length <= 1) {
    return [query.trim()];
  }

  return chunks.slice(0, 5);
}

function extractEntities(query: string): string[] {
  const words = query
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter(Boolean);

  const candidates = words.filter((word) => {
    const normalized = word.toLowerCase();
    return !STOP_WORDS.has(normalized) && word.length > 2;
  });

  const distinct = Array.from(new Set(candidates));
  return distinct.slice(0, 8);
}

function extractTimeframes(query: string): string[] {
  const matches = query.match(/\b(\d{4}|today|yesterday|last\s+\d+\s+days|last\s+week|last\s+month|\d{1,2}\/\d{1,2}\/\d{2,4})\b/gi);
  if (!matches) {
    return [];
  }

  return Array.from(new Set(matches));
}

function localSuggestions(query: string): string[] {
  const normalized = query.trim();
  if (!normalized) {
    return [];
  }

  return [
    `${normalized} latest developments`,
    `${normalized} enterprise applications`,
    `${normalized} risks and limitations`,
    `Compare ${normalized} with alternatives`,
  ].slice(0, 4);
}

export async function analyzeQueryIntelligence(query: string): Promise<QueryIntelligence> {
  const base: QueryIntelligence = {
    intent: classifyIntent(query),
    decomposed_questions: decomposeQuery(query),
    entities: extractEntities(query),
    timeframes: extractTimeframes(query),
    related_queries: localSuggestions(query),
    language: detectLanguage(query),
  };

  try {
    const { object } = await generateObject(
      `Analyze this research query and produce structured intelligence. Query: ${query}`,
      queryIntelligenceSchema,
      {
        system:
          'You are a query planner for an enterprise research engine. Return concise and accurate decomposition, intent, entities, and related queries.',
        temperature: 0.1,
        maxOutputTokens: 700,
      },
    );

    return object;
  } catch {
    return base;
  }
}

export function buildRealtimeSuggestions(input: string): string[] {
  return localSuggestions(input);
}
