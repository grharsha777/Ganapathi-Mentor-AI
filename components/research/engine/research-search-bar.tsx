'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { Search, ArrowRight, Loader2, Paperclip, ChevronDown, BookOpen, Layers, Newspaper, Zap, CheckCircle2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  suggestions: string[];
  activeSuggestion: number;
  setActiveSuggestion: (value: number) => void;
  onSearch: (override?: string) => void;
  loading?: boolean;
  mode: string;
  setMode: (mode: any) => void;
  publicationSections: string[];
  setPublicationSections: (sections: string[]) => void;
  attachments: { name: string; type: string; size: number; text: string }[];
  onAddAttachments: (files: FileList | File[]) => void;
  onRemoveAttachment: (name: string) => void;
  attachmentLimit: number;
}

const MODES = [
  { id: 'quick', label: 'Quick Search', icon: Zap },
  { id: 'deep', label: 'Deep Research', icon: Search },
  { id: 'comparative', label: 'Comparative', icon: Layers },
  { id: 'academic', label: 'Academic', icon: BookOpen },
  { id: 'news', label: 'News & Events', icon: Newspaper },
  { id: 'publication_labs', label: 'Publication Labs', icon: CheckCircle2, gradient: true },
];

const AVAILABLE_SECTIONS = [
  { id: 'abstract', label: 'Abstract' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'related_work', label: 'Related Work' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'results', label: 'Results' },
  { id: 'discussion', label: 'Discussion' },
  { id: 'conclusion', label: 'Conclusion' },
  { id: 'references', label: 'References' },
];

export function ResearchSearchBar({
  query,
  setQuery,
  suggestions,
  activeSuggestion,
  setActiveSuggestion,
  onSearch,
  loading = false,
  mode,
  setMode,
  publicationSections,
  setPublicationSections,
  attachments,
  onAddAttachments,
  onRemoveAttachment,
  attachmentLimit,
}: SearchBarProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      setActiveSuggestion(Math.min(activeSuggestion + 1, suggestions.length - 1));
    }
    if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      setActiveSuggestion(Math.max(activeSuggestion - 1, -1));
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        onSearch(suggestions[activeSuggestion]);
      } else {
        onSearch();
      }
    }
  };

  const currentMode = MODES.find((m) => m.id === mode) || MODES[1];
  const ModeIcon = currentMode.icon;

  const toggleSection = (id: string) => {
    setPublicationSections(
      publicationSections.includes(id)
        ? publicationSections.filter((s) => s !== id)
        : [...publicationSections, id]
    );
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main Search Container */}
      <div
        className={`relative rounded-[24px] border bg-[#0d0d14]/90 p-2 transition-all duration-300 backdrop-blur-3xl shadow-2xl ${
          loading ? 'border-[#00d4aa]/40' : 'border-white/10'
        }`}
      >
        <div className="relative flex flex-col w-full rounded-[16px] bg-[#05050a] px-4 py-3 border border-white/5">
          {/* Attachments Display */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((file) => (
                <div key={file.name} className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-white">
                  <Paperclip className="h-3 w-3 opacity-70" />
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <button type="button" onClick={() => onRemoveAttachment(file.name)} className="ml-1 opacity-50 hover:opacity-100" title="Remove attachment" aria-label="Remove attachment"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveSuggestion(-1);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask anything..."
            className="w-full min-h-[44px] max-h-[200px] resize-none bg-transparent text-[17px] leading-relaxed text-white outline-none placeholder:text-slate-500 disabled:opacity-50 caret-[#00d4aa]"
            rows={1}
          />

          {/* Action Row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFocusOpen(!focusOpen)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10"
              >
                <ModeIcon className={`h-3.5 w-3.5 ${currentMode.gradient ? 'text-[#00d4aa]' : 'text-inherit'}`} />
                <span>{currentMode.label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </button>

              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                title="Attach file"
                aria-label="Attach file"
                multiple 
                onChange={(e) => {
                  if (e.target.files) {
                    onAddAttachments(e.target.files);
                  }
                  e.target.value = '';
                }} 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= attachmentLimit}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                <Paperclip className="h-3.5 w-3.5 opacity-70" />
                <span>Attach</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onSearch()}
              disabled={loading || !query.trim()}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black transition-all duration-200 disabled:opacity-50 hover:opacity-90 ${
                loading ? 'bg-[#3b82f6]' : query.trim() ? 'bg-[#00d4aa]' : 'bg-[#334155]'
              }`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <ArrowRight className={`h-5 w-5 ${query.trim() ? 'text-black' : 'text-slate-400'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Suggestion dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && !loading && !focusOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              className="absolute left-0 right-0 top-full mt-2 rounded-2xl border p-2 shadow-xl bg-[rgba(5,5,10,0.95)] border-white/10"
            >
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setQuery(s); onSearch(s); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] transition-colors duration-100 hover:bg-white/5 ${
                    i === activeSuggestion ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'bg-transparent text-slate-200'
                  }`}
                >
                  <Search className="h-4 w-4 shrink-0 opacity-40" />
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Focus Drawer */}
        <AnimatePresence>
          {focusOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-5 mt-2 border-t border-white/5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">Focus Mode</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MODES.map((m) => {
                    const active = mode === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMode(m.id);
                          if (m.id !== 'publication_labs') setAdvancedOpen(false);
                          setFocusOpen(false);
                        }}
                        className={`flex flex-col items-start gap-2 rounded-xl border p-3 transition-colors text-left ${
                          active ? 'bg-[#00d4aa]/10 border-[#00d4aa]/30 text-[#00d4aa]' : 'bg-white/5 border-transparent text-slate-400'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${m.gradient ? 'text-[#00d4aa]' : 'text-inherit'}`} />
                        <span className="text-sm font-semibold text-white">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {mode === 'publication_labs' && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setAdvancedOpen(!advancedOpen)}
                      className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
                    >
                      Advanced Settings <ChevronDown className={`h-3 w-3 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {advancedOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3"
                        >
                          <div className="p-4 rounded-xl border border-white/10 bg-black/40">
                            <p className="text-xs text-slate-400 mb-3">Include Sections</p>
                            <div className="flex flex-wrap gap-2">
                              {AVAILABLE_SECTIONS.map((sec) => (
                                <button
                                  key={sec.id}
                                  type="button"
                                  onClick={() => toggleSection(sec.id)}
                                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                    publicationSections.includes(sec.id) 
                                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-300' 
                                      : 'bg-transparent border-white/10 text-slate-400'
                                  }`}
                                >
                                  {sec.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
