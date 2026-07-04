'use client';

import { BarChart3, History, Layers3, Settings2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { listModeOptions } from '@/lib/research/config';

import type { ResearchMode } from '@/lib/research/schemas';

const MODES = listModeOptions();

interface ResearchHeaderProps {
  mode: ResearchMode;
  onModeChange: (mode: ResearchMode) => void;
  onOpenHistory: () => void;
}

export function ResearchHeader({ mode, onModeChange, onOpenHistory }: ResearchHeaderProps) {
  return (
    <header className="rounded-2xl border border-[#1f2937] bg-[#0b1220]/88 px-5 py-4 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 text-[#020617]">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">Research Workspace</p>
            <p className="text-xs text-zinc-400">Publication-grade AI synthesis with agent orchestration</p>
          </div>
          <Badge className="border border-sky-400/40 bg-sky-500/15 text-sky-200">Live</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenHistory} className="border-white/15 bg-white/5 text-zinc-200">
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button variant="outline" size="sm" className="border-white/15 bg-white/5 text-zinc-200">
            <BarChart3 className="mr-2 h-4 w-4" />
            Signals
          </Button>
          <Button variant="outline" size="icon" className="border-white/15 bg-white/5 text-zinc-200">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {MODES.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onModeChange(entry.id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              mode === entry.id
                ? 'border-sky-400/70 bg-sky-500/20 text-sky-100'
                : 'border-white/15 bg-white/5 text-zinc-300 hover:border-sky-400/35'
            }`}
            title={entry.description}
            type="button"
          >
            {entry.label}
          </button>
        ))}
      </div>
    </header>
  );
}
