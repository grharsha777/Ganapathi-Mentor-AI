'use client';

interface ResearchGapsProps {
  gaps: string[];
}

export function ResearchGaps({ gaps }: ResearchGapsProps) {
  if (!gaps.length) {
    return null;
  }

  return (
    <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-md p-6 md:p-8 mb-6">
      <h3 className="font-sans text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-amber-500/90 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-pulse"></span>
        Research Gaps & Future Directions
      </h3>
      <ul className="space-y-3">
        {gaps.map((gap) => (
          <li key={gap} className="flex items-start gap-3">
            <span className="mt-2 w-1.5 h-1.5 shrink-0 rounded-full bg-amber-500/50"></span>
            <span className="font-serif text-sm md:text-base leading-relaxed text-zinc-300 text-justify">{gap}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
