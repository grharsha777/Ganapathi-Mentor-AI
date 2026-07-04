'use client';

import type { StructuredResearchResponse } from '@/lib/research/schemas';

interface BibliographyListProps {
  bibliography: StructuredResearchResponse['bibliography'];
}

function parseCitationForLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sky-400 hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export function BibliographyList({ bibliography }: BibliographyListProps) {
  if (!bibliography.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[#1f2937] bg-[#0b1220]/80 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Bibliography</p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs text-zinc-300">
        {bibliography.map((entry) => (
          <li key={`${entry.source_id}-${entry.citation}`}>
            {parseCitationForLinks(entry.citation)}
          </li>
        ))}
      </ol>
    </section>
  );
}
