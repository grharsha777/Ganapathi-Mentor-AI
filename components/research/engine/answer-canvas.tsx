'use client';

import { useState } from 'react';
import { BookOpenText, Copy, Download, FileJson, FileText, Loader2, Share, RotateCcw, ThumbsUp, ThumbsDown, BookmarkPlus, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { AnswerSections } from '@/components/research/cards/answer-sections';
import { BibliographyList } from '@/components/research/cards/bibliography-list';
import { DataPointsRow } from '@/components/research/cards/data-points-row';
import { FollowUpChips } from '@/components/research/cards/follow-up-chips';
import { KeyClaims } from '@/components/research/cards/key-claims';
import { PublicationPanel } from '@/components/research/cards/publication-panel';
import { ResearchGaps } from '@/components/research/cards/research-gaps';
import { StageTimeline } from '@/components/research/cards/stage-timeline';
import { TldrBanner } from '@/components/research/cards/tldr-banner';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import type { CollectionSummary } from '@/lib/research/client';
import type { StructuredResearchResponse } from '@/lib/research/schemas';
import type { ResearchMode } from '@/lib/research/schemas';

interface AnswerCanvasProps {
  loading: boolean;
  answer: StructuredResearchResponse | null;
  events: Array<{ stage: string; status?: string; [key: string]: unknown }>;
  streamedPreview: string;
  metadata: Record<string, unknown>;
  mode: ResearchMode;
  exportingPdf: boolean;
  onFollowUp: (query: string) => void;
  onCitationClick: (id: number) => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onExportPdf: () => void;
  onExportRichText: () => void;
  onShare?: () => void;
  onRedo?: () => void;
  onCollection?: () => void;
  collections?: CollectionSummary[];
  selectedCollectionIds?: string[];
  setSelectedCollectionIds?: (ids: string[]) => void;
}

function OrbitLoader() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center">
      <div className="absolute h-10 w-10 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.6) 0%, transparent 70%)', filter: 'blur(8px)', animation: 'rh-float-c 3s ease-in-out infinite' }} />
      <div className="absolute h-1.5 w-1.5 rounded-full bg-[#00d4aa] shadow-[0_0_8px_#00d4aa]" style={{ top: '50%', left: '50%', marginTop: -3, marginLeft: -3, transformOrigin: '3px 3px', animation: 'rh-orbit-1 2.4s linear infinite' }} />
      <div className="absolute h-1 w-1 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" style={{ top: '50%', left: '50%', marginTop: -2, marginLeft: -2, transformOrigin: '2px 2px', animation: 'rh-orbit-2 3.2s linear infinite' }} />
      <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/40">
        <Loader2 className="h-2 w-2 animate-spin text-[#00d4aa]" />
      </div>
    </div>
  );
}

