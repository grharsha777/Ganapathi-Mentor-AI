'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bookmark, RefreshCw, Sparkles, ArrowRightCircle } from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

import type { LearningRoadmap } from '@/lib/learning/types';

export function LearningCommandBar({
  roadmap,
  onGenerate,
  onRefresh,
  onJumpToWeek,
  onOpenBookmarks,
}: {
  roadmap: LearningRoadmap | null;
  onGenerate: () => void;
  onRefresh: () => void;
  onJumpToWeek: (week: number) => void;
  onOpenBookmarks: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const weeks = useMemo(() => {
    if (!roadmap) return [];
    return roadmap.milestones.map((m) => ({ week: m.week, title: m.title }));
  }, [roadmap]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-sky-400/30 hover:bg-black/30"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="truncate">Search, jump, or run an action</span>
          <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-400">
            Ctrl K
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Generate streams, jump to weeks, open bookmarks.
        </p>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type an action or a week…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                onGenerate();
              }}
            >
              <Sparkles className="h-4 w-4 text-sky-300" />
              Generate new stream
              <CommandShortcut>G</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                onRefresh();
              }}
            >
              <RefreshCw className="h-4 w-4 text-zinc-300" />
              Refresh from server
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                onOpenBookmarks();
              }}
            >
              <Bookmark className="h-4 w-4 text-amber-300" />
              Open saved resources
            </CommandItem>
          </CommandGroup>

          {weeks.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Jump to week">
                {weeks.slice(0, 12).map((entry) => (
                  <CommandItem
                    key={entry.week}
                    onSelect={() => {
                      setOpen(false);
                      onJumpToWeek(entry.week);
                    }}
                  >
                    <ArrowRightCircle className="h-4 w-4 text-emerald-200" />
                    Week {entry.week}
                    <span className="ml-2 truncate text-xs text-zinc-500">{entry.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

