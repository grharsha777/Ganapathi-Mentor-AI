'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageSquare, Code, GraduationCap, Mic, Palette, Target,
  Server, Newspaper, Terminal,
} from 'lucide-react';

// ─── Feature Data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: 'chatbot',
    title: 'Neural AI Chatbot',
    desc: 'Multi-model conversations powered by GPT-4o, Gemini Pro, Claude 3, and Mistral Large. Context-aware code generation with streaming responses.',
    icon: MessageSquare,
    meta: { latency: '<120ms', models: '5 LLMs', tier: 'Enterprise' },
    size: 'large', // spans 2 columns
  },
  {
    id: 'code-review',
    title: 'Quantum Code Review',
    desc: 'Architecture-level feedback, security vulnerability detection, performance profiling, and automated refactoring suggestions.',
    icon: Code,
    meta: { latency: '<200ms', nodes: '3 analyzers', tier: 'Pro' },
    size: 'large',
  },
  {
    id: 'learning',
    title: 'Adaptive Learning Paths',
    desc: 'AI-generated personalized roadmaps that evolve with your skills. 500+ curated courses across 50+ technologies.',
    icon: GraduationCap,
    meta: { courses: '500+', tech: '50+ stacks', tier: 'All plans' },
    size: 'small',
  },
  {
    id: 'voice',
    title: 'Voice Interview Simulator',
    desc: 'Practice real interviews with AI-powered voice simulation. Technical, behavioral, and system design rounds.',
    icon: Mic,
    meta: { rounds: '3 types', feedback: 'Real-time', tier: 'Pro' },
    size: 'small',
  },
  {
    id: 'studio',
    title: 'Creative AI Studio',
    desc: 'Generate images with Freepik AI, create videos with Kling & Runway ML, compose music, and design visual assets.',
    icon: Palette,
    meta: { providers: '4 APIs', formats: 'Image/Video', tier: 'Pro' },
    size: 'small',
  },
  {
    id: 'productivity',
    title: 'Productivity Neural Hub',
    desc: 'AI task prioritization using Eisenhower Matrix, Pomodoro timers, smart agenda, and automated workflow generation.',
    icon: Target,
    meta: { methods: 'Eisenhower', sync: 'Real-time', tier: 'Enterprise' },
    size: 'small',
  },
  {
    id: 'devops',
    title: 'DevOps Command Center',
    desc: 'Docker orchestration, CI/CD pipeline generation, infrastructure monitoring, and cloud deployment automation via AWS.',
    icon: Server,
    meta: { cloud: 'AWS', pipelines: 'CI/CD', tier: 'Enterprise' },
    size: 'small',
  },
  {
    id: 'news',
    title: 'Real-Time News Engine',
    desc: 'Developer-focused news aggregation via NewsOrg API. AI-curated tech headlines and industry trends.',
    icon: Newspaper,
    meta: { sources: '1000+', refresh: '15min', tier: 'All plans' },
    size: 'small',
  },
  {
    id: 'cli',
    title: 'Terminal Mentor CLI',
    desc: 'An AI architect living in your command line. pip install ganapathi-mentor-ai for instant access worldwide.',
    icon: Terminal,
    meta: { install: 'PyPI', runtime: 'Python 3.9+', tier: 'Open Source' },
    size: 'large',
  },
] as const;

// ─── Individual Card ─────────────────────────────────────────────────────────
function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = feature.icon;
  const metaEntries = Object.entries(feature.meta);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.012 }}
      className="group relative flex flex-col p-6 md:p-8 overflow-hidden cursor-default"
      style={{ border: '1px solid #1F1F1F', background: '#0D0D0D' }}
    >
      {/* Top-right corner accent */}
      <span
        className="absolute top-0 right-0 w-2 h-2 bg-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* Icon */}
      <div className="mb-6">
        <Icon
          className="w-6 h-6 text-[#9CA3AF] group-hover:text-[#FFFFFF] transition-colors duration-300"
          strokeWidth={1.5}
        />
      </div>

      {/* Title */}
      <h3
        className="text-base font-bold text-[#FFFFFF] mb-3 tracking-tight"
        style={{ fontFamily: 'var(--font-manrope), system-ui, sans-serif' }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[#9CA3AF] leading-relaxed flex-1">
        {feature.desc}
      </p>

      {/* Technical Parameter Overlay — revealed on hover */}
      <div className="mt-6 pt-5 flex flex-wrap gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ borderTop: '1px solid #1F1F1F' }}
      >
        {metaEntries.map(([key, val]) => (
          <div key={key} className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#9CA3AF]">{key}</span>
            <span className="text-[11px] font-black text-[#FFFFFF] tabular-nums">{val}</span>
          </div>
        ))}
      </div>

      {/* Hover border highlight — bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#3B82F6] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export default function FeatureGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative z-10 py-24 md:py-32"
      aria-labelledby="features-heading"
    >
      {/* Full-bleed ambient color shift: handled via CSS custom property in page */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 max-w-7xl">

        {/* ─── Header ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#9CA3AF] mb-4 block">
              Feature Arsenal
            </span>
            <h2
              id="features-heading"
              className="text-[clamp(2rem,4.5vw,4rem)] font-black text-[#FFFFFF] leading-[1.0] tracking-tight"
            >
              One Platform.
              <br />
              Infinite Capability.
            </h2>
          </div>
          <p className="text-sm text-[#9CA3AF] max-w-xs leading-relaxed">
            Every tool an elite engineer needs — AI code review, learning paths, creative studio, and DevOps — unified.
          </p>
        </motion.div>

        {/* ─── Bento Grid ───────────────────────────────────────────── */}
        {/*
          Layout: 3-column grid with large cards spanning 2 cols at md+
          Row 1: chatbot (col-span-2) + code-review (col-span-1) [md: chatbot full, then normal]
          Rows 2-3: 3-col grid of small cards
          Row 4: cli (col-span-2) + empty
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1F1F1F]">
          {/* Row 1: Two large + one regular */}
          <div className="md:col-span-2">
            <FeatureCard feature={FEATURES[0]} index={0} />
          </div>
          <div className="md:col-span-1">
            <FeatureCard feature={FEATURES[1]} index={1} />
          </div>

          {/* Row 2: Three smalls */}
          {FEATURES.slice(2, 5).map((f, i) => (
            <FeatureCard key={f.id} feature={f} index={i + 2} />
          ))}

          {/* Row 3: Three smalls */}
          {FEATURES.slice(5, 8).map((f, i) => (
            <FeatureCard key={f.id} feature={f} index={i + 5} />
          ))}

          {/* Row 4: CLI large + empty filler */}
          <div className="md:col-span-2">
            <FeatureCard feature={FEATURES[8]} index={8} />
          </div>

          {/* Filler block to complete grid */}
          <div
            className="hidden md:flex items-center justify-center p-8"
            style={{ background: '#0D0D0D' }}
            aria-hidden="true"
          >
            <div className="flex flex-col items-center gap-3 opacity-30">
              <div className="w-8 h-px bg-[#1F1F1F]" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#9CA3AF] font-bold">More Coming</span>
              <div className="w-8 h-px bg-[#1F1F1F]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
