'use client';

import { useMemo, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { LearningLevel } from '@/lib/learning/types';

const LEVELS: Array<{ value: LearningLevel; hint: string }> = [
  { value: 'Beginner', hint: 'Foundational and paced' },
  { value: 'Intermediate', hint: 'Practical and structured' },
  { value: 'Advanced', hint: 'Deep + methodology aware' },
  { value: 'Expert', hint: 'Systems-level and rigorous' },
];

const DURATIONS = [
  { weeks: 2, label: '2 weeks' },
  { weeks: 4, label: '4 weeks' },
  { weeks: 8, label: '8 weeks' },
  { weeks: 12, label: '12 weeks' },
];

export function LearningGeneratorDialog({
  open,
  onOpenChange,
  syncing,
  onGenerate,
  defaultRole,
  defaultLevel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  syncing: boolean;
  onGenerate: (payload: { role: string; level: LearningLevel; durationWeeks: number; repoUrl?: string }) => void;
  defaultRole?: string;
  defaultLevel?: LearningLevel;
}) {
  const [role, setRole] = useState(defaultRole ?? '');
  const [repoUrl, setRepoUrl] = useState('');
  const [level, setLevel] = useState<LearningLevel>(defaultLevel ?? 'Intermediate');
  const [durationWeeks, setDurationWeeks] = useState(4);

  const canGenerate = useMemo(() => role.trim().length >= 2 && !syncing, [role, syncing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-white/10 bg-[#0b1220] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Generate a new learning stream</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Resources are validated and ranked. If evidence is weak, the dashboard will say so.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role" className="text-zinc-200">Stream focus</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Full-Stack Engineer, MLOps Engineer, React + TS"
              className="border-white/10 bg-black/30 text-white placeholder:text-zinc-500"
            />
            <p className="text-xs text-zinc-500">Be specific. Include stack constraints when relevant.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="repo" className="text-zinc-200">Repo URL (optional)</Label>
            <Input
              id="repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/org/repo"
              className="border-white/10 bg-black/30 text-white placeholder:text-zinc-500"
            />
            <p className="text-xs text-zinc-500">Used later for skill-gap analysis. Safe to skip.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Level</p>
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map((entry) => (
                <button
                  key={entry.value}
                  type="button"
                  onClick={() => setLevel(entry.value)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    level === entry.value
                      ? 'border-sky-400/60 bg-sky-500/10'
                      : 'border-white/10 bg-white/5 hover:border-sky-400/20'
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{entry.value}</p>
                  <p className="mt-1 text-xs text-zinc-400">{entry.hint}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Duration</p>
            <div className="grid grid-cols-2 gap-2">
              {DURATIONS.map((entry) => (
                <button
                  key={entry.weeks}
                  type="button"
                  onClick={() => setDurationWeeks(entry.weeks)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    durationWeeks === entry.weeks
                      ? 'border-emerald-300/40 bg-emerald-500/10'
                      : 'border-white/10 bg-white/5 hover:border-emerald-300/20'
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{entry.label}</p>
                  <p className="mt-1 text-xs text-zinc-400">{entry.weeks} milestones</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            Tip: include timeframe in your stream focus for fast-moving topics.
          </p>
          <Button
            disabled={!canGenerate}
            onClick={() => {
              onGenerate({ role: role.trim(), level, durationWeeks, repoUrl: repoUrl.trim() || undefined });
              onOpenChange(false);
            }}
            className="bg-sky-400 text-black hover:bg-sky-300"
          >
            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate stream
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

