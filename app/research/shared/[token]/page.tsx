'use client';

import { use, useEffect, useState } from 'react';

import { SourcesGrid } from '@/components/research/cards/sources-grid';
import { TldrBanner } from '@/components/research/cards/tldr-banner';

import type { StructuredResearchResponse } from '@/lib/research/schemas';

type SharedItem = {
  id: string;
  query: string;
  answer: StructuredResearchResponse;
  createdAt: string;
};

type SharedPayload = {
  collection: {
    id: string;
    name: string;
    icon: string;
    color: string;
    expiresAt: string;
  };
  items: SharedItem[];
};

export default function SharedCollectionPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<SharedPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`/api/research/public/${resolvedParams.token}`);
      if (!response.ok) {
        setError('Share link is invalid or expired');
        return;
      }

      setData((await response.json()) as SharedPayload);
    };

    load().catch(() => setError('Unable to load shared collection'));
  }, [resolvedParams.token]);

  if (error) {
    return <div className="mx-auto mt-16 max-w-3xl rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">{error}</div>;
  }

  if (!data) {
    return <div className="mx-auto mt-16 max-w-3xl rounded-xl border border-white/10 bg-[#111118]/85 p-6 text-zinc-400">Loading shared collection...</div>;
  }

  return (
    <main className="mx-auto mt-10 max-w-6xl space-y-4 px-4 pb-12">
      <header className="rounded-2xl border border-white/10 bg-[#111118]/85 p-5">
        <h1 className="text-xl font-semibold text-white">
          {data.collection.icon} {data.collection.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">View-only shared research collection</p>
      </header>

      <div className="space-y-4">
        {data.items.map((item) => (
          <article key={item.id} className="rounded-xl border border-white/10 bg-[#111118]/85 p-4">
            <p className="text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
            <h2 className="mt-1 text-sm font-medium text-white">{item.query}</h2>
            <div className="mt-2">
              <TldrBanner tldr={item.answer.tldr} confidence={item.answer.confidence} />
            </div>
            <p className="mt-2 text-xs text-zinc-500">{item.answer.sources.length} sources</p>
            <div className="mt-3 max-h-[28vh] overflow-y-auto pr-1">
              <SourcesGrid sources={item.answer.sources.slice(0, 6)} />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
