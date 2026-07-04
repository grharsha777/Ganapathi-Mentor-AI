'use client';

import { CalendarRange, Flame, Gauge, RefreshCw, Sparkles, Target } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import type { LearningProgressSnapshot, LearningRoadmap } from '@/lib/learning/types';

function etaLabel(progress: LearningProgressSnapshot, roadmap: LearningRoadmap): string {
  const remainingWeeks = Math.max(0, roadmap.durationWeeks - Math.max(1, progress.currentWeek));
  if (remainingWeeks <= 0) return 'On track to finish this week';
  if (remainingWeeks === 1) return 'Estimated finish: ~1 week';
  return `Estimated finish: ~${remainingWeeks} weeks`;
}

export function LearningHeader({
  roadmap,
  progress,
  syncing,
  onOpenGenerator,
  onRefresh,
}: {
  roadmap: LearningRoadmap | null;
  progress: LearningProgressSnapshot | null;
  syncing: boolean;
  onOpenGenerator: () => void;
  onRefresh: () => void;
}) {
  const summary = useMemo(() => {
    if (!roadmap || !progress) {
      return null;
    }

    return {
      level: roadmap.level,
      week: progress.currentWeek,
      completion: progress.completionPercent,
      streak: progress.streakDays,
      xp: progress.totalXP,
      eta: etaLabel(progress, roadmap),
    };
  }, [progress, roadmap]);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#020617]/70 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Learning Stream</p>
              {summary && (
                <Badge className="border border-sky-400/30 bg-sky-500/10 text-sky-200">
                  {summary.level}
                </Badge>
              )}
            </div>
            <h1 className="mt-1 truncate text-2xl font-semibold text-white">
              {roadmap ? roadmap.role : 'Build your next skill arc'}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-zinc-400">
              {roadmap
                ? roadmap.description
                : 'Generate a validated, progression-ready roadmap with trustworthy resources and real completion tracking.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={onOpenGenerator}
              className="bg-sky-400 text-black hover:bg-sky-300"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </Button>
            <Button
              variant="outline"
              onClick={onRefresh}
              className="border-white/15 bg-white/5 text-zinc-200"
              disabled={syncing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {summary && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">Current</p>
              <p className="mt-1 text-sm font-semibold text-white">Week {summary.week}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">Progress</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{summary.completion}%</p>
                <Gauge className="h-4 w-4 text-sky-300" />
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10">
                <div className="h-1.5 rounded-full bg-sky-400" style={{ width: `${summary.completion}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">Streak</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{summary.streak} days</p>
                <Flame className="h-4 w-4 text-amber-300" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">XP</p>
              <p className="mt-1 text-sm font-semibold text-white">{summary.xp}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">Window</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{summary.eta}</p>
                <CalendarRange className="h-4 w-4 text-emerald-200" />
              </div>
            </div>
          </div>
        )}

        {progress && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-300">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-sky-300" />
                Weekly target: {progress.weeklyTargetMinutes} min
              </span>
              <span className="text-zinc-500">|</span>
              <span>{progress.completedResources}/{progress.totalResources} verified items completed</span>
            </div>
            {progress.nextMilestoneTitle && (
              <span className="text-zinc-400">Next: {progress.nextMilestoneTitle}</span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

