'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Code, GraduationCap, Mic,
  Server, Terminal, Database, Workflow, Bot,
} from 'lucide-react';
import type { BentoFeatureItem, BentoFeatureGridProps } from '@/types/landing';

// ─── Default Feature Definitions ─────────────────────────────────────────────
const DEFAULT_FEATURES: BentoFeatureItem[] = [
  {
    id:          'ai-mentor',
    title:       'Multi-Model AI Mentor',
    description: 'Context-aware code generation and debugging across Mistral, Claude 3, GPT-4o, Gemini 1.5 Pro, and Groq Llama. Streaming responses with sub-80ms median latency routed via AWS Bedrock.',
    icon:        Bot,
    colSpan:     'col-span-2',
    rowSpan:     'row-span-1',
    metrics:     [
      { key: 'p99 latency', value: '118', unit: 'ms'    },
      { key: 'throughput',  value: '1.2M', unit: 'tok/min' },
    ],
    routingLabel: 'via AWS Bedrock Nova Pro',
  },
  {
    id:          'code-review',
    title:       'Architecture-Level Code Review',
    description: 'Security vulnerability detection, memory profiling, and automated refactoring suggestions grounded in OWASP Top 10 and CWE standards.',
    icon:        Code,
    colSpan:     'col-span-1',
    rowSpan:     'row-span-1',
    metrics:     [
      { key: 'avg review',  value: '2.3', unit: 's'  },
      { key: 'vuln recall', value: '97',  unit: '%'  },
    ],
    routingLabel: 'via Claude 3.5 Sonnet',
  },
  {
    id:          'learning-paths',
    title:       'Adaptive Learning Paths',
    description: 'AI-generated personalized roadmaps that dynamically recalibrate against your commit history, quiz scores, and declared learning objectives.',
    icon:        GraduationCap,
    colSpan:     'col-span-1',
    rowSpan:     'row-span-1',
    metrics:     [
      { key: 'courses',    value: '500+', unit: ''   },
      { key: 'recal freq', value: '24',   unit: 'hr' },
    ],
    routingLabel: 'via Gemini 1.5 Flash',
  },
  {
    id:          'voice-interview',
    title:       'Voice Interview Simulator',
    description: 'Real-time AI voice simulation for technical, behavioral, and system design rounds. Speech-to-text via AWS Transcribe; analysis via Mistral Large.',
    icon:        Mic,
    colSpan:     'col-span-1',
    rowSpan:     'row-span-1',
    metrics:     [
      { key: 'transcription', value: '<200', unit: 'ms' },
      { key: 'questions',     value: '2,400',unit: ''   },
    ],
    routingLabel: 'via Mistral Large 2',
  },
  {
    id:          'devops',
    title:       'DevOps Command Center',
    description: 'Docker orchestration, CI/CD pipeline generation, infrastructure as code scaffolding, and cloud deployment automation — AWS-native, production-grade.',
    icon:        Server,
    colSpan:     'col-span-1',
    rowSpan:     'row-span-1',
    metrics:     [
      { key: 'deploy time', value: '4.1', unit: 's'    },
      { key: 'AWS regions', value: '18',  unit: ''     },
    ],
    routingLabel: 'via AWS Lambda',
  },
  {
    id:          'chat-interface',
    title:       'Persistent Chat Sessions',
    description: 'Stateful conversation threads with codebase context injection. Session history persisted to MongoDB Atlas with full semantic search across previous sessions.',
    icon:        MessageSquare,
    colSpan:     'col-span-1',
    rowSpan:     'row-span-1',
    metrics:     [
      { key: 'context window', value: '128K', unit: 'tok' },
      { key: 'recall p50',     value: '3.2',  unit: 'ms'  },
    ],
    routingLabel: 'via GPT-4o',
  },
  {
    id:          'terminal-cli',
    title:       'Terminal Mentor CLI',
    description: 'A production AI architect living in your shell. npm install -g ganapathi-mentor-cli — instant access to code review, planning, and generation from any directory.',
    icon:        Terminal,
    colSpan:     'col-span-2',
    rowSpan:     'row-span-1',
    metrics:     [
      { key: 'startup',    value: '180', unit: 'ms' },
      { key: 'installs',   value: '4K+', unit: ''   },
    ],
    routingLabel: 'via Groq Llama 3.1 70B',
  },
  {
    id:          'data-pipeline',
    title:       'Code Analytics Pipeline',
    description: 'Real-time ingestion of your repository telemetry — commit frequency, error patterns, and dependency drift — visualized in the built-in engineering intelligence dashboard.',
    icon:        Database,
    colSpan:     'col-span-1',
    rowSpan:     'row-span-1',
    metrics:     [
      { key: 'ingest rate', value: '50K', unit: 'events/s' },
      { key: 'data lag',    value: '<1',  unit: 's'        },
    ],
    routingLabel: 'via AWS Kinesis',
  },
  {
    id:          'workflow',
    title:       'Workflow Automation',
    description: 'AI-generated task prioritization using Eisenhower Matrix scoring, smart agenda construction, and automated dependency graph resolution for multi-sprint planning.',
    icon:        Workflow,
    colSpan:     'col-span-2',
    rowSpan:     'row-span-1',
    metrics:     [
      { key: 'tasks/day', value: '340+', unit: ''  },
      { key: 'time saved', value: '2.4',  unit: 'hr' },
    ],
    routingLabel: 'via Mistral 7B',
  },
];

