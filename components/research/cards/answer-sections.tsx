'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

import type { StructuredResearchResponse } from '@/lib/research/schemas';

interface AnswerSectionsProps {
  sections: StructuredResearchResponse['answer_sections'];
  onCitationClick: (id: number) => void;
}

function evidenceMeta(v: string): { stripeClass: string; badgeClasses: string; dotClass: string; label: string } {
  if (v === 'strong')   return { stripeClass: 'rh-evidence-strong',   badgeClasses: 'bg-emerald-500/12 text-emerald-500 border-emerald-500/40', dotClass: 'bg-emerald-500', label: 'Strong evidence' };
  if (v === 'moderate') return { stripeClass: 'rh-evidence-moderate', badgeClasses: 'bg-amber-500/12 text-amber-500 border-amber-500/40', dotClass: 'bg-amber-500', label: 'Moderate evidence' };
  return { stripeClass: 'rh-evidence-weak', badgeClasses: 'bg-rose-500/12 text-rose-500 border-rose-500/40', dotClass: 'bg-rose-500', label: 'Weak evidence' };
}

function renderCitationAwareText(text: string, onCitationClick: (id: number) => void) {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (!match) return <span key={i}>{part}</span>;
    const id = Number(match[1]);
    return (
      <button
        key={i}
        type="button"
        onClick={() => onCitationClick(id)}
        className="rh-citation"
      >
        {id}
      </button>
    );
  });
}

export function AnswerSections({ sections, onCitationClick }: AnswerSectionsProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <section className="space-y-3">
      {sections.map((section, index) => {
        const key = `${section.heading}-${index}`;
        const isOpen = expanded[key] ?? true;
        const ev = evidenceMeta(section.evidence_strength);

        return (
          <motion.article
            key={key}
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
            className="relative rounded-xl border border-white/5 bg-[#0d1117] shadow-md mb-6"
          >
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <h3 className="font-sans text-lg md:text-xl font-bold text-sky-50 leading-snug">{section.heading}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${ev.badgeClasses}`}
                  >
                    {ev.label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="font-serif text-sm md:text-base leading-relaxed text-zinc-300 text-justify space-y-4">
                {renderCitationAwareText(section.content, onCitationClick)}
              </div>

              {/* Citation pills */}
              {section.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-600 self-center mr-1">Sources:</span>
                  {section.citations.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onCitationClick(c)}
                      className="rh-citation"
                    >
                      [{c}]
                    </button>
                  ))}
                </div>
              )}

              {/* Key points toggle */}
              {section.key_points.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setExpanded((p) => ({ ...p, [key]: !isOpen }))}
                    className="mt-4 flex items-center gap-1.5 text-xs font-medium transition-colors text-[#00d4aa]"
                  >
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {isOpen ? 'Hide key points' : `Show ${section.key_points.length} key points`}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="mt-3 overflow-hidden"
                      >
                        <ul className="space-y-1.5 pl-4">
                        {section.key_points.map((point, pi) => (
                          <li
                            key={pi}
                            className="flex items-start gap-3 font-serif text-sm md:text-base text-zinc-300"
                          >
                            <div
                              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${ev.dotClass}`}
                            />
                            <span className="leading-relaxed text-justify">{point}</span>
                          </li>
                        ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}
