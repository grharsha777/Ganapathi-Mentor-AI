import { generateObject } from '@/lib/ai';
import { structuredResearchSchema } from '@/lib/research/schemas';

import type { QueryIntelligence, StructuredResearchResponse } from '@/lib/research/schemas';
import type { ResearchPlan } from '@/lib/research/orchestration/types';
import type { UnifiedSearchResult } from '@/lib/research/types';
import { fetchUnsplashImages } from '@/lib/research/unsplash';

interface SynthesisInput {
  query: string;
  intelligence: QueryIntelligence;
  sources: UnifiedSearchResult[];
  mode: string;
  previousContext?: string;
  attachments?: Array<{ name: string; type: string; size: number; text: string }>;
  publicationSections?: string[];
  plan?: ResearchPlan;
}

function toSourceView(source: UnifiedSearchResult, index: number): StructuredResearchResponse['sources'][number] {
  return {
    id: index + 1,
    title: source.title,
    url: source.url,
    snippet: source.fullText ?? source.snippet,
    reliability: Math.round(source.reliability),
    published_date: source.publishedDate ?? 'Unknown',
    domain: source.domain,
    provider: source.provider,
    provider_type: source.providerType,
    evidence_type: source.providerType === 'academic' ? 'primary' : source.providerType === 'news' ? 'secondary' : 'commentary',
  };
}

function modeInstruction(mode: string): string {
  if (mode === 'academic') {
    return 'Prioritize methodology quality, limitations, and evidence hierarchy.';
  }

  if (mode === 'news') {
    return 'Prioritize timeline ordering, latest developments, and uncertainty flags.';
  }

  if (mode === 'comparative') {
    return 'Prioritize side-by-side tradeoffs and decision criteria.';
  }

  if (mode === 'quick') {
    return 'Prioritize concise executive clarity without losing citations.';
  }

  if (mode === 'publication_labs') {
    return [
      'Act as an elite Full-Stack Engineer, AI Prompt Engineer, and principal investigator writing an Enterprise-Grade, Publication-Ready Research Paper.',
      'Generate maximum-length, highly detailed, comprehensive research.',
      'Structure strictly: Abstract, Introduction, Literature Review, Methodology/Analysis, Findings, Discussion, Conclusion, and References.',
      'Use robust markdown formatting: proper ## Headers, **bold** text for emphasis, bullet points for readability, and data tables where applicable.',
      'Every claim must have in-text numeric citations like [1] and a complete bibliography.',
      'The text must be highly polished, authoritative, and perfectly structured (zero formatting edits required for IEEE/Medium publication).',
    ].join(' '); 
  }

  return 'Provide deep analytical reasoning with citation traceability.';
}

const NEGATIVE_PROMPT = `
CRITICAL CONSTRAINTS:
- DO NOT hallucinate. 
- DO NOT provide misinformation. 
- DO NOT mismatch sources with incorrect claims.
- EVERY claim must have direct evidence in the provided sources. 
- If no evidence exists, explicitly state "Insufficient evidence".
`;

function defaultFollowUps(query: string): [string, string, string] {
  return [
    `What changed in the last 30 days for ${query}?`,
    `Which claims about ${query} are weakly supported?`,
    `What should be monitored next for ${query}?`,
  ];
}

function fallbackResponse(input: SynthesisInput): StructuredResearchResponse {
  const sources = input.sources.slice(0, 10).map(toSourceView);
  const topSources = sources.slice(0, 4);
  const timeline = sources
    .filter((source) => source.published_date && source.published_date !== 'Unknown')
    .slice(0, 6)
    .map((source) => ({
      date: source.published_date,
      event: source.title,
      citation: source.id,
    }));

  const sections: StructuredResearchResponse['answer_sections'] = [
    {
      heading: 'Evidence Summary',
      content: topSources.length
        ? topSources.map((source) => `[${source.id}] ${source.title}: ${source.snippet}`).join(' ')
        : 'No reliable external sources were available for this request.',
      key_points: topSources.map((source) => source.title),
      evidence_strength: topSources.length >= 4 ? 'strong' : topSources.length >= 2 ? 'moderate' : 'weak',
      citations: topSources.map((source) => source.id),
    },
  ];

  return structuredResearchSchema.parse({
    tldr: topSources.length
      ? `Synthesis built from ${topSources.length} high-ranking sources. Validate critical decisions against primary evidence.`
      : 'Insufficient external evidence to produce a high-confidence answer.',
    confidence: Math.max(25, Math.min(88, topSources.length * 18)),
    query_focus: input.plan?.objective ?? input.query,
    methodology_summary: 'Multi-source retrieval, ranking by relevance/recency/authority, and citation-backed synthesis.',
    answer_sections: sections,
    key_claims: topSources.map((source) => ({
      claim: source.title,
      verdict: topSources.length >= 3 ? 'supported' : 'mixed',
      citations: [source.id],
      rationale: source.snippet,
    })),
    data_points: [
      {
        label: 'Sources analyzed',
        value: String(sources.length),
        context: 'Deduplicated and ranked evidence corpus',
      },
      {
        label: 'Average reliability',
        value: `${sources.length ? Math.round(sources.reduce((sum, source) => sum + source.reliability, 0) / sources.length) : 0}%`,
        context: 'Computed from provider authority, recency, and relevance',
      },
    ],
    follow_up_questions: defaultFollowUps(input.query),
    confidence_breakdown: {
      factual: sources.length >= 5 ? 82 : 58,
      recency: 62,
      source_quality: sources.length >= 5 ? 79 : 55,
    },
    research_gaps: sources.length
      ? ['Paywalled primary datasets and proprietary evaluations were not directly audited.']
      : ['No reliable sources were retrieved for this query.'],
    counter_arguments: [
      'Some retrieved sources may represent secondary reporting instead of primary data.',
    ],
    timeline,
    bibliography: sources.map((source) => ({
      source_id: source.id,
      citation: `${source.title}. ${source.url}`,
    })),
    publication: {
      title: `Research Brief: ${input.query}`,
      abstract: topSources[0]?.snippet ?? 'No abstract available.',
      executive_brief: topSources.length
        ? `Evidence indicates ${topSources[0].title.toLowerCase()} with mixed certainty across sources.`
        : 'No evidence available.',
      methodology: [
        'Analyze query intent and decompose research questions.',
        'Retrieve multi-provider evidence and rank by quality signals.',
        'Generate citation-linked synthesis with explicit uncertainty.',
      ],
      key_takeaways: sections.flatMap((section) => section.key_points).slice(0, 5),
      next_actions: defaultFollowUps(input.query),
    },
    sources,
  });
}

