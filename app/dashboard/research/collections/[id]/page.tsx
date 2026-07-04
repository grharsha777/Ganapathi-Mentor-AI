'use client';

import Link from 'next/link';
import { use, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { buildMarkdownReport, downloadFile, exportCollectionPdf } from '@/lib/research/export';

import type { StructuredResearchResponse } from '@/lib/research/schemas';

type CollectionItem = {
  id: string;
  query: string;
  answer: StructuredResearchResponse;
  sources: Array<Record<string, unknown>>;
  createdAt: string;
};

type CollectionPayload = {
  collection: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  items: CollectionItem[];
};

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState<CollectionPayload['collection'] | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const response = await fetch(`/api/research/collections/${resolvedParams.id}`, { credentials: 'include' });
      if (!response.ok) {
        toast.error('Failed to load collection');
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as CollectionPayload;
      setCollection(payload.collection);
      setItems(payload.items);
      setLoading(false);
    };

    load().catch(() => {
      toast.error('Failed to load collection');
      setLoading(false);
    });
  }, [resolvedParams.id]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const normalized = query.toLowerCase();

    return items.filter((item) =>
      item.query.toLowerCase().includes(normalized) ||
      item.answer.tldr.toLowerCase().includes(normalized),
    );
  }, [items, query]);

  const exportMarkdownCollection = () => {
    if (!collection) return;
    const content = filtered.map((item) => buildMarkdownReport(item.query, item.answer)).join('\n\n---\n\n');
    downloadFile(`${collection.name.replace(/\s+/g, '-').toLowerCase()}-collection.md`, content, 'text/markdown;charset=utf-8');
  };

  const exportPdfCollection = async () => {
    if (!collection) return;
    try {
      toast.info('Generating PDF...');
      await exportCollectionPdf(collection.name, filtered);
      toast.success('PDF generated successfully');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      toast.error('Failed to generate PDF');
    }
  };

  const shareCollection = async () => {
    if (!collection) return;
    const response = await fetch(`/api/research/collections/${collection.id}/share`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      toast.error('Failed to create share link');
      return;
    }

    const payload = (await response.json()) as { shareUrl: string };
    await navigator.clipboard.writeText(payload.shareUrl);
    toast.success('Share link copied');
  };

  if (loading) {
    return <div className="rounded-xl border border-white/10 bg-[#111118]/80 p-4 text-sm text-zinc-400">Loading collection...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#1f2937] bg-[#0b1220]/85 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-white">
            {collection?.icon} {collection?.name}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/15 bg-white/5 text-zinc-200" onClick={exportMarkdownCollection}>
              <Download className="mr-2 h-4 w-4" />
              Export MD
            </Button>
            <Button variant="outline" className="border-white/15 bg-white/5 text-zinc-200" onClick={exportPdfCollection}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button className="bg-sky-400 text-black hover:bg-sky-300" onClick={shareCollection}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search within collection"
          className="mt-3 w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-zinc-200"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((item) => (
          <article key={item.id} className="rounded-xl border border-[#1f2937] bg-[#0b1220]/80 p-4">
            <p className="text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
            <h2 className="mt-1 text-sm font-medium text-white">{item.query}</h2>
            <p className="mt-2 text-sm text-zinc-300">{item.answer.tldr}</p>
            <p className="mt-2 text-xs text-zinc-500">{item.answer.sources.length} sources • confidence {item.answer.confidence}%</p>
            <Link
              href={`/dashboard/research/items/${item.id}`}
              className="mt-3 inline-flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200"
            >
              Open detail page
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
