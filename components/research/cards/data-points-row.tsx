'use client';

import type { StructuredResearchResponse } from '@/lib/research/schemas';

interface DataPointsRowProps {
  dataPoints: StructuredResearchResponse['data_points'];
}

export function DataPointsRow({ dataPoints }: DataPointsRowProps) {
  if (!dataPoints.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[#1f2937] bg-[#0b1220]/80 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Key Data Points</p>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {dataPoints.map((point, index) => (
          <div key={`${point.label}-${point.value}-${index}`} className="min-w-[220px] rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">{point.label}</p>
            <p className="mt-1 text-lg font-semibold text-sky-100">{point.value}</p>
            <p className="mt-2 text-xs text-zinc-400">{point.context}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