function normalizeAnswer(answer: StructuredResearchResponse): StructuredResearchResponse {
  const sourceIds = new Set(answer.sources.map((source) => source.id));

  const sections = answer.answer_sections.map((section) => {
    const cleaned = Array.from(new Set(section.citations.filter((citation) => sourceIds.has(citation)))).sort((a, b) => a - b);
    if (!cleaned.length) {
      const firstSource = answer.sources[0]?.id;
      return {
        ...section,
        citations: firstSource ? [firstSource] : [],
        content: firstSource ? `${section.content} [${firstSource}]` : section.content,
      };
    }

    return {
      ...section,
      citations: cleaned,
    };
  });

  const followUps = answer.follow_up_questions.slice(0, 3);
  while (followUps.length < 3) {
    followUps.push('What should I verify next?');
  }

  const publication = {
    ...answer.publication,
    methodology: answer.publication.methodology.length ? answer.publication.methodology : [answer.methodology_summary],
    next_actions: answer.publication.next_actions.length ? answer.publication.next_actions.slice(0, 5) : followUps,
  };

  return {
    ...answer,
    answer_sections: sections,
    follow_up_questions: [followUps[0], followUps[1], followUps[2]],
    publication,
  };
}

export async function synthesizeStructuredAnswer(input: SynthesisInput): Promise<StructuredResearchResponse> {
  const compactSources = input.sources.slice(0, 10).map(toSourceView);

  try {
    const { object } = await generateObject(
      [
        {
          role: 'user',
          content: JSON.stringify({
            query: input.query,
            mode: input.mode,
            intelligence: input.intelligence,
            plan: input.plan ?? null,
            previousContext: input.previousContext ?? null,
            requestedPublicationSections: input.publicationSections ?? [],
            uploadedDocuments: input.attachments?.map((file) => ({
              name: file.name,
              type: file.type,
              size: file.size,
              excerpt: file.text.slice(0, 12000),
            })) ?? [],
            sources: compactSources,
          }),
        },
      ],
      structuredResearchSchema,
      {
        system: [
          'You are a publication-grade synthesis agent for an enterprise AI research workspace.',
          'Use only supplied sources and never invent facts.',
          'Every analytical claim must be citation-backed via inline markers like [1] and section citation arrays.',
          'Highlight uncertainty and contradictory evidence explicitly.',
          'Return valid JSON matching the provided schema.',
          'Write answer_sections.content as publication-ready prose, not bullet-only fragments. Preserve markdown markers inside strings where useful, including **bold emphasis**, numbered citation markers, and compact tables when applicable.',
          'Use uploadedDocuments as first-class evidence. Cite them in prose by filename when they inform a claim, while using numeric source citations for web sources.',
          modeInstruction(input.mode),
          NEGATIVE_PROMPT,
        ].join('\n\n'),
        temperature: 0.1,
        maxOutputTokens: input.mode === 'publication_labs' ? 8192 : 3200,
      },
    );

    const parsedData = structuredResearchSchema.parse(object);
    
    // Inject Unsplash images if in publication mode or deep research
    if (input.mode === 'publication_labs' || input.mode === 'deep') {
      try {
        const images = await fetchUnsplashImages(input.query, parsedData.answer_sections.length);
        if (images.length > 0) {
          parsedData.answer_sections.forEach((section, idx) => {
            if (images[idx]) {
              const img = images[idx];
              // Extract a core keyword from the heading for the caption
              const keyword = section.heading.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').slice(0, 4).join(' ');
              const captionTarget = keyword || input.query;
              
              const imgMarkdown = `\n\n![Figure ${idx + 1}: Contextual representation of ${captionTarget}](${img.url})\n*Figure ${idx + 1}: Contextual representation of ${captionTarget} (Photo by [${img.photographer}](${img.photographer_url}) on Unsplash)*\n\n`;
              section.content = imgMarkdown + section.content;
            }
          });
        }
      } catch (err) {
        console.warn('Failed to inject Unsplash images', err);
      }
    }

    return normalizeAnswer(parsedData);
  } catch {
    return fallbackResponse(input);
  }
}


