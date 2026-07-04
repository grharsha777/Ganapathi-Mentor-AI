import type { QueryIntelligence, ResearchMode, StructuredResearchResponse } from '@/lib/research/schemas';
import type { UnifiedSearchResult } from '@/lib/research/types';

import type { AgentRole } from '@/lib/research/orchestration/roles';

export interface AgentTraceItem {
  role: AgentRole;
  label: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  elapsedMs?: number;
  summary?: string;
  details?: Record<string, unknown>;
}

export interface ResearchPlan {
  objective: string;
  strategy: string[];
  prioritized_sub_questions: string[];
  required_provider_types: Array<'web' | 'news' | 'academic' | 'code'>;
  risk_flags: string[];
}

export interface FactCheckSummary {
  citationCoverage: number;
  crossSourceSupport: number;
  weakClaimCount: number;
  contradictionSignals: string[];
}

export interface PublicationViewModel {
  title: string;
  abstract: string;
  executive_brief: string;
  methodology: string[];
  key_takeaways: string[];
  next_actions: string[];
}

export interface OrchestrationOutput {
  intelligence: QueryIntelligence;
  plan: ResearchPlan;
  answer: StructuredResearchResponse;
  sources: UnifiedSearchResult[];
  providerBreakdown: Record<string, number>;
  extractedSourceCount: number;
  factCheck: FactCheckSummary;
  publication: PublicationViewModel;
  mode: ResearchMode;
  elapsedMs: number;
  agentTrace: AgentTraceItem[];
}
