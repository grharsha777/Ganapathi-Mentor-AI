'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Printer, FileCode, CheckCircle2, FileText, Send, Loader2 } from 'lucide-react';

import type { DocSection, DocFormat } from './publication-left-panel';

interface PublicationDocumentPreviewProps {
  sections: DocSection[];
  generatedContent: Record<DocSection, string | null>;
  format: DocFormat;
  generating: boolean;
  onRefine: (section: DocSection, instructions: string) => void;
  refiningSection: DocSection | null;
}

const SECTION_LABELS: Record<DocSection, string> = {
  abstract: 'Abstract',
  introduction: 'Introduction',
  related_work: 'Related Work',
  methodology: 'Methodology',
  results: 'Results',
  discussion: 'Discussion',
  conclusion: 'Conclusion',
  references: 'References',
};

function renderMarkdownPreview(markdown: string) {
  // A simple markdown renderer for the preview
  // In a real implementation, you'd use react-markdown, but we'll do basic parsing for the preview
  const paragraphs = markdown.split('\n\n');
  return paragraphs.map((p, i) => {
    if (p.startsWith('## ')) {
      return <h3 key={i} className="mb-4 mt-6 text-lg font-bold text-white">{p.replace('## ', '')}</h3>;
    }
    if (p.startsWith('### ')) {
      return <h4 key={i} className="mb-3 mt-5 text-base font-semibold text-white">{p.replace('### ', '')}</h4>;
    }
    if (p.startsWith('- ')) {
      return (
        <ul key={i} className="mb-4 list-disc pl-5 text-slate-300">
          {p.split('\n').map((item, j) => (
            <li key={j} className="mb-1">{item.replace('- ', '')}</li>
          ))}
        </ul>
      );
    }
    // Replace citations like [1] with stylized pills
    const withCitations = p.split(/(\[\d+\])/g).map((part, j) => {
      if (/^\[\d+\]$/.test(part)) {
        return <span key={j} className="mx-1 inline-flex items-center rounded bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-bold text-teal-400 border border-teal-500/30">{part}</span>;
      }
      return <span key={j}>{part}</span>;
    });

    return <p key={i} className="mb-4 leading-relaxed text-slate-300">{withCitations}</p>;
  });
}

export function PublicationDocumentPreview({
  sections,
  generatedContent,
  format,
  generating,
  onRefine,
  refiningSection,
}: PublicationDocumentPreviewProps) {
  const [activeTab, setActiveTab] = useState<DocSection>(sections[0] ?? 'abstract');
  const [refineInput, setRefineInput] = useState('');

  // Auto-select first section if active is removed
  if (sections.length > 0 && !sections.includes(activeTab)) {
    setActiveTab(sections[0]);
  }

  const handleRefine = () => {
    if (refineInput.trim() && !refiningSection) {
      onRefine(activeTab, refineInput);
      setRefineInput('');
    }
  };

  const hasContent = sections.some((s) => generatedContent[s] !== null);

  if (sections.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed text-center"
        style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(5,5,10,0.5)' }}>
        <FileText className="h-10 w-10 text-slate-700" />
        <p className="mt-3 text-sm font-medium text-slate-500">No sections selected</p>
        <p className="text-xs text-slate-600">Select sections from the left panel to begin.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border"
      style={{ background: 'rgba(13,13,20,0.95)', borderColor: 'rgba(255,255,255,0.07)' }}>
      
      {/* Top Header / Tabs */}
      <div className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        
        {/* Section Tabs */}
        <div className="rh-scroll flex items-center gap-1 overflow-x-auto pb-1">
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveTab(sec)}
              className="relative shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors"
              style={{ color: activeTab === sec ? '#fff' : '#64748b' }}
            >
              {activeTab === sec && (
                <motion.div
                  layoutId="pub-doc-tab"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {generatedContent[sec] && <CheckCircle2 className="h-3 w-3 text-teal-400" />}
                {SECTION_LABELS[sec]}
              </span>
            </button>
          ))}
        </div>

        {/* Export Actions */}
        <div className="flex shrink-0 items-center gap-2 pl-4">
          <button className="flex h-7 w-7 items-center justify-center rounded border transition-colors hover:bg-white/5"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }} title="Print / PDF">
            <Printer className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded border transition-colors hover:bg-white/5"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }} title="Download Markdown">
            <FileCode className="h-3.5 w-3.5" />
          </button>
          <button className="flex items-center gap-1.5 rounded border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-teal-500/10 hover:text-teal-400"
            style={{ borderColor: 'rgba(0,212,170,0.3)', background: 'rgba(0,212,170,0.1)' }}>
            <FileDown className="h-3.5 w-3.5" /> Export {format.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Main Document Content Area */}
      <div className="rh-scroll flex-1 overflow-y-auto p-6 md:p-8 lg:p-12"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,10,0) 0%, rgba(5,5,10,0.5) 100%)',
        }}>
        
        <div className="mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-[400px]"
            >
              <h2 className="mb-6 text-2xl font-bold text-white tracking-tight">{SECTION_LABELS[activeTab]}</h2>
              
              {generatedContent[activeTab] ? (
                <div className="prose prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-300">
                  {renderMarkdownPreview(generatedContent[activeTab]!)}
                </div>
              ) : generating ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-teal-500/30" />
                    <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-teal-400">Synthesizing {SECTION_LABELS[activeTab].toLowerCase()}...</p>
                  <p className="mt-1 text-xs text-slate-500">Cross-referencing high-quality sources.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
                  <p className="text-sm text-slate-500">This section has not been generated yet.</p>
                  <p className="text-xs text-slate-600">Click Generate in the left panel to begin.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Refinement Bar (bottom) */}
      {hasContent && (
        <div className="border-t p-4" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(5,5,10,0.8)' }}>
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-teal-500">Refine</span>
            <div className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <input
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                disabled={refiningSection !== null}
                placeholder={`Instruct the AI to rewrite or improve the ${SECTION_LABELS[activeTab].toLowerCase()}...`}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleRefine}
                disabled={!refineInput.trim() || refiningSection !== null}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-black transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {refiningSection === activeTab ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
