import { getCachedValue, setCachedValue } from '@/lib/research/cache';
import { trackResearchMetric } from '@/lib/research/analytics';
import { executeResearchOrchestration } from '@/lib/research/orchestration/orchestrator';

import type {
  ResearchPipelineInput,
  ResearchPipelineOutput,
  StageUpdateCallback,
} from '@/lib/research/types';

const inflight = new Map<string, Promise<ResearchPipelineOutput>>();

function cacheKey(input: ResearchPipelineInput): string {
  return JSON.stringify({
    q: input.query.toLowerCase().trim(),
    mode: input.mode,
    safeSearch: input.safeSearch,
    includeDomains: input.includeDomains,
    excludeDomains: input.excludeDomains,
    providers: [...(input.providerNames ?? [])].sort(),
    dateRange: input.dateRange,
  });
}

async function executePipeline(
  input: ResearchPipelineInput,
  onStage?: StageUpdateCallback,
): Promise<ResearchPipelineOutput> {
  const orchestrated = await executeResearchOrchestration(input, onStage);

  return {
    intelligence: orchestrated.intelligence,
    answer: orchestrated.answer,
    retrieval: {
      sources: orchestrated.sources,
      providerBreakdown: orchestrated.providerBreakdown,
      extractedSourceCount: orchestrated.extractedSourceCount,
    },
    metadata: {
      elapsedMs: orchestrated.elapsedMs,
      cacheHit: false,
      deduplicatedRequest: false,
      mode: input.mode,
      providerBreakdown: orchestrated.providerBreakdown,
      extractedSourceCount: orchestrated.extractedSourceCount,
      agentTrace: orchestrated.agentTrace,
      factCheck: orchestrated.factCheck,
    },
  };
}

export async function runResearchPipeline(
  input: ResearchPipelineInput,
  onStage?: StageUpdateCallback,
): Promise<ResearchPipelineOutput> {
  const key = cacheKey(input);
  const cached = await getCachedValue<ResearchPipelineOutput>(key);
  if (cached) {
    const cachedResult: ResearchPipelineOutput = {
      ...cached,
      metadata: {
        ...cached.metadata,
        cacheHit: true,
        deduplicatedRequest: false,
      },
    };

    trackResearchMetric(input.mode, cachedResult.metadata.elapsedMs, true, true);
    return cachedResult;
  }

  const existing = inflight.get(key);
  if (existing) {
    const result = await existing;
    return {
      ...result,
      metadata: {
        ...result.metadata,
        deduplicatedRequest: true,
      },
    };
  }

  const promise = executePipeline(input, onStage)
    .then(async (result) => {
      await setCachedValue(key, result);
      trackResearchMetric(input.mode, result.metadata.elapsedMs, true, false);
      return result;
    })
    .catch((error) => {
      trackResearchMetric(input.mode, 0, false, false);
      throw error;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

