'use client';

import { AGENT_ROLES, ROLE_LABELS } from '@/lib/research/orchestration/roles';

interface StageTimelineProps {
  events: Array<{ stage: string; status?: string; [key: string]: unknown }>;
  loading: boolean;
}

const LEGACY_STAGES = ['query_intelligence', 'retrieval', 'synthesis', 'rendering'];

function tone(status: string): string {
  if (status === 'completed') return 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10';
  if (status === 'running') return 'text-cyan-200 border-cyan-300/40 bg-cyan-500/10';
  if (status === 'failed') return 'text-red-300 border-red-400/40 bg-red-500/10';
  return 'text-zinc-400 border-white/10 bg-black/25';
}

function labelFor(stage: string): string {
  if (stage in ROLE_LABELS) {
    return ROLE_LABELS[stage as keyof typeof ROLE_LABELS];
  }

  return stage.replace(/_/g, ' ');
}

export function StageTimeline({ events, loading }: StageTimelineProps) {
  if (!loading && events.length === 0) {
    return null;
  }

  const orderedStages = events.some((entry) => AGENT_ROLES.includes(entry.stage as (typeof AGENT_ROLES)[number]))
    ? AGENT_ROLES
    : LEGACY_STAGES;

  return (
    <section className="rounded-2xl border border-[#1f2937] bg-[#0f172a]/80 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Multi-Agent Orchestration</p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {orderedStages.map((stage) => {
          const event = events.filter((entry) => entry.stage === stage).at(-1);
          const status = event?.status ?? (loading ? 'queued' : 'idle');

          return (
            <div key={stage} className={`rounded-lg border px-3 py-2 text-xs ${tone(String(status))}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{labelFor(stage)}</span>
                <span className="uppercase tracking-[0.12em]">{String(status)}</span>
              </div>
              {typeof event?.summary === 'string' && (
                <p className="mt-1 text-[11px] text-zinc-300">{event.summary}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
