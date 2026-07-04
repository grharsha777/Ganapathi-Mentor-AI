'use client';

import type { StructuredResearchResponse } from '@/lib/research/schemas';

interface KeyClaimsProps {
  claims: StructuredResearchResponse['key_claims'];
  onCitationClick: (id: number) => void;
}

function verdictTone(verdict: string): string {
  if (verdict === 'supported') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200';
  if (verdict === 'mixed') return 'border-amber-400/30 bg-amber-500/10 text-amber-200';
  return 'border-rose-400/30 bg-rose-500/10 text-rose-200';
}

export function KeyClaims({ claims, onCitationClick }: KeyClaimsProps) {
  if (!claims.length) {
    return null;
  }

  return (
    <section className="rounded-xl border border-white/5 bg-[#0d1117] shadow-md p-6 md:p-8 mb-6">
      <h3 className="font-sans text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-sky-400 mb-6">
        Fact-Checked Claims
      </h3>
      <div className="space-y-4">
        {claims.map((claim, index) => (
          <article key={`${claim.claim}-${index}`} className="rounded-lg border border-white/5 bg-black/40 p-4 md:p-5">
            <div className="flex items-start justify-between gap-4">
              <p className="font-serif text-sm md:text-base font-medium text-zinc-200 leading-relaxed text-justify">{claim.claim}</p>
              <span className={`shrink-0 rounded-full border px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest ${verdictTone(claim.verdict)}`}>
                {claim.verdict}
              </span>
            </div>
            <p className="mt-3 font-serif text-sm text-zinc-400 leading-relaxed text-justify">{claim.rationale}</p>
            {claim.citations.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-1.5 items-center">
                <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-600 mr-2">Sources:</span>
                {claim.citations.map((citation) => (
                  <button
                    key={`${claim.claim}-${citation}`}
                    type="button"
                    onClick={() => onCitationClick(citation)}
                    className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 font-sans text-[11px] font-medium text-sky-200 hover:bg-sky-500/20 transition-colors"
                  >
                    [{citation}]
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
