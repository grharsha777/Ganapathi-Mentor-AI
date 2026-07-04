'use client';

import type { StructuredResearchResponse } from '@/lib/research/schemas';

interface PublicationPanelProps {
  publication: StructuredResearchResponse['publication'];
}

export function PublicationPanel({ publication }: PublicationPanelProps) {
  return (
    <section className="rounded-2xl border border-[#1f2937] bg-[#0b1220]/80 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Publication Draft</p>
      <h3 className="mt-2 text-lg font-semibold text-zinc-100">{publication.title}</h3>
      {publication.abstract && <p className="mt-2 text-sm text-zinc-300">{publication.abstract}</p>}

      {publication.methodology.length > 0 && (
        <div className="mt-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Methodology</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
            {publication.methodology.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      {publication.key_takeaways.length > 0 && (
        <div className="mt-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Key Takeaways</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
            {publication.key_takeaways.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
