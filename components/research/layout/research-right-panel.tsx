'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Share2, Plus, FolderOpen } from 'lucide-react';

import { SourcesGrid } from '@/components/research/cards/sources-grid';

import type { CollectionSummary } from '@/lib/research/client';
import type { StructuredResearchResponse } from '@/lib/research/schemas';

interface RightPanelProps {
  answer: StructuredResearchResponse | null;
  highlightedCitation: number | null;
  collections: CollectionSummary[];
  selectedCollectionIds: string[];
  setSelectedCollectionIds: (ids: string[]) => void;
  onSaveToCollections: () => void;
  onShareCollection: (id: string) => void;
  onCreateCollection: () => void;
  newCollectionName: string;
  setNewCollectionName: (v: string) => void;
  newCollectionColor: string;
  setNewCollectionColor: (v: string) => void;
  newCollectionIcon: string;
  setNewCollectionIcon: (v: string) => void;
  creatingCollection: boolean;
}

function ConfidenceGauge({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? '#10b981' : value >= 50 ? '#f59e0b' : '#f43f5e';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-1.5 rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}80)`, boxShadow: `0 0 6px ${color}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function ResearchRightPanel({
  answer,
  highlightedCitation,
  collections,
  selectedCollectionIds,
  setSelectedCollectionIds,
  onSaveToCollections,
  onShareCollection,
  onCreateCollection,
  newCollectionName,
  setNewCollectionName,
  newCollectionColor,
  setNewCollectionColor,
  newCollectionIcon,
  setNewCollectionIcon,
  creatingCollection,
}: RightPanelProps) {
  const [sourceFilter, setSourceFilter] = useState('');
  const [minReliability, setMinReliability] = useState(0);

  const filteredSources = useMemo(() => {
    if (!answer) return [];
    return answer.sources.filter((s) => {
      const q = sourceFilter.trim().toLowerCase();
      return (
        (!q || s.title.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)) &&
        s.reliability >= minReliability
      );
    });
  }, [answer, sourceFilter, minReliability]);

  const panelBox = (children: React.ReactNode) => (
    <div
      className="rounded-2xl border p-4"
      style={{ background: 'rgba(13,13,20,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {children}
    </div>
  );

  const sectionLabel = (text: string) => (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">{text}</p>
  );

  return (
    <aside className="rh-scroll h-full space-y-4 overflow-y-auto">

      {/* Confidence Breakdown */}
      {answer && panelBox(
        <>
          {sectionLabel('Confidence Breakdown')}
          <div className="space-y-3">
            <ConfidenceGauge label="Factual accuracy" value={answer.confidence_breakdown.factual} />
            <ConfidenceGauge label="Recency" value={answer.confidence_breakdown.recency} />
            <ConfidenceGauge label="Source quality" value={answer.confidence_breakdown.source_quality} />
          </div>
          {answer.query_focus && (
            <p className="mt-3 text-[11px] leading-5 text-slate-500">
              <span className="font-semibold text-slate-400">Focus: </span>{answer.query_focus}
            </p>
          )}
        </>
      )}

      {/* Collections */}
      {panelBox(
        <>
          {sectionLabel('Collections')}
          <div className="space-y-1.5">
            {collections.map((col) => {
              const checked = selectedCollectionIds.includes(col.id);
              return (
                <label
                  key={col.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors"
                  style={{
                    background: checked ? 'rgba(0,212,170,0.06)' : 'rgba(255,255,255,0.03)',
                    borderColor: checked ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.07)',
                  }}
                >
                  <span className="flex items-center gap-2 text-slate-200">
                    <span>{col.icon}</span>
                    <span className="truncate">{col.name}</span>
                    <span className="text-[10px] text-slate-600">({col.itemCount})</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelectedCollectionIds(
                        checked ? selectedCollectionIds.filter((id) => id !== col.id) : [...selectedCollectionIds, col.id],
                      )
                    }
                    className="accent-teal-400"
                  />
                </label>
              );
            })}
          </div>

          <button
            onClick={onSaveToCollections}
            disabled={!answer}
            className="mt-3 w-full rounded-xl py-2.5 text-sm font-semibold text-black transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #3b82f6)', boxShadow: answer ? '0 0 20px rgba(0,212,170,0.25)' : 'none' }}
          >
            Save Result
          </button>

          {/* Share buttons */}
          {collections.slice(0, 2).map((col) => (
            <button
              key={col.id}
              onClick={() => onShareCollection(col.id)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-xs text-slate-300 transition-colors hover:border-teal-500/40 hover:text-teal-300"
              style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
            >
              <Share2 className="h-3.5 w-3.5" /> Share {col.icon} {col.name}
            </button>
          ))}

          {/* Create collection */}
          <div className="mt-4 space-y-2 rounded-xl border p-3"
            style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] text-slate-500 font-medium">New collection</p>
            <input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name..."
              className="w-full rounded-lg border px-3 py-2 text-xs text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', caretColor: '#00d4aa' }}
            />
            <div className="flex items-center gap-2">
              <input
                value={newCollectionIcon}
                onChange={(e) => setNewCollectionIcon(e.target.value)}
                className="w-12 rounded-lg border px-2 py-2 text-xs text-white outline-none text-center"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
              />
              <input
                type="color"
                value={newCollectionColor}
                onChange={(e) => setNewCollectionColor(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border p-0.5"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
              />
              <button
                onClick={onCreateCollection}
                className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-black"
                style={{ background: 'linear-gradient(135deg, #00d4aa, #3b82f6)' }}
              >
                {creatingCollection ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Create
              </button>
            </div>
          </div>
        </>
      )}

      {/* Source Explorer */}
      {panelBox(
        <>
          {sectionLabel('Source Explorer')}
          <div className="space-y-2 mb-3">
            <input
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              placeholder="Filter by title or domain..."
              className="w-full rounded-lg border px-3 py-2 text-xs text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', caretColor: '#00d4aa' }}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Min reliability: <span className="text-teal-400 font-semibold">{minReliability}%</span></span>
              <span>{filteredSources.length} sources</span>
            </div>
            <input
              type="range"
              min={0} max={100}
              value={minReliability}
              onChange={(e) => setMinReliability(Number(e.target.value))}
              className="w-full accent-teal-400"
            />
          </div>

          {filteredSources.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <FolderOpen className="h-8 w-8 text-slate-700" />
              <p className="text-xs text-slate-600">Run a query to see sources here.</p>
            </div>
          ) : (
            <div className="rh-scroll max-h-[48vh] overflow-y-auto pr-1">
              <SourcesGrid sources={filteredSources} highlightedId={highlightedCitation ?? undefined} />
            </div>
          )}
        </>
      )}
    </aside>
  );
}
