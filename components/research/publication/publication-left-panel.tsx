'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, FileJson, File, BookOpen, FlaskConical,
  GitCompare, Newspaper, ListChecks, ToggleLeft,
  ToggleRight, Upload, Link2, X, Zap, ChevronRight,
} from 'lucide-react';

export type DocFormat  = 'pdf' | 'markdown' | 'json';
export type DocStyle   = 'academic' | 'technical' | 'systematic' | 'whitepaper';
export type DocSection = 'abstract' | 'introduction' | 'related_work' | 'methodology' | 'results' | 'discussion' | 'conclusion' | 'references';

interface PublicationLeftPanelProps {
  topic: string;
  setTopic: (v: string) => void;
  format: DocFormat;
  setFormat: (v: DocFormat) => void;
  style: DocStyle;
  setStyle: (v: DocStyle) => void;
  selectedSections: DocSection[];
  setSelectedSections: (v: DocSection[]) => void;
  useHighQualityOnly: boolean;
  setUseHighQualityOnly: (v: boolean) => void;
  includeUploads: boolean;
  setIncludeUploads: (v: boolean) => void;
  uploadedUrls: string[];
  setUploadedUrls: (v: string[]) => void;
  includeImages: boolean;
  setIncludeImages: (v: boolean) => void;
  onGenerate: () => void;
  generating: boolean;
}

const FORMATS: { id: DocFormat; label: string; icon: React.ReactNode }[] = [
  { id: 'pdf',      label: 'PDF',      icon: <File className="h-3.5 w-3.5" />      },
  { id: 'markdown', label: 'Markdown', icon: <FileText className="h-3.5 w-3.5" />  },
  { id: 'json',     label: 'JSON',     icon: <FileJson className="h-3.5 w-3.5" />  },
];

const STYLES: { id: DocStyle; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'academic',    label: 'Academic Paper',     icon: <BookOpen className="h-3.5 w-3.5" />,     desc: 'Peer-reviewed format with abstract, methods, results' },
  { id: 'technical',   label: 'Technical Report',   icon: <FlaskConical className="h-3.5 w-3.5" />,  desc: 'Engineering-focused with specifications' },
  { id: 'systematic',  label: 'Systematic Review',  icon: <GitCompare className="h-3.5 w-3.5" />,    desc: 'Literature synthesis with PRISMA-style structure' },
  { id: 'whitepaper',  label: 'Whitepaper',         icon: <Newspaper className="h-3.5 w-3.5" />,     desc: 'Executive-friendly policy or technology document' },
];

const ALL_SECTIONS: { id: DocSection; label: string }[] = [
  { id: 'abstract',      label: 'Abstract' },
  { id: 'introduction',  label: 'Introduction' },
  { id: 'related_work',  label: 'Related Work' },
  { id: 'methodology',   label: 'Methodology' },
  { id: 'results',       label: 'Results' },
  { id: 'discussion',    label: 'Discussion' },
  { id: 'conclusion',    label: 'Conclusion' },
  { id: 'references',    label: 'References' },
];

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-xs text-slate-300 transition-all"
      style={{
        background: on ? 'rgba(0,212,170,0.07)' : 'rgba(255,255,255,0.03)',
        borderColor: on ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.07)',
      }}
    >
      <span>{label}</span>
      {on
        ? <ToggleRight className="h-4 w-4" style={{ color: '#00d4aa' }} />
        : <ToggleLeft  className="h-4 w-4 text-slate-600" />
      }
    </button>
  );
}

