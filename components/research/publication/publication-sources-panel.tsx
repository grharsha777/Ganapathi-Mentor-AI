'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Quote, LibraryBig, CheckCircle } from 'lucide-react';

import type { StructuredResearchResponse } from '@/lib/research/schemas';

interface PublicationSourcesPanelProps {
  sources: StructuredResearchResponse['sources'];
}

type CitationStyle = 'apa' | 'mla' | 'chicago' | 'ieee';

export function PublicationSourcesPanel({ sources }: PublicationSourcesPanelProps) {
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('apa');

  if (sources.length === 0) {
    return (
      <aside className="h-full w-full border-l p-4"
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(5,5,10,0.4)' }}>
        <div className="flex flex-col items-center justify-center pt-20 text-center">
          <LibraryBig className="h-8 w-8 text-slate-700" />
          <p className="mt-3 text-sm font-medium text-slate-400">No sources yet</p>
          <p className="mt-1 text-xs text-slate-600">Generated documents will list citations here.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-full flex-col border-l"
      style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(13,13,20,0.9)' }}>
      
      {/* Header */}
      <div className="flex flex-col gap-3 border-b p-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bibliography</h3>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
            {sources.length} cited
          </span>
        </div>

        {/* Format Select */}
        <div className="flex items-center justify-between gap-2">
          <select
            value={citationStyle}
            onChange={(e) => setCitationStyle(e.target.value as CitationStyle)}
            className="rounded-lg border px-2 py-1.5 text-xs text-slate-300 outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <option value="apa">APA 7th</option>
            <option value="mla">MLA 9th</option>
            <option value="chicago">Chicago</option>
            <option value="ieee">IEEE</option>
          </select>

          <button className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 transition-colors hover:bg-white/5"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <Download className="h-3 w-3" /> BibTeX
          </button>
        </div>
      </div>

      {/* Sources List */}
      <div className="rh-scroll flex-1 overflow-y-auto p-3 space-y-3">
        {sources.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative rounded-xl border p-3 transition-colors hover:border-teal-500/30 hover:bg-teal-500/5"
            style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
          >
            {/* Number pill */}
            <div className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
              style={{ background: '#0d0d14', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.4)' }}>
              {s.id}
            </div>

            <p className="text-[13px] font-medium leading-snug text-slate-200 line-clamp-2">
              {s.title}
            </p>

            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
              <span className="truncate">{s.domain}</span>
              <span>•</span>
              <span>{s.published_date || 'n.d.'}</span>
            </div>

            {s.provider_type === 'academic' && (
              <div className="mt-2 flex items-center gap-1 text-[10px] text-violet-400">
                <CheckCircle className="h-3 w-3" /> Peer-reviewed
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <a href={s.url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-[10px] text-slate-300 hover:text-white">
                <ExternalLink className="h-3 w-3" /> Visit
              </a>
              <button className="flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-[10px] text-slate-300 hover:text-white">
                <Quote className="h-3 w-3" /> Copy Citation
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </aside>
  );
}
