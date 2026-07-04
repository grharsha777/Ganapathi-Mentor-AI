import type { ResearchMode } from '@/lib/research/schemas';
import type { ProviderType } from '@/lib/research/types';

export const PROVIDER_IDS = ['web', 'academic', 'news', 'code'] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

export interface ProviderMeta {
  id: ProviderId;
  label: string;
  role: string;
  icon: string;
}

export const PROVIDER_META: Record<ProviderId, ProviderMeta> = {
  web: { id: 'web', label: 'Web', role: 'Web Research', icon: '🌐' },
  academic: { id: 'academic', label: 'Academic', role: 'Academic Papers', icon: '🎓' },
  news: { id: 'news', label: 'News', role: 'News', icon: '📰' },
  code: { id: 'code', label: 'Code', role: 'Code Analysis', icon: '💻' },
};

export interface ResearchModeConfig {
  id: ResearchMode;
  label: string;
  description: string;
  defaultProviders: ProviderId[];
  retrievalLimit: number;
  extractionLimit: number;
  newsWindowDays?: number;
}

export const RESEARCH_MODE_CONFIG: Record<ResearchMode, ResearchModeConfig> = {
  quick: {
    id: 'quick',
    label: 'Quick Brief',
    description: 'Fast, source-grounded summary for immediate decisions.',
    defaultProviders: ['web'],
    retrievalLimit: 4,
    extractionLimit: 3,
  },
  deep: {
    id: 'deep',
    label: 'Deep Research',
    description: 'Comprehensive cross-domain analysis with strong citations.',
    defaultProviders: ['web', 'academic', 'news', 'code'],
    retrievalLimit: 10,
    extractionLimit: 8,
  },
  comparative: {
    id: 'comparative',
    label: 'Comparative Analysis',
    description: 'Tradeoff-led side-by-side evaluation across options.',
    defaultProviders: ['web', 'academic', 'code'],
    retrievalLimit: 10,
    extractionLimit: 8,
  },
  academic: {
    id: 'academic',
    label: 'Academic Review',
    description: 'Methodology-heavy literature synthesis and evidence quality.',
    defaultProviders: ['academic', 'web'],
    retrievalLimit: 9,
    extractionLimit: 8,
  },
  news: {
    id: 'news',
    label: 'News Pulse',
    description: 'Recent developments, timeline ordering, and signal checks.',
    defaultProviders: ['news', 'web'],
    retrievalLimit: 8,
    extractionLimit: 6,
    newsWindowDays: 7,
  },
  publication_labs: {
    id: 'publication_labs',
    label: 'Publication Labs',
    description: 'Extensive generation of fully structured, publication-ready research documents.',
    defaultProviders: ['academic', 'web', 'code'],
    retrievalLimit: 15,
    extractionLimit: 12,
  }
};

export function getModeConfig(mode: ResearchMode): ResearchModeConfig {
  return RESEARCH_MODE_CONFIG[mode];
}

export function getDefaultProvidersForMode(mode: ResearchMode): ProviderId[] {
  return [...getModeConfig(mode).defaultProviders];
}

export function normalizeProviderNames(mode: ResearchMode, selected?: string[]): ProviderId[] {
  const requested = selected ?? [];
  const valid = requested.filter((name): name is ProviderId => PROVIDER_IDS.includes(name as ProviderId));
  if (valid.length) {
    return Array.from(new Set(valid));
  }

  return getDefaultProvidersForMode(mode);
}

export function providerIdToType(providerId: ProviderId): ProviderType {
  return providerId;
}

export function listModeOptions(): Array<{ id: ResearchMode; label: string; description: string }> {
  return Object.values(RESEARCH_MODE_CONFIG).map((entry) => ({
    id: entry.id,
    label: entry.label,
    description: entry.description,
  }));
}