export function PublicationLeftPanel({
  topic, setTopic,
  format, setFormat,
  style, setStyle,
  selectedSections, setSelectedSections,
  useHighQualityOnly, setUseHighQualityOnly,
  includeUploads, setIncludeUploads,
  uploadedUrls, setUploadedUrls,
  includeImages, setIncludeImages,
  onGenerate, generating,
}: PublicationLeftPanelProps) {
  const [urlInput, setUrlInput] = useState('');

  const toggleSection = (id: DocSection) =>
    setSelectedSections(selectedSections.includes(id) ? selectedSections.filter((s) => s !== id) : [...selectedSections, id]);

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed && !uploadedUrls.includes(trimmed)) {
      setUploadedUrls([...uploadedUrls, trimmed]);
      setUrlInput('');
    }
  };

  const panelSection = (title: string, children: React.ReactNode) => (
    <div className="rounded-xl border p-4"
      style={{ background: 'rgba(13,13,20,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
      {children}
    </div>
  );

  return (
    <aside className="rh-scroll h-full space-y-3 overflow-y-auto">

      {/* Topic input */}
      {panelSection('Research Topic / Thesis',
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Describe your research topic, thesis statement, or specific question to investigate…"
          rows={4}
          className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm text-white outline-none transition-all leading-6 placeholder:text-slate-600"
          style={{
            background: 'rgba(5,5,10,0.8)',
            borderColor: topic ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.07)',
            caretColor: '#00d4aa',
          }}
        />
      )}

      {/* Format selector */}
      {panelSection('Output Format',
        <div className="flex gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormat(f.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-all"
              style={{
                background: format === f.id ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.03)',
                borderColor: format === f.id ? 'rgba(0,212,170,0.4)' : 'rgba(255,255,255,0.07)',
                color: format === f.id ? '#00d4aa' : '#94a3b8',
              }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Style selector */}
      {panelSection('Document Style',
        <div className="space-y-1.5">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-xs transition-all"
              style={{
                background: style === s.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                borderColor: style === s.id ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)',
              }}
            >
              <span style={{ color: style === s.id ? '#3b82f6' : '#475569' }}>{s.icon}</span>
              <span>
                <span className="block font-semibold" style={{ color: style === s.id ? '#e2e8f0' : '#94a3b8' }}>{s.label}</span>
                <span className="text-[10px] text-slate-600">{s.desc}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Section toggles */}
      {panelSection('Include Sections',
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_SECTIONS.map((sec) => {
            const on = selectedSections.includes(sec.id);
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => toggleSection(sec.id)}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-medium transition-all"
                style={{
                  background: on ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                  borderColor: on ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.07)',
                  color: on ? '#8b5cf6' : '#475569',
                }}
              >
                <ListChecks className="h-3 w-3 shrink-0" />
                {sec.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Source configuration */}
      {panelSection('Source Configuration',
        <div className="space-y-2">
          <Toggle on={useHighQualityOnly} onToggle={() => setUseHighQualityOnly(!useHighQualityOnly)} label="High-quality sources only" />
          <Toggle on={includeUploads}     onToggle={() => setIncludeUploads(!includeUploads)}         label="Include uploaded documents" />
          <Toggle on={includeImages}      onToggle={() => setIncludeImages(!includeImages)}            label="Insert contextual images" />
        </div>
      )}

      {/* URL / link input */}
      {panelSection('Add Links / URLs',
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2"
              style={{ background: 'rgba(5,5,10,0.8)', borderColor: 'rgba(255,255,255,0.07)' }}>
              <Link2 className="h-3.5 w-3.5 text-slate-600" />
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                placeholder="https://..."
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
              />
            </div>
            <button
              type="button"
              onClick={addUrl}
              className="flex h-full items-center justify-center rounded-lg px-3 text-xs font-semibold text-black"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #3b82f6)' }}
            >
              Add
            </button>
          </div>

          {uploadedUrls.map((url) => (
            <div key={url} className="flex items-center gap-2 rounded-lg border px-3 py-2"
              style={{ background: 'rgba(0,212,170,0.06)', borderColor: 'rgba(0,212,170,0.2)' }}>
              <Link2 className="h-3 w-3 shrink-0" style={{ color: '#00d4aa' }} />
              <span className="flex-1 truncate text-[11px] text-slate-400">{url}</span>
              <button type="button" onClick={() => setUploadedUrls(uploadedUrls.filter((u) => u !== url))}>
                <X className="h-3.5 w-3.5 text-slate-600 hover:text-slate-300" />
              </button>
            </div>
          ))}

          {/* Drag-drop area */}
          <div
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed py-6 text-center"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
          >
            <Upload className="h-6 w-6 text-slate-700" />
            <p className="text-[11px] text-slate-600">Drop PDFs or DOCX files here<br />(feature coming soon)</p>
          </div>
        </div>
      )}

      {/* Generate button */}
      <motion.button
        type="button"
        onClick={onGenerate}
        disabled={!topic.trim() || generating}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-sm font-bold text-black transition-all disabled:opacity-40"
        style={{
          background: 'linear-gradient(135deg, #00d4aa 0%, #3b82f6 50%, #8b5cf6 100%)',
          boxShadow: topic.trim() ? '0 0 30px rgba(0,212,170,0.35), 0 0 60px rgba(59,130,246,0.15)' : 'none',
        }}
      >
        {generating ? (
          <><Zap className="h-4 w-4 animate-pulse" /> Generating Document…</>
        ) : (
          <><Zap className="h-4 w-4" /> Generate Research Document <ChevronRight className="h-4 w-4" /></>
        )}
      </motion.button>
    </aside>
  );
}