// ─── Bento Card ───────────────────────────────────────────────────────────────
function BentoCard({ feature, index }: { feature: BentoFeatureItem; index: number }) {
  const Icon = feature.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1,  y: 0  }}
      whileHover={{ scale: 1.02 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        default: { duration: 0.45, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] },
        scale:   { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
      }}
      className={`group relative flex flex-col justify-between p-7 overflow-hidden
                  ${feature.colSpan} ${feature.rowSpan}`}
      style={{
        background:  '#0D0D0D',
        border:      '1px solid #1F1F1F',
        minHeight:   feature.rowSpan === 'row-span-2' ? '360px' : '260px',
      }}
      aria-label={feature.title}
    >
      {/* ── Top: Icon + Title + Description ─── */}
      <div>
        {/* Icon — monochrome, opacity-shift on hover */}
        <div
          className="flex items-center justify-center w-10 h-10 mb-5
                     transition-opacity duration-200 group-hover:opacity-100 opacity-60"
          style={{ border: '1px solid #1F1F1F', background: '#050505' }}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5 text-[#9CA3AF]" />
        </div>

        <h3 className="text-[14px] font-black uppercase text-[#FFFFFF] mb-3 leading-snug tracking-widest">
          {feature.title}
        </h3>

        <p className="font-mono text-[12px] text-[#9CA3AF] leading-relaxed max-w-sm">
          {feature.description}
        </p>
      </div>

      {/* ── Bottom: Hover-revealed technical metrics ─── */}
      <div
        className="mt-6 pt-4 flex flex-col gap-3
                   opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
                   transition-all duration-250 ease-out"
        style={{ borderTop: '1px solid #1F1F1F' }}
        aria-label={`Technical metrics for ${feature.title}`}
      >
        {/* Routing label */}
        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#4B5563]">
          {feature.routingLabel}
        </span>

        {/* Metric row */}
        <dl className="flex flex-wrap gap-x-6 gap-y-1">
          {feature.metrics.map((m) => (
            <div key={m.key} className="flex items-baseline gap-1">
              <dt className="text-[9px] uppercase tracking-[0.2em] text-[#6B7280]">{m.key}</dt>
              <dd className="text-[11px] font-black text-[#FFFFFF] tabular-nums">
                {m.value}
                {m.unit && (
                  <span className="text-[9px] font-normal text-[#6B7280] ml-0.5">{m.unit}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── Structural corner accent (Quantum Blue) ─── */}
      <span
        className="absolute top-0 right-0 w-2 h-2 bg-[#2563EB] opacity-0
                   group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />
    </motion.article>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────
/**
 * BentoFeatureGrid
 *
 * Premium HackArena-style bento grid:
 * – Sharp 1px `#1F1F1F` borders, `#0D0D0D` surfaces
 * – Asymmetric CSS grid — some cards span 2 columns for visual hierarchy
 * – Hover: scale(1.02) layout morph + technical metrics revealed from bottom
 * – Zero colorful icon backdrops, zero rounded corners
 * – All cards use aria-label and semantic HTML
 */
export default function BentoFeatureGrid({ features = DEFAULT_FEATURES }: BentoFeatureGridProps) {
  const memoFeatures = useMemo(() => features, [features]);

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative z-10 py-24 sm:py-32"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

        {/* ─── Section Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1,  y: 0  }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-[#9CA3AF] mb-4">
            Platform Capabilities
          </span>
          <h2
            id="features-heading"
            className="text-[clamp(2.5rem,6vw,4rem)] font-black uppercase tracking-[-0.04em]
                       text-[#FFFFFF] leading-[0.95] max-w-2xl"
          >
            Every Tool.<br />
            One Coherent System.
          </h2>
        </motion.div>

        {/* ─── Bento Grid ─────────────────────────────────────────────────── */}
        {/*
          Grid: 3-column on desktop. Cards with col-span-2 get wider slots.
          On tablet: 2-column. On mobile: single column stack.
        */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ background: '#1F1F1F' }} /* gap color = border color */
          role="list"
          aria-label="Platform feature cards"
        >
          {memoFeatures.map((feature, i) => (
            <div
              key={feature.id}
              className={`${feature.colSpan === 'col-span-2' ? 'sm:col-span-2' : 'col-span-1'}`}
              role="listitem"
            >
              <BentoCard feature={feature} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
