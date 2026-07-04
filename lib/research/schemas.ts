import { z } from 'zod';

export const researchSourceSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  url: z.string().url(),
  snippet: z.string(),
  reliability: z.number().min(0).max(100),
  published_date: z.string().optional().default('Unknown'),
  domain: z.string().optional().default('unknown'),
  provider: z.string().optional().default('Unknown provider'),
  provider_type: z.enum(['web', 'academic', 'news', 'code', 'mock']).optional().default('web'),
  evidence_type: z.enum(['primary', 'secondary', 'commentary']).optional().default('secondary'),
});

export const answerSectionSchema = z.object({
  heading: z.string(),
  content: z.string(),
  key_points: z.array(z.string()),
  evidence_strength: z.enum(['strong', 'moderate', 'weak']),
  citations: z.array(z.number().int().positive()).default([]),
});

export const keyClaimSchema = z.object({
  claim: z.string(),
  verdict: z.enum(['supported', 'mixed', 'insufficient']).default('supported'),
  citations: z.array(z.number().int().positive()).default([]),
  rationale: z.string(),
});

export const bibliographyEntrySchema = z.object({
  source_id: z.number().int().positive(),
  citation: z.string(),
});

export const publicationSchema = z.object({
  title: z.string().default('Research Brief'),
  abstract: z.string().default(''),
  executive_brief: z.string().default(''),
  methodology: z.array(z.string()).default([]),
  key_takeaways: z.array(z.string()).default([]),
  next_actions: z.array(z.string()).default([]),
});

export const researchAttachmentSchema = z.object({
  name: z.string().max(180),
  type: z.string().max(120).default('application/octet-stream'),
  size: z.number().int().nonnegative().max(10 * 1024 * 1024),
  text: z.string().max(24000),
});

export const visualAssetSchema = z.object({
  id: z.string(),
  description: z.string(),
  alt: z.string(),
  url: z.string().url(),
  credit: z.string(),
  creditUrl: z.string().url().optional(),
});
export const structuredResearchSchema = z.object({
  tldr: z.string(),
  confidence: z.number().min(0).max(100),
  query_focus: z.string().default(''),
  methodology_summary: z.string().default(''),
  answer_sections: z.array(answerSectionSchema),
  key_claims: z.array(keyClaimSchema).default([]),
  data_points: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      context: z.string(),
    }),
  ),
  follow_up_questions: z.array(z.string()).length(3),
  confidence_breakdown: z.object({
    factual: z.number().min(0).max(100),
    recency: z.number().min(0).max(100),
    source_quality: z.number().min(0).max(100),
  }),
  research_gaps: z.array(z.string()),
  counter_arguments: z.array(z.string()).default([]),
  timeline: z.array(z.object({
    date: z.string(),
    event: z.string(),
    citation: z.number().int().positive().optional(),
  })).default([]),
  bibliography: z.array(bibliographyEntrySchema).default([]),
  visual_assets: z.array(visualAssetSchema).default([]),
  publication: publicationSchema.default({
    title: 'Research Brief',
    abstract: '',
    executive_brief: '',
    methodology: [],
    key_takeaways: [],
    next_actions: [],
  }),
  sources: z.array(researchSourceSchema),
});

export const researchModeSchema = z.enum([
  'quick',
  'deep',
  'comparative',
  'academic',
  'news',
  'publication_labs',
]);

export const queryIntentSchema = z.enum([
  'factual',
  'analytical',
  'comparative',
  'exploratory',
  'creative',
]);

export const queryIntelligenceSchema = z.object({
  intent: queryIntentSchema,
  decomposed_questions: z.array(z.string()),
  entities: z.array(z.string()),
  timeframes: z.array(z.string()),
  related_queries: z.array(z.string()),
  language: z.string(),
});

export const researchRequestSchema = z.object({
  query: z.string().trim().min(2).max(600),
  mode: researchModeSchema.default('deep'),
  safeSearch: z.boolean().default(true),
  includeDomains: z.array(z.string()).default([]),
  excludeDomains: z.array(z.string()).default([]),
  dateRange: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  attachments: z.array(researchAttachmentSchema).max(8).default([]),
  publicationSections: z.array(z.string().min(2).max(40)).max(12).default([]),
});

export type StructuredResearchResponse = z.infer<typeof structuredResearchSchema>;
export type QueryIntelligence = z.infer<typeof queryIntelligenceSchema>;
export type ResearchMode = z.infer<typeof researchModeSchema>;
export type QueryIntent = z.infer<typeof queryIntentSchema>;
export type ResearchRequest = z.infer<typeof researchRequestSchema>;



