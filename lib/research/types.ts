import type {
  QueryIntelligence,
  ResearchMode,
  StructuredResearchResponse,
} from '@/lib/research/schemas';
import type { AgentRole } from '@/lib/research/orchestration/roles';

export type ProviderType = 'web' | 'academic' | 'news' | 'code' | 'mock';

export interface ProviderSearchOptions {
  limit?: number;
  safeSearch?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  language?: string;
}

export interface UnifiedSearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  provider: string;
  providerType: ProviderType;
  publishedDate?: string;
  relevanceScore: number;
  recencyScore: number;
  domainAuthorityScore: number;
  reliability: number;
  fullText?: string;
}

export interface SearchProvider {
  search(query: string, options: ProviderSearchOptions): Promise<UnifiedSearchResult[]>;
  getName(): string;
  getIcon(): string;
  isAvailable(): boolean;
}

export interface ResearchPipelineInput {
  query: string;
  mode: ResearchMode;
  safeSearch: boolean;
  includeDomains: string[];
  excludeDomains: string[];
  providerNames?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  previousContext?: string;
  attachments?: Array<{ name: string; type: string; size: number; text: string }>;
  publicationSections?: string[];
}

export interface ResearchPipelineOutput {
  intelligence: QueryIntelligence;
  answer: StructuredResearchResponse;
  retrieval: {
    sources: UnifiedSearchResult[];
    providerBreakdown: Record<string, number>;
    extractedSourceCount: number;
  };
  metadata: {
    elapsedMs: number;
    cacheHit: boolean;
    deduplicatedRequest: boolean;
    mode: ResearchMode;
    providerBreakdown?: Record<string, number>;
    extractedSourceCount?: number;
    agentTrace?: Array<{
      role: AgentRole;
      label: string;
      status: 'queued' | 'running' | 'completed' | 'failed';
      elapsedMs?: number;
      summary?: string;
      details?: Record<string, unknown>;
    }>;
    factCheck?: {
      citationCoverage: number;
      crossSourceSupport: number;
      weakClaimCount: number;
      contradictionSignals: string[];
    };
  };
}

export type ResearchStage =
  | AgentRole
  | 'query_intelligence'
  | 'retrieval'
  | 'synthesis'
  | 'rendering'
  | 'completed';

export type StageUpdateCallback = (stage: ResearchStage, payload: Record<string, unknown>) => void;

