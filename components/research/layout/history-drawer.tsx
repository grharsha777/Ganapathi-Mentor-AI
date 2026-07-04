'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookmarkCheck, Clock, Pin, Search, X, Zap } from 'lucide-react';

import type { ResearchHistoryItem } from '@/lib/research/client';
import type { ResearchMode } from '@/lib/research/schemas';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  history: ResearchHistoryItem[];
  historyQuery: string;
  setHistoryQuery: (v: string) => void;
  onSelectHistory: (item: ResearchHistoryItem) => void;
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function groupByDate(items: ResearchHistoryItem[]): Array<{ date: string; items: ResearchHistoryItem[] }> {
  const map = new Map<string, ResearchHistoryItem[]>();
  for (const item of items) {
    const label = dateLabel(item.createdAt);
    const arr = map.get(label) ?? [];
    arr.push(item);
    map.set(label, arr);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

const MODE_COLORS: Record<ResearchMode, { bg: string; text: string; border: string }> = {
  quick:       { bg: 'rgba(16,185,129,0.12)', text: '#10b981', border: 'rgba(16,185,129,0.3)' },
  deep:        { bg: 'rgba(0,212,170,0.12)',  text: '#00d4aa', border: 'rgba(0,212,170,0.3)'  },
  comparative: { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  academic:    { bg: 'rgba(139,92,246,0.12)', text: '#8b5cf6', border: 'rgba(139,92,246,0.3)' },
  news:        { bg: 'rgba(249,115,22,0.12)', text: '#f97316', border: 'rgba(249,115,22,0.3)' },
  publication_labs: { bg: 'rgba(236,72,153,0.12)', text: '#ec4899', border: 'rgba(236,72,153,0.3)' },
};

export function HistoryDrawer({
  open,
  onClose,
  history,
  historyQuery,
  setHistoryQuery,
  onSelectHistory,
}: HistoryDrawerProps) {
  const groups = groupByDate(history);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="history-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="history-drawer"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed left-0 top-0 z-50 flex h-full w-80 flex-col border-r"
            style={{
              background: 'linear-gradient(180deg, #0d0d14 0%, #05050a 100%)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#00d4aa]" />
                <h2 className="text-sm font-semibold text-white">Research History</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close history drawer"
                title="Close"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3">
              <div
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2"
              >
                <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <input
                  type="text"
                  value={historyQuery}
                  onChange={(e) => setHistoryQuery(e.target.value)}
                  placeholder="Search sessions..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Session list */}
            <div className="rh-scroll flex-1 overflow-y-auto px-3 pb-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/20"
                  >
                    <Zap className="h-5 w-5 text-[#00d4aa]" />
                  </div>
                  <p className="text-xs text-slate-500">No research sessions yet.<br />Run your first query to get started.</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.date} className="mb-4">
                    <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      {group.date}
                    </p>
                    <div className="space-y-1.5">
                      {group.items.map((item, idx) => {
                        const modeStyle = MODE_COLORS[item.mode] ?? MODE_COLORS.deep;
                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            type="button"
                            onClick={() => { onSelectHistory(item); onClose(); }}
                            className="group w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-150"
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              borderColor: 'rgba(255,255,255,0.07)',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,170,0.25)';
                              (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,170,0.05)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-xs font-medium text-white">{item.query}</p>
                              <div className="flex shrink-0 gap-1.5">
                                <span
                                  className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                                  style={{
                                    background: modeStyle.bg,
                                    color: modeStyle.text,
                                    border: `1px solid ${modeStyle.border}`,
                                  }}
                                >
                                  {item.mode}
                                </span>
                              </div>
                            </div>

                            {item.answer?.tldr && (
                              <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-slate-500">
                                {item.answer.tldr}
                              </p>
                            )}

                            <div className="mt-2 flex items-center justify-between">
                              <p className="text-[10px] text-slate-600">
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <Pin className="h-3 w-3 text-slate-500 hover:text-teal-400" />
                                <BookmarkCheck className="h-3 w-3 text-slate-500 hover:text-teal-400" />
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer stat */}
            <div
              className="border-t border-white/[0.07] px-5 py-3"
            >
              <p className="text-[10px] text-slate-600">
                {history.length} session{history.length !== 1 ? 's' : ''} in history
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
