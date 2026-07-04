import { z } from 'zod';

import { generateObject } from '@/lib/ai';

import type { QueryIntelligence, ResearchMode } from '@/lib/research/schemas';
import type { ResearchPlan } from '@/lib/research/orchestration/types';

const researchPlanSchema = z.object({
  objective: z.string(),
  strategy: z.array(z.string()).min(2).max(6),
  prioritized_sub_questions: z.array(z.string()).min(2).max(6),
  required_provider_types: z.array(z.enum(['web', 'news', 'academic', 'code'])).min(1).max(4),
  risk_flags: z.array(z.string()).max(5),
});

function fallbackPlan(query: string, intelligence: QueryIntelligence, mode: ResearchMode): ResearchPlan {
  const modeProviders: Record<ResearchMode, ResearchPlan['required_provider_types']> = {
    quick: ['web'],
    deep: ['web', 'academic', 'news', 'code'],
    comparative: ['web', 'academic', 'code'],
    academic: ['academic', 'web'],
    news: ['news', 'web'],
    publication_labs: ['academic', 'web', 'code'],
  };

  const subQuestions = intelligence.decomposed_questions.length
    ? intelligence.decomposed_questions.slice(0, 4)
    : [
        `What are the most credible sources answering: ${query}?`,
        `What evidence supports or weakens mainstream claims about: ${query}?`,
      ];

  return {
    objective: `Produce a source-grounded answer for: ${query}`,
    strategy: [
      'Retrieve coverage from selected provider categories.',
      'Rank sources by reliability, recency, and relevance.',
      'Synthesize only citation-backed claims and surface uncertainty.',
    ],
    prioritized_sub_questions: subQuestions,
    required_provider_types: modeProviders[mode],
    risk_flags: intelligence.timeframes.length ? [] : ['No explicit timeframe; recency may be ambiguous.'],
  };
}

export async function buildResearchPlan(
  query: string,
  intelligence: QueryIntelligence,
  mode: ResearchMode,
): Promise<ResearchPlan> {
  try {
    const { object } = await generateObject(
      [
        {
          role: 'user',
          content: JSON.stringify({ query, mode, intelligence }),
        },
      ],
      researchPlanSchema,
      {
        system: 'You are a planning agent for an AI research workspace. Produce an execution plan for retrieval, verification, and synthesis. Keep it concise and practical.',
        temperature: 0.1,
        maxOutputTokens: 700,
      },
    );

    return object;
  } catch {
    return fallbackPlan(query, intelligence, mode);
  }
}
