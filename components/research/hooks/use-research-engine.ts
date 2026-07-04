'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useContentStore } from '@/lib/content-store';
import { getDefaultProvidersForMode } from '@/lib/research/config';
import {
  createCollection,
  createCollectionShareLink,
  fetchCollections,
  fetchHistory,
  fetchSuggestions,
  saveToCollections,
  streamResearchQuery,
} from '@/lib/research/client';
import { buildAnswerPlainText, buildMarkdownReport, buildRichTextReport, downloadFile, exportResearchPdf } from '@/lib/research/export';

import type { CollectionSummary, ResearchHistoryItem, StreamStageEvent } from '@/lib/research/client';
import type { ResearchMode, StructuredResearchResponse } from '@/lib/research/schemas';
import { structuredResearchSchema } from '@/lib/research/schemas';

interface SearchOutput {
  answer: StructuredResearchResponse;
  sources: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
  query?: string;
}

export interface AttachedResearchFile {
  name: string;
  type: string;
  size: number;
  text: string;
}

const ATTACHMENT_LIMIT_BY_MODE: Record<ResearchMode, number> = {
  quick: 2,
  deep: 4,
  comparative: 4,
  academic: 5,
  news: 4,
  publication_labs: 8,
};

const MAX_ATTACHMENT_CHARS = 18000;

const DEFAULT_MODE: ResearchMode = 'deep';
const DEFAULT_PROVIDERS = getDefaultProvidersForMode(DEFAULT_MODE);

function shouldInjectPreviousContext(query: string): boolean {
  return /\b(it|they|that|those|this|continue|deeper|compare|more)\b/i.test(query);
}

