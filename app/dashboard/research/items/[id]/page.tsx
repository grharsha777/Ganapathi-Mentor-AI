'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';

import { AnswerSections } from '@/components/research/cards/answer-sections';
import { BibliographyList } from '@/components/research/cards/bibliography-list';
import { KeyClaims } from '@/components/research/cards/key-claims';
import { PublicationPanel } from '@/components/research/cards/publication-panel';
import { TldrBanner } from '@/components/research/cards/tldr-banner';
import { SourcesGrid } from '@/components/research/cards/sources-grid';
import { Button } from '@/components/ui/button';
import { buildMarkdownReport, downloadFile, exportResearchPdf } from '@/lib/research/export';
import { structuredResearchSchema } from '@/lib/research/schemas';

import type { StructuredResearchResponse } from '@/lib/research/schemas';

type ItemPayload = {
  item: {
    id: string;
    collectionId: string;
    query: string;
    answer: StructuredResearchResponse;
    createdAt: string;
  };
};

export default function ResearchItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<ItemPayload['item'] | null>(null);
  const [highlightedCitation, setHighlightedCitation] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const response = await fetch(`/api/research/items/${resolvedParams.id}`, { credentials: 'include' });
      if (!response.ok) {
        toast.error('Failed to load research item');
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as ItemPayload;
      const normalizedAnswer = structuredResearchSchema.safeParse(payload.item.answer);
      const fallbackAnswer = structuredResearchSchema.parse({
        tldr: 'Legacy research item without full structured output.',
        confidence: 50,
        query_focus: payload.item.query,
        methodology_summary: 'Legacy result format migrated for display.',
        answer_sections: [
          {
            heading: 'Legacy Summary',
            content: typeof payload.item.answer === 'object' && payload.item.answer && 'tldr' in payload.item.answer
              ? String((payload.item.answer as Record<string, unknown>).tldr ?? '')
              : 'No summary available.',
            key_points: [],
            evidence_strength: 'weak',
            citations: [],
          },
        ],
        key_claims: [],
        data_points: [],
        follow_up_questions: [
          'What sources should be verified first?',
          'Can this result be refreshed with current data?',
          'What assumptions were made in the original result?',
        ],
        confidence_breakdown: {
          factual: 45,
          recency: 40,
          source_quality: 42,
        },
        research_gaps: ['Legacy entry requires a fresh synthesis for publication-grade output.'],
        counter_arguments: [],
        timeline: [],
        bibliography: [],
        publication: {
          title: `Research Brief: ${payload.item.query}`,
          abstract: '',
          executive_brief: '',
          methodology: [],
          key_takeaways: [],
          next_actions: [],
        },
        sources: [],
      });
      setItem({
        ...payload.item,
        answer: normalizedAnswer.success ? normalizedAnswer.data : fallbackAnswer,
      });
      setLoading(false);
    };

    load().catch(() => {
      toast.error('Failed to load research item');
      setLoading(false);
    });
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="rounded-xl border border-white/10 bg-[#111118]/80 p-4 text-sm text-zinc-400">Loading research item...</div>;
  }

  if (!item) {
    return <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">Research item not found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#1f2937] bg-[#0b1220]/85 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href={`/dashboard/research/collections/${item.collectionId}`} className="inline-flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200">
              <ArrowLeft className="h-3 w-3" />
              Back to collection
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-white">{item.query}</h1>
            <p className="mt-1 text-xs text-zinc-500">Saved on {new Date(item.createdAt).toLocaleString()}</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-white/15 bg-white/5 text-zinc-200"
              onClick={() => downloadFile(`${item.query.slice(0, 45)}.md`, buildMarkdownReport(item.query, item.answer), 'text/markdown;charset=utf-8')}
            >
              <Download className="mr-2 h-4 w-4" />
              Markdown
            </Button>
            <Button
              className="bg-sky-400 text-black hover:bg-sky-300"
              onClick={() => exportResearchPdf(item.query, item.answer)}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <TldrBanner tldr={item.answer.tldr} confidence={item.answer.confidence} />
      <AnswerSections
        sections={item.answer.answer_sections}
        onCitationClick={(citation) => {
          setHighlightedCitation(citation);
          document.getElementById(`source-${citation}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      />
      <KeyClaims
        claims={item.answer.key_claims}
        onCitationClick={(citation) => {
          setHighlightedCitation(citation);
          document.getElementById(`source-${citation}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      />
      <PublicationPanel publication={item.answer.publication} />
      <BibliographyList bibliography={item.answer.bibliography} />

      <section className="rounded-2xl border border-[#1f2937] bg-[#0b1220]/85 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Sources</p>
        <div className="mt-3 max-h-[60vh] overflow-y-auto pr-1">
          <SourcesGrid sources={item.answer.sources} highlightedId={highlightedCitation ?? undefined} />
        </div>
      </section>
    </div>
  );
}
