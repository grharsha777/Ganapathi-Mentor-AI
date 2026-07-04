'use client';

import { useState } from 'react';
import { Bot, Settings, X, Clock, Folder, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { AnswerCanvas } from '@/components/research/engine/answer-canvas';
import { ResearchSearchBar } from '@/components/research/engine/research-search-bar';
import { ResearchBackground } from '@/components/research/layout/research-background';

import { useResearchEngine } from '@/components/research/hooks/use-research-engine';

export function ResearchEngine() {
  const engine = useResearchEngine();
  const [highlightedCitation, setHighlightedCitation] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAllCollections, setShowAllCollections] = useState(false);

  const hasSearched = engine.loading || engine.answer || engine.stageEvents.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#05050a] text-slate-200 overflow-hidden">
      <ResearchBackground />

      <div className="relative z-10 flex h-full flex-col">
        {/* Minimal Header */}
        <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B00] to-yellow-500 shadow-lg shadow-[#FF6B00]/20 overflow-hidden border border-[#FF6B00]/30 p-0.5">
              <img src="/logo.png" alt="Ganapathi Mentor AI Logo" className="w-full h-full object-cover rounded-[10px]" />
            </div>
            <h1 className="text-[15px] font-semibold tracking-tight text-white">
              Ganapathi <span className="font-light text-slate-400">Mentor AI</span>
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto rh-scroll relative">
          <div className="mx-auto flex w-full max-w-4xl flex-col px-4 pb-32">
            
            {/* Search Area Animation */}
            <motion.div
              layout
              initial={false}
              animate={{
                marginTop: hasSearched ? '2rem' : '20vh',
                marginBottom: hasSearched ? '2rem' : '0',
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full z-20"
            >
              <ResearchSearchBar
                query={engine.query}
                setQuery={engine.setQuery}
                suggestions={engine.suggestions}
                activeSuggestion={engine.activeSuggestion}
                setActiveSuggestion={engine.setActiveSuggestion}
                onSearch={engine.runSearch}
                loading={engine.loading}
                mode={engine.mode}
                setMode={engine.setMode}
                publicationSections={engine.publicationSections}
                setPublicationSections={engine.setPublicationSections}
                attachments={engine.attachments}
                onAddAttachments={engine.addAttachments}
                onRemoveAttachment={engine.removeAttachment}
                attachmentLimit={engine.attachmentLimit}
              />
            </motion.div>

            {/* Results Cascade */}
            <AnimatePresence mode="wait">
              {hasSearched && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="w-full"
                >
                  <AnswerCanvas
                    loading={engine.loading}
                    answer={engine.answer}
                    events={engine.stageEvents}
                    streamedPreview={engine.streamedPreview}
                    metadata={engine.metadata}
                    mode={engine.mode}
                    exportingPdf={engine.exportingPdf}
                    onCitationClick={(id) => {
                      setHighlightedCitation(id);
                      const source = document.getElementById(`source-${id}`);
                      source?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      if (source) {
                        source.style.borderColor = '#00d4aa';
                        source.style.boxShadow = '0 0 20px rgba(0,212,170,0.3)';
                        setTimeout(() => {
                          source.style.borderColor = 'rgba(255,255,255,0.07)';
                          source.style.boxShadow = 'none';
                          setHighlightedCitation(null);
                        }, 2500);
                      }
                    }}
                    onFollowUp={engine.runSearch}
                    onExportMarkdown={engine.exportAsMarkdown}
                    onExportJson={engine.exportAsJson}
                    onExportPdf={engine.exportAsPdf}
                    onExportRichText={engine.exportAsRichText}
                    onShare={() => {
                      if (engine.selectedCollectionIds.length > 0) {
                        engine.shareCollection(engine.selectedCollectionIds[0]);
                      } else {
                        alert('Select a collection first to share');
                      }
                    }}
                    onRedo={() => engine.runSearch(engine.query)}
                    onCollection={engine.saveCurrentToCollections}
                    collections={engine.collections}
                    selectedCollectionIds={engine.selectedCollectionIds}
                    setSelectedCollectionIds={engine.setSelectedCollectionIds}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* PDF Export Loading Overlay */}
      <AnimatePresence>
        {engine.exportingPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="relative flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[#0d1117] p-10 shadow-2xl w-80"
            >
              {/* Animated rings */}
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute h-20 w-20 rounded-full border-2 border-sky-500/20 animate-ping" />
                <div className="absolute h-16 w-16 rounded-full border-2 border-sky-500/40" />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/30">
                  <FileText className="h-6 w-6 text-sky-400" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full space-y-3">
                <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '90%' }}
                    transition={{ duration: 4, ease: 'easeInOut' }}
                  />
                </div>
                <p className="font-sans text-sm font-medium text-zinc-200 text-center">Generating PDF…</p>
                <p className="font-sans text-xs text-zinc-500 text-center">Rendering IEEE-style layout and typography</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 z-50 w-80 bg-[#0d0d14] border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-sm font-semibold text-white">Workspace Settings</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10" title="Close" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-8">
                {/* History Section */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Recent History
                  </h3>
                  <div className="space-y-2">
                    {engine.history.length === 0 ? (
                      <p className="text-sm text-slate-500">No history yet.</p>
                    ) : (
                      <>
                        {engine.history.slice(0, showAllHistory ? undefined : 5).map((item) => (
                          <div key={item.id} className="p-2 rounded-lg border border-white/5 bg-black/20 hover:bg-white/5 transition-colors cursor-pointer text-sm">
                            <p className="text-slate-300 truncate">{item.query}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))}
                        {engine.history.length > 5 && (
                          <button 
                            onClick={() => setShowAllHistory(!showAllHistory)}
                            className="w-full text-center py-2 text-xs font-semibold text-[#00d4aa] hover:text-white transition-colors"
                          >
                            {showAllHistory ? 'View Less' : 'More Chats'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </section>

                {/* Collections Section */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Folder className="w-3.5 h-3.5" /> Collections</span>
                  </h3>
                  
                  {/* New Collection Form */}
                  <div className="mb-4 flex items-center gap-2">
                    <input 
                      type="text"
                      placeholder="New collection name"
                      className="flex-1 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#00d4aa]/50"
                      value={engine.newCollectionName}
                      onChange={(e) => engine.setNewCollectionName(e.target.value)}
                    />
                    <button 
                      onClick={() => engine.createNewCollection()}
                      disabled={engine.creatingCollection || !engine.newCollectionName.trim()}
                      className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {engine.collections.length === 0 ? (
                      <p className="text-sm text-slate-500">No collections yet.</p>
                    ) : (
                      <>
                        {engine.collections.slice(0, showAllCollections ? undefined : 5).map((col) => (
                          <div key={col.id} className="flex items-center gap-3 p-2 rounded-lg border border-white/5 bg-black/20 hover:bg-white/5 transition-colors cursor-pointer">
                            <span className="text-lg">{col.icon}</span>
                            <div>
                              <p className="text-sm text-slate-300">{col.name}</p>
                              <p className="text-[10px] text-slate-500">{col.itemCount} items</p>
                            </div>
                          </div>
                        ))}
                        {engine.collections.length > 5 && (
                          <button 
                            onClick={() => setShowAllCollections(!showAllCollections)}
                            className="w-full text-center py-2 text-xs font-semibold text-[#00d4aa] hover:text-white transition-colors"
                          >
                            {showAllCollections ? 'View Less' : 'View More'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
