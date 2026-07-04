import type { ResearchMode, StructuredResearchResponse } from '@/lib/research/schemas';

export interface CollectionSummary {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  shareToken?: string;
  shareExpiresAt?: string;
}

export interface ResearchHistoryItem {
  id: string;
  query: string;
  mode: ResearchMode;
  answer: StructuredResearchResponse;
  sources: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface StreamStageEvent {
  stage: string;
  status?: string;
  [key: string]: unknown;
}

export interface StreamResult {
  answer: StructuredResearchResponse;
  sources: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
}

export interface QueryPayload {
  query: string;
  mode: ResearchMode;
  safeSearch: boolean;
  includeDomains: string[];
  excludeDomains: string[];
  providerNames: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  previousContext?: string;
  attachments?: Array<{ name: string; type: string; size: number; text: string }>;
  publicationSections?: string[];
}

export async function fetchSuggestions(query: string): Promise<string[]> {
  const response = await fetch(`/api/research/suggest?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { suggestions?: string[] };
  return payload.suggestions ?? [];
}

export async function fetchCollections(search = ''): Promise<CollectionSummary[]> {
  const suffix = search ? `?q=${encodeURIComponent(search)}` : '';
  const response = await fetch(`/api/research/collections${suffix}`, { credentials: 'include' });
  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { collections?: CollectionSummary[] };
  return payload.collections ?? [];
}

export async function createCollection(payload: {
  name: string;
  color: string;
  icon: string;
}): Promise<CollectionSummary> {
  const response = await fetch('/api/research/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create collection');
  }

  const json = (await response.json()) as { collection: CollectionSummary };
  return json.collection;
}

export async function saveToCollections(payload: {
  collectionIds: string[];
  query: string;
  answer: StructuredResearchResponse;
  sources: Array<Record<string, unknown>>;
}): Promise<void> {
  const response = await fetch('/api/research/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to save research result');
  }
}

export async function fetchHistory(search = ''): Promise<ResearchHistoryItem[]> {
  const suffix = search ? `?q=${encodeURIComponent(search)}&limit=100` : '?limit=100';
  const response = await fetch(`/api/research/history${suffix}`, { credentials: 'include' });
  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { history?: ResearchHistoryItem[] };
  return payload.history ?? [];
}

export async function createCollectionShareLink(collectionId: string): Promise<{ shareUrl: string; expiresAt: string }> {
  const response = await fetch(`/api/research/collections/${collectionId}/share`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to create share link');
  }

  return (await response.json()) as { shareUrl: string; expiresAt: string };
}

export async function streamResearchQuery(
  payload: QueryPayload,
  onStage: (event: StreamStageEvent) => void,
  onToken?: (token: string) => void,
): Promise<StreamResult> {
  const response = await fetch('/api/research/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    throw new Error('Unable to start research stream');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let answer: StructuredResearchResponse | null = null;
  let sources: Array<Record<string, unknown>> = [];
  let metadata: Record<string, unknown> = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';

    for (const chunk of chunks) {
      const lines = chunk.split('\n');
      const eventLine = lines.find((line) => line.startsWith('event:'));
      const dataLine = lines.find((line) => line.startsWith('data:'));
      if (!eventLine || !dataLine) {
        continue;
      }

      const eventName = eventLine.slice('event:'.length).trim();
      const payloadJson = JSON.parse(dataLine.slice('data:'.length).trim()) as Record<string, unknown>;

      if (eventName === 'stage') {
        onStage(payloadJson as StreamStageEvent);
      }

      if (eventName === 'answer' && payloadJson.answer) {
        answer = payloadJson.answer as StructuredResearchResponse;
      }

      if (eventName === 'sources' && Array.isArray(payloadJson.sources)) {
        sources = payloadJson.sources as Array<Record<string, unknown>>;
      }

      if (eventName === 'metadata') {
        metadata = payloadJson;
      }

      if (eventName === 'answer_token' && typeof payloadJson.token === 'string') {
        onToken?.(payloadJson.token);
      }

      if (eventName === 'error') {
        throw new Error(String(payloadJson.message ?? 'Streaming failed'));
      }
    }
  }

  if (!answer) {
    throw new Error('Research answer was not returned');
  }

  return { answer, sources, metadata };
}

