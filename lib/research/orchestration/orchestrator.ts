import { analyzeQueryIntelligence } from '@/lib/research/query-intelligence';
import { synthesizeStructuredAnswer } from '@/lib/research/synthesis';
import { getModeConfig } from '@/lib/research/config';
import { buildPublicationViewModel } from '@/lib/research/orchestration/publication-agent';
import { enforceCitationQuality } from '@/lib/research/orchestration/citation-agent';
import { summarizeFactCheck } from '@/lib/research/orchestration/fact-checking-agent';
import { rerankEvidence } from '@/lib/research/orchestration/evidence-ranking-agent';
import { buildResearchPlan } from '@/lib/research/orchestration/planning-agent';
import { retrieveEvidence } from '@/lib/research/orchestration/retrieval-agent';
import { ROLE_LABELS } from '@/lib/research/orchestration/roles';

import type { AgentRole } from '@/lib/research/orchestration/roles';
import type { AgentTraceItem, OrchestrationOutput } from '@/lib/research/orchestration/types';
import type { StageUpdateCallback, ResearchPipelineInput } from '@/lib/research/types';

interface RoleContext {
  trace: AgentTraceItem[];
  onStage?: StageUpdateCallback;
}

async function runRole<T>(
  role: AgentRole,
  context: RoleContext,
  work: () => Promise<{ result: T; summary?: string; details?: Record<string, unknown> }>,
): Promise<T> {
  const startedAt = Date.now();
  context.onStage?.(role, { status: 'running', label: ROLE_LABELS[role] });

  try {
    const { result, summary, details } = await work();
    const elapsedMs = Date.now() - startedAt;

    context.trace.push({
      role,
      label: ROLE_LABELS[role],
      status: 'completed',
      elapsedMs,
      summary,
      details,
    });

    context.onStage?.(role, {
      status: 'completed',
      label: ROLE_LABELS[role],
      elapsedMs,
      ...(summary ? { summary } : {}),
      ...(details ?? {}),
    });

    return result;
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    context.trace.push({
      role,
      label: ROLE_LABELS[role],
      status: 'failed',
      elapsedMs,
      summary: error instanceof Error ? error.message : 'Agent failed',
    });

    context.onStage?.(role, {
      status: 'failed',
      label: ROLE_LABELS[role],
      elapsedMs,
      message: error instanceof Error ? error.message : 'Agent failed',
    });

    throw error;
  }
}

export async function executeResearchOrchestration(
  input: ResearchPipelineInput,
  onStage?: StageUpdateCallback,
): Promise<OrchestrationOutput> {
  const startedAt = Date.now();
  const trace: AgentTraceItem[] = [];
  const ctx: RoleContext = { trace, onStage };

  const intelligence = await runRole('query_understanding', ctx, async () => {
    const result = await analyzeQueryIntelligence(input.query);
    return {
      result,
      summary: `${result.intent} intent with ${result.decomposed_questions.length} planned sub-questions`,
      details: {
        intent: result.intent,
        language: result.language,
      },
    };
  });

  const plan = await runRole('planning', ctx, async () => {
    const result = await buildResearchPlan(input.query, intelligence, input.mode);
    return {
      result,
      summary: `${result.required_provider_types.join(', ')} providers prioritized`,
    };
  });

  const retrieval = await runRole('web_research', ctx, async () => {
    const result = await retrieveEvidence({
      ...input,
      providerNames: Array.from(new Set([...(input.providerNames ?? []), ...plan.required_provider_types])),
    });

    return {
      result,
      summary: `${result.ranked.length} ranked sources retrieved`,
      details: {
        providers: result.providerBreakdown,
      },
    };
  });

  await runRole('news_research', ctx, async () => ({
    result: true,
    summary: `${retrieval.groupedByRole.news.length} news sources in evidence pool`,
  }));

  await runRole('academic_papers', ctx, async () => ({
    result: true,
    summary: `${retrieval.groupedByRole.academic.length} academic sources in evidence pool`,
  }));

  await runRole('code_analysis', ctx, async () => ({
    result: true,
    summary: `${retrieval.groupedByRole.code.length} code references in evidence pool`,
  }));

  const modeConfig = getModeConfig(input.mode);

  const rankedSources = await runRole('evidence_ranking', ctx, async () => {
    const result = rerankEvidence(retrieval.ranked, modeConfig.retrievalLimit);
    return {
      result,
      summary: `${result.length} sources selected after diversity ranking`,
    };
  });

  const synthesized = await runRole('synthesis', ctx, async () => {
    const result = await synthesizeStructuredAnswer({
      query: input.query,
      intelligence,
      sources: rankedSources,
      mode: input.mode,
      previousContext: input.previousContext,
      plan,
    });

    return {
      result,
      summary: `${result.answer_sections.length} structured sections synthesized`,
    };
  });

  const cited = await runRole('citation', ctx, async () => {
    const result = enforceCitationQuality(synthesized, rankedSources);
    return {
      result,
      summary: `${result.bibliography.length} bibliography entries finalized`,
    };
  });

  const factCheck = await runRole('fact_checking', ctx, async () => {
    const result = summarizeFactCheck(cited, rankedSources);
    return {
      result,
      summary: `${result.citationCoverage}% citation coverage, ${result.crossSourceSupport}% support`,
    };
  });

  const publication = await runRole('publication', ctx, async () => {
    const result = buildPublicationViewModel(input.query, cited);
    return {
      result,
      summary: `${result.key_takeaways.length} takeaways prepared`,
    };
  });

  await runRole('pdf_export', ctx, async () => ({
    result: true,
    summary: 'PDF-ready text model prepared',
  }));

  await runRole('memory_history', ctx, async () => ({
    result: true,
    summary: input.previousContext ? 'Previous research context reused' : 'Fresh session context',
  }));

  await runRole('ui_presentation', ctx, async () => ({
    result: true,
    summary: 'Publication structure prepared for UI cards and exports',
  }));

  const elapsedMs = Date.now() - startedAt;

  return {
    intelligence,
    plan,
    answer: cited,
    sources: rankedSources,
    providerBreakdown: retrieval.providerBreakdown,
    extractedSourceCount: retrieval.extractedSourceCount,
    factCheck,
    publication,
    mode: input.mode,
    elapsedMs,
    agentTrace: trace,
  };
}

