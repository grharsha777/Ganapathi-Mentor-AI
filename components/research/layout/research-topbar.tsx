'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, History, Settings, User, Microscope, BookMarked, Sparkles, X } from 'lucide-react';

export type ResearchTab = 'overview' | 'publication';

interface ResearchTopBarProps {
  activeTab: ResearchTab;
  onTabChange: (tab: ResearchTab) => void;
  onOpenHistory: () => void;
  globalSearch: string;
  onGlobalSearch: (q: string) => void;
}

const TABS: { id: ResearchTab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'overview',
    label: 'Research Overview Hub',
    icon: <Microscope className="h-3.5 w-3.5" />,
    description: 'Fast deep search & summaries',
  },
  {
    id: 'publication',
    label: 'Publication Workspace',
    icon: <BookMarked className="h-3.5 w-3.5" />,
    description: 'Generate full research documents',
  },
];

export function ResearchTopBar({
  activeTab,
  onTabChange,
  onOpenHistory,
  globalSearch,
  onGlobalSearch,
}: ResearchTopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        background: 'rgba(5,5,10,0.92)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 lg:px-6">
        {/* ── Logo ── */}
        <a href="/" className="flex shrink-0 items-center gap-2.5 select-none">
          <div
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #00d4aa 0%, #3b82f6 100%)' }}
          >
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-none text-white">Ganapathi AI</p>
            <p className="text-[10px] leading-none" style={{ color: '#00d4aa' }}>Research Hub</p>
          </div>
        </a>

        {/* ── Tab Switcher ── */}
        <nav className="mx-auto hidden items-center gap-1 rounded-xl border md:flex"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', padding: '3px' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
              style={{
                color: activeTab === tab.id ? '#00d4aa' : '#94a3b8',
              }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="rh-tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(59,130,246,0.15))',
                    border: '1px solid rgba(0,212,170,0.3)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* ── Right Actions ── */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Global Search */}
          <div
            className="hidden items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-200 lg:flex"
            style={{
              background: searchFocused ? 'rgba(0,212,170,0.06)' : 'rgba(255,255,255,0.04)',
              borderColor: searchFocused ? 'rgba(0,212,170,0.35)' : 'rgba(255,255,255,0.08)',
              boxShadow: searchFocused ? '0 0 0 2px rgba(0,212,170,0.1)' : 'none',
              width: searchFocused ? 240 : 180,
              transition: 'width 0.3s ease, background 0.2s, border-color 0.2s, box-shadow 0.2s',
            }}
          >
            <Search className="h-3.5 w-3.5 shrink-0" style={{ color: searchFocused ? '#00d4aa' : '#475569' }} />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => onGlobalSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search topics..."
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
            />
            <AnimatePresence>
              {globalSearch && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => onGlobalSearch('')}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-slate-400 transition-all hover:border-teal-500/40 hover:bg-teal-500/10 hover:text-teal-400"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
            title="Research History"
          >
            <History className="h-4 w-4" />
          </button>

          {/* Settings Button */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-slate-400 transition-all hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Profile Avatar */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border text-slate-300"
            style={{ borderColor: 'rgba(0,212,170,0.3)', background: 'rgba(0,212,170,0.1)' }}
          >
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div
        className="flex items-center gap-1 border-t px-4 pb-2 pt-1 md:hidden"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            style={{ color: activeTab === tab.id ? '#00d4aa' : '#475569' }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="rh-tab-mobile-bg"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.25)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </span>
          </button>
        ))}
      </div>
    </header>
  );
}