function parseDomainList(input: string): string[] {
  return input
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function useResearchEngine() {
  const store = useContentStore('research');

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<ResearchMode>(DEFAULT_MODE);
  const [providers, setProviders] = useState<string[]>(DEFAULT_PROVIDERS);
  const [safeSearch, setSafeSearch] = useState(true);
  const [includeDomainsInput, setIncludeDomainsInput] = useState('');
  const [excludeDomainsInput, setExcludeDomainsInput] = useState('');
  const [newsWindow, setNewsWindow] = useState<'24h' | '7d' | '30d'>('7d');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  // Publication Labs advanced settings
  const [publicationSections, setPublicationSections] = useState<string[]>([
    'abstract', 'introduction', 'related_work', 'methodology', 'results', 'discussion', 'conclusion', 'references'
  ]);
  const [attachments, setAttachments] = useState<AttachedResearchFile[]>([]);

  const [loading, setLoading] = useState(false);
  const [stageEvents, setStageEvents] = useState<StreamStageEvent[]>([]);
  const [streamedPreview, setStreamedPreview] = useState('');
  const [answer, setAnswer] = useState<StructuredResearchResponse | null>(null);
  const [sources, setSources] = useState<Array<Record<string, unknown>>>([]);
  const [metadata, setMetadata] = useState<Record<string, unknown>>({});

  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);
  const [historyQuery, setHistoryQuery] = useState('');
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionColor, setNewCollectionColor] = useState('#00D4AA');
  const [newCollectionIcon, setNewCollectionIcon] = useState('📚');
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const hydrate = useCallback(async () => {
    const [remoteCollections, remoteHistory, localLast, localEntries] = await Promise.all([
      fetchCollections(),
      fetchHistory(),
      store.load<SearchOutput>('last_result'),
      store.list<ResearchHistoryItem>(),
    ]);

    setCollections(remoteCollections);
    const localHistory = localEntries
      .filter((entry) => entry.key.startsWith('history:'))
      .map((entry) => entry.data)
      .filter((entry): entry is ResearchHistoryItem => Boolean(entry?.id && entry?.query))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    setHistory(remoteHistory.length ? remoteHistory : localHistory);

    if (localLast) {
      const parsed = structuredResearchSchema.safeParse(localLast.answer);
      setAnswer(parsed.success ? parsed.data : localLast.answer);
      setSources(localLast.sources);
      setMetadata(localLast.metadata);
      setQuery(localLast.query || '');
    }
  }, [store]);

  useEffect(() => {
    hydrate().catch(() => {
      toast.error('Failed to load research workspace');
    });
  }, [hydrate]);


  const attachmentLimit = ATTACHMENT_LIMIT_BY_MODE[mode];

  const addAttachments = useCallback(async (files: FileList | File[]) => {
    const incoming = Array.from(files);
    if (!incoming.length) return;

    const remaining = attachmentLimit - attachments.length;
    if (remaining <= 0) {
      toast.error(`Attachment limit reached for ${mode.replace('_', ' ')} mode`);
      return;
    }

    const accepted = incoming.slice(0, remaining);
    if (incoming.length > remaining) {
      toast.warning(`Only ${remaining} more file${remaining === 1 ? '' : 's'} allowed for this mode`);
    }

    try {
      const parsed = await Promise.all(
        accepted.map(async (file) => {
          const text = await file.text();
          return {
            name: file.name,
            type: file.type || 'text/plain',
            size: file.size,
            text: text.slice(0, MAX_ATTACHMENT_CHARS),
          } satisfies AttachedResearchFile;
        }),
      );
      setAttachments((current) => [...current, ...parsed]);
      toast.success(`${parsed.length} attachment${parsed.length === 1 ? '' : 's'} ready`);
    } catch {
      toast.error('Failed to read attachment');
    }
  }, [attachmentLimit, attachments.length, mode]);

  const removeAttachment = useCallback((name: string) => {
    setAttachments((current) => current.filter((file) => file.name !== name));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      fetchSuggestions(query)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 220);

    return () => window.clearTimeout(timer);
  }, [query]);

  const runSearch = useCallback(async (override?: string) => {
    const trimmed = (override ?? query).trim();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    setQuery(trimmed);
    setSuggestions([]);
    setActiveSuggestion(-1);
    setStageEvents([]);
    setStreamedPreview('');

    const previous = shouldInjectPreviousContext(trimmed) && history[0]
      ? `${history[0].query}\n${buildAnswerPlainText(history[0].answer)}`
      : undefined;

    try {
      const result = await streamResearchQuery(
        {
          query: trimmed,
          mode,
          safeSearch,
          includeDomains: parseDomainList(includeDomainsInput),
          excludeDomains: parseDomainList(excludeDomainsInput),
          providerNames: providers,
          dateRange:
            mode === 'news'
              ? {
                  from: new Date(
                    Date.now() -
                      (newsWindow === '24h' ? 1 : newsWindow === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                  to: new Date().toISOString(),
                }
              : undefined,
          previousContext: previous,
        },
        (event) => {
          setStageEvents((current) => [...current, event]);
        },
        (token) => {
          setStreamedPreview((current) => current + token);
        },
      );

      const parsed = structuredResearchSchema.safeParse(result.answer);
      const normalizedAnswer = parsed.success ? parsed.data : result.answer;

      setAnswer(normalizedAnswer);
      setSources(result.sources);
      setMetadata(result.metadata);

      await store.save('last_result', { ...result, answer: normalizedAnswer, query: trimmed }, trimmed);
      await store.save(`history:${Date.now()}`, {
        id: `local-${Date.now()}`,
        query: trimmed,
        mode,
        answer: normalizedAnswer,
        sources: result.sources,
        metadata: result.metadata,
        createdAt: new Date().toISOString(),
      } satisfies ResearchHistoryItem, trimmed);
      const refreshed = await fetchHistory(historyQuery);
      setHistory(refreshed);
      toast.success('Research complete');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Research failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [
    excludeDomainsInput,
    history,
    historyQuery,
    includeDomainsInput,
    mode,
    newsWindow,
    providers,
    publicationSections,
    attachments,
    query,
    safeSearch,
    store,
  ]);

  const filteredHistory = useMemo(() => {
    if (!historyQuery.trim()) {
      return history;
    }

    return history.filter((item) =>
      item.query.toLowerCase().includes(historyQuery.toLowerCase()) ||
      item.answer.tldr.toLowerCase().includes(historyQuery.toLowerCase()),
    );
  }, [history, historyQuery]);

  const createNewCollection = useCallback(async () => {
    if (!newCollectionName.trim()) {
      toast.error('Collection name is required');
      return;
    }

    setCreatingCollection(true);
    try {
      const created = await createCollection({
        name: newCollectionName,
        color: newCollectionColor,
        icon: newCollectionIcon,
      });
      setCollections((current) => [created, ...current]);
      setNewCollectionName('');
      toast.success('Collection created');
    } catch {
      toast.error('Failed to create collection');
    } finally {
      setCreatingCollection(false);
    }
  }, [newCollectionColor, newCollectionIcon, newCollectionName]);

  const saveCurrentToCollections = useCallback(async () => {
    if (!answer || !query || selectedCollectionIds.length === 0) {
      toast.error('Pick at least one collection first');
      return;
    }

    const snapshot = collections;
    setCollections((current) =>
      current.map((collection) =>
        selectedCollectionIds.includes(collection.id)
          ? { ...collection, itemCount: collection.itemCount + 1 }
          : collection,
      ),
    );

    try {
      await saveToCollections({
        collectionIds: selectedCollectionIds,
        query,
        answer,
        sources,
      });
      toast.success('Saved to collection');
    } catch {
      setCollections(snapshot);
      toast.error('Failed to save to collection');
    }
  }, [answer, collections, query, selectedCollectionIds, sources]);

  const exportAsMarkdown = useCallback(() => {
    if (!answer || !query) return;
    downloadFile(`${query.slice(0, 45)}.md`, buildMarkdownReport(query, answer), 'text/markdown;charset=utf-8');
  }, [answer, query]);

  const exportAsJson = useCallback(() => {
    if (!answer || !query) return;
    
    const semanticData = {
      title: answer.publication.title || query,
      abstract: answer.publication.abstract || answer.tldr,
      methodology: answer.methodology_summary,
      evidence_summary: answer.answer_sections.map((sec) => ({
        heading: sec.heading,
        content: sec.content,
        evidence_strength: sec.evidence_strength,
        key_points: sec.key_points
      })),
      fact_checked_claims: answer.key_claims,
      research_gaps: answer.research_gaps,
      sources: answer.sources
    };

    downloadFile(`${query.slice(0, 45)}.json`, JSON.stringify(semanticData, null, 2), 'application/json;charset=utf-8');
  }, [answer, query]);

  const exportAsRichText = useCallback(async () => {
    if (!answer || !query) return;
    try {
      const html = buildRichTextReport(query, answer);
      const plain = buildMarkdownReport(query, answer);
      
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      toast.success('Copied rich text to clipboard');
    } catch (err) {
      console.error('Failed to copy rich text:', err);
      toast.error('Failed to copy to clipboard');
    }
  }, [answer, query]);

  const exportAsPdf = useCallback(async () => {
    if (!answer || !query) return;
    setExportingPdf(true);
    try {
      await exportResearchPdf(query, answer);
      toast.success('PDF downloaded');
    } catch {
      toast.error('PDF export failed');
    } finally {
      setExportingPdf(false);
    }
  }, [answer, query]);

  const shareCollection = useCallback(async (collectionId: string) => {
    try {
      const result = await createCollectionShareLink(collectionId);
      await navigator.clipboard.writeText(result.shareUrl);
      toast.success('Share link copied');
    } catch {
      toast.error('Failed to create share link');
    }
  }, []);

  return {
    query,
    setQuery,
    mode,
    setMode,
    providers,
    setProviders,
    safeSearch,
    setSafeSearch,
    includeDomainsInput,
    setIncludeDomainsInput,
    excludeDomainsInput,
    setExcludeDomainsInput,
    newsWindow,
    setNewsWindow,
    suggestions,
    activeSuggestion,
    setActiveSuggestion,
    publicationSections,
    setPublicationSections,
    loading,
    stageEvents,
    streamedPreview,
    answer,
    sources,
    metadata,
    history: filteredHistory,
    historyQuery,
    setHistoryQuery,
    collections,
    selectedCollectionIds,
    setSelectedCollectionIds,
    newCollectionName,
    setNewCollectionName,
    newCollectionColor,
    setNewCollectionColor,
    newCollectionIcon,
    setNewCollectionIcon,
    creatingCollection,
    exportingPdf,
    attachments,
    addAttachments,
    removeAttachment,
    attachmentLimit,
    runSearch,
    hydrate,
    createNewCollection,
    saveCurrentToCollections,
    exportAsMarkdown,
    exportAsJson,
    exportAsRichText,
    exportAsPdf,
    shareCollection,
  };
}