export function AnswerCanvas({
  loading,
  answer,
  events,
  streamedPreview,
  metadata,
  mode,
  exportingPdf,
  onFollowUp,
  onCitationClick,
  onExportMarkdown,
  onExportJson,
  onExportPdf,
  onExportRichText,
  onShare,
  onRedo,
  onCollection,
  collections = [],
  selectedCollectionIds = [],
  setSelectedCollectionIds,
}: AnswerCanvasProps) {
  const [logsExpanded, setLogsExpanded] = useState(false);
  const cacheHit = metadata.cacheHit === true;

  return (
    <main id="research-answer-canvas" className="space-y-6">
      
      {/* Thinking State */}
      {(loading || events.length > 0) && !answer && (
        <div className="rounded-2xl border border-white/5 bg-[#0b1220]/80 overflow-hidden transition-all">
          <button 
            onClick={() => setLogsExpanded(!logsExpanded)}
            className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
          >
            {loading ? <OrbitLoader /> : <Activity className="h-5 w-5 text-[#00d4aa]" />}
            <span className="text-sm font-medium text-slate-200">
              {loading ? 'Researching and synthesizing...' : 'Research complete'}
            </span>
            <div className="ml-auto text-slate-500">
              {logsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </button>
          
          <AnimatePresence>
            {logsExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden border-t border-white/5 bg-black/20"
              >
                <div className="p-4">
                  <StageTimeline events={events} loading={loading} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {loading && streamedPreview && (
        <section className="rounded-2xl border border-[#1f2937] bg-[#0b1220]/80 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Live Draft</p>
          <p className="mt-2 text-sm leading-7 text-zinc-200">{streamedPreview}</p>
        </section>
      )}

      {answer && (
        <div className="space-y-6">
          <TldrBanner 
            tldr={answer.tldr} 
            methodologySummary={answer.methodology_summary} 
            confidence={answer.confidence} 
            sourcesCount={answer.sources.length} 
          />

          <DataPointsRow dataPoints={answer.data_points} />
          
          <AnswerSections sections={answer.answer_sections} onCitationClick={onCitationClick} />
          <KeyClaims claims={answer.key_claims} onCitationClick={onCitationClick} />
          
          {mode === 'publication_labs' && <PublicationPanel publication={answer.publication} />}

          {mode === 'news' && answer.timeline.length > 0 && (
            <section className="rounded-2xl border border-[#1f2937] bg-[#0b1220]/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">News Timeline</p>
              <div className="mt-3 space-y-2">
                {answer.timeline.slice(0, 8).map((entry, index) => (
                  <div key={`${entry.date}-${entry.event}-${index}`} className="rounded-lg border border-white/10 bg-black/20 p-2 text-xs text-zinc-300">
                    <p className="font-medium text-white">{entry.event}</p>
                    <p className="mt-1 text-zinc-400">{entry.date}</p>
                    {entry.citation && (
                      <button
                        type="button"
                        onClick={() => onCitationClick(entry.citation as number)}
                        className="mt-1 rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-200"
                      >
                        Source [{entry.citation}]
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <ResearchGaps gaps={answer.research_gaps} />
          <BibliographyList bibliography={answer.bibliography} />

          {/* Action Bar */}
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d131f]/90 p-4 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Left side actions */}
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" className="text-slate-300 hover:text-white" onClick={onShare}>
                  <Share className="mr-2 h-4 w-4" /> Share
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-slate-300 hover:text-white" onClick={onRedo}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Redo
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                      <BookmarkPlus className="mr-2 h-4 w-4" /> Collection
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#111118] border-white/10">
                    {collections.length === 0 ? (
                      <div className="p-2 text-xs text-slate-500">No collections available</div>
                    ) : (
                      collections.map((col) => (
                        <DropdownMenuItem 
                          key={col.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10"
                          onClick={() => {
                            if (setSelectedCollectionIds) {
                              setSelectedCollectionIds([col.id]);
                              setTimeout(() => {
                                if (onCollection) onCollection();
                              }, 0);
                            }
                          }}
                        >
                          <span>{col.icon}</span>
                          <span className="text-slate-200">{col.name}</span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="mx-2 h-4 w-px bg-white/10" />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-white" onClick={() => toast.success('Feedback recorded. Thanks!')}>
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-white" onClick={() => toast.success('Feedback recorded. Thanks!')}>
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Right side: Confidence Mini Label */}
              <div className="flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                <span>Confidence:</span>
                <span className="text-teal-200">{Math.round(answer.confidence)}%</span>
              </div>
            </div>

            {/* Export Options */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <Button type="button" variant="outline" size="sm" className="border-white/15 bg-white/5 text-zinc-200" onClick={onExportMarkdown}>
                <FileText className="mr-2 h-3.5 w-3.5" /> Markdown
              </Button>
              <Button type="button" variant="outline" size="sm" className="border-white/15 bg-white/5 text-zinc-200" onClick={onExportJson}>
                <FileJson className="mr-2 h-3.5 w-3.5" /> JSON
              </Button>
              <Button type="button" variant="outline" size="sm" className="border-white/15 bg-white/5 text-zinc-200" onClick={onExportRichText}>
                <Copy className="mr-2 h-3.5 w-3.5" /> Rich Text
              </Button>
              <Button type="button" size="sm" className="bg-sky-500 text-white hover:bg-sky-400 ml-auto" onClick={onExportPdf}>
                {exportingPdf ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}
                Export PDF
              </Button>
            </div>
          </div>

          <FollowUpChips questions={answer.follow_up_questions} onClick={onFollowUp} />
        </div>
      )}
    </main>
  );
}
