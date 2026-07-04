'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown, ChevronUp, Tag } from 'lucide-react';

import type { StructuredResearchResponse } from '@/lib/research/schemas';

interface SourcesGridProps {
  sources: StructuredResearchResponse['sources'];
  highlightedId?: number;
}

function domainFromUrl(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return 'unknown'; }
}

const PROVIDER_TYPE_META: Record<string, { label: string; bg: string; color: string }> = {
  academic: { label: 'Academic',  bg: 'rgba(139,92,246,0.15)',  color: '#8b5cf6' },
  web:      { label: 'Web',       bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6' },
  news:     { label: 'News',      bg: 'rgba(249,115,22,0.15)',  color: '#f97316' },
  code:     { label: 'Code',      bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  mock:     { label: 'Demo',      bg: 'rgba(255,255,255,0.08)', color: '#94a3b8' },
};

function reliabilityColor(r: number) {
  if (r >= 80) return '#10b981';
  if (r >= 55) return '#f59e0b';
  return '#f43f5e';
}

function extractKeywords(snippet: string): string[] {
  const words = snippet
    .replace(/[^a-zA-Z\s-]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 5)
    .slice(0, 5);
  return [...new Set(words)];
}

export function SourcesGrid({ sources, highlightedId }: SourcesGridProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <section id="sources-panel" className="space-y-3">
      {sources.map((source, idx) => {
        const domain = source.domain || domainFromUrl(source.url);
        const highlighted = highlightedId === source.id;
        const expanded = expandedId === source.id;
        const providerMeta = PROVIDER_TYPE_META[source.provider_type ?? 'web'] ?? PROVIDER_TYPE_META.web;
        const relColor = reliabilityColor(source.reliability);
        const keywords = extractKeywords(source.snippet);

        return (
          <motion.article
            key={source.id}
            id={`source-${source.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.3 }}
            className="rh-card-hover rounded-xl border overflow-hidden"
            style={{
              background: highlighted ? 'rgba(0,212,170,0.06)' : 'rgba(13,13,20,0.9)',
              borderColor: highlighted ? 'rgba(0,212,170,0.4)' : 'rgba(255,255,255,0.07)',
              boxShadow: highlighted ? '0 0 20px rgba(0,212,170,0.1)' : 'none',
            }}
          >
            <div className="p-3">
              {/* Top row: number, domain, provider badge, reliability */}
              <div className="flex items-center gap-2">
                {/* Source number */}
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                  style={{ background: 'rgba(0,212,170,0.12)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.25)' }}
                >
                  {source.id}
                </div>

                {/* Domain & provider */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-slate-300">{domain}</p>
                  <p className="text-[10px] text-slate-600">{source.provider}</p>
                </div>

                {/* Provider type badge */}
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                  style={{ background: providerMeta.bg, color: providerMeta.color, border: `1px solid ${providerMeta.color}30` }}
                >
                  {providerMeta.label}
                </span>

                {/* Reliability score */}
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: `${relColor}18`, color: relColor, border: `1px solid ${relColor}35` }}
                >
                  {source.reliability}%
                </span>
              </div>

              {/* Title */}
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 block text-sm font-semibold text-white transition-colors hover:text-teal-300 line-clamp-2"
              >
                {source.title}
              </a>

              {/* Date & snippet */}
              <p className="mt-1 text-[10px] text-slate-600">{source.published_date ?? 'Unknown date'}</p>
              <p className="mt-2 text-xs text-slate-400 line-clamp-2">{source.snippet}</p>

              {/* Reliability bar */}
              <div className="mt-3 h-1 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-1 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${relColor}, ${relColor}80)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${source.reliability}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.06 }}
                />
              </div>

              {/* Keyword tags */}
              {keywords.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  <Tag className="h-3 w-3 text-slate-600 self-center" />
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded px-1.5 py-0.5 text-[9px] text-slate-500"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {kw.toLowerCase()}
                    </span>
                  ))}
                </div>
              )}

              {/* View details / collapse */}
              <div className="mt-3 flex items-center justify-between">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium transition-colors"
                  style={{ color: '#00d4aa' }}
                >
                  Open source <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : source.id)}
                  className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-300"
                >
                  {expanded ? <><ChevronUp className="h-3.5 w-3.5" />Less</> : <><ChevronDown className="h-3.5 w-3.5" />Details</>}
                </button>
              </div>

              {/* Expanded detail panel */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-3 rounded-lg p-3 text-xs text-slate-400 space-y-1.5"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <p><span className="text-slate-500 font-medium">Evidence type:</span> {source.evidence_type ?? '—'}</p>
                      <p><span className="text-slate-500 font-medium">Provider type:</span> {source.provider_type ?? '—'}</p>
                      <p className="leading-5"><span className="text-slate-500 font-medium">Snippet:</span> {source.snippet}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}
