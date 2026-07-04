'use client';

import Link from 'next/link';

import type { CollectionSummary, ResearchHistoryItem } from '@/lib/research/client';

interface LeftSidebarProps {
  history: ResearchHistoryItem[];
  historyQuery: string;
  setHistoryQuery: (value: string) => void;
  onSelectHistory: (item: ResearchHistoryItem) => void;
  collections: CollectionSummary[];
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function groupByDate(items: ResearchHistoryItem[]): Array<{ date: string; items: ResearchHistoryItem[] }> {
  const grouped = new Map<string, ResearchHistoryItem[]>();
  for (const item of items) {
    const label = dateLabel(item.createdAt);
    const current = grouped.get(label) ?? [];
    current.push(item);
    grouped.set(label, current);
  }

  return Array.from(grouped.entries()).map(([date, groupedItems]) => ({ date, items: groupedItems }));
}

export function ResearchLeftSidebar({
  history,
  historyQuery,
  setHistoryQuery,
  onSelectHistory,
  collections,
}: LeftSidebarProps) {
  const groupedHistory = groupByDate(history);

  return (
    <aside className="h-full rounded-2xl border border-white/10 bg-[#111118]/85 p-4 backdrop-blur-xl">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">History</h3>
      <input
        value={historyQuery}
        onChange={(event) => setHistoryQuery(event.target.value)}
        placeholder="Search history"
        className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
      />

      <div className="mt-3 max-h-[40vh] space-y-2 overflow-y-auto pr-1">
        {groupedHistory.map((group) => (
          <div key={group.date} className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">{group.date}</p>
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectHistory(item)}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left hover:border-[#00D4AA]/35"
              >
                <p className="truncate text-sm font-medium text-zinc-100">{item.query}</p>
                <p className="mt-1 text-[11px] text-zinc-500">{new Date(item.createdAt).toLocaleTimeString()}</p>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Collections</h3>
        <div className="mt-3 max-h-[32vh] space-y-2 overflow-y-auto pr-1">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/dashboard/research/collections/${collection.id}`}
              className="block rounded-lg border border-white/10 bg-black/20 px-3 py-2 hover:border-[#00D4AA]/35"
            >
              <p className="text-sm text-zinc-200">
                <span className="mr-2">{collection.icon}</span>
                {collection.name}
              </p>
              <p className="text-[11px] text-zinc-500">{collection.itemCount} items</p>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
