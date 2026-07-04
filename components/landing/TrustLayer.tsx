'use client';

import { motion } from 'framer-motion';
import { Layers, Database, Cpu, Layout, Server, Code2, Sparkles, Zap } from 'lucide-react';
import type { TrustLayerProps } from '@/types/landing';

const TECH_STACK = [
  {
    name: 'Next.js 15',
    category: 'Framework',
    description: 'App Router architecture with React Server Components and Turbopack for sub-second HMR and optimal edge delivery.',
    icon: Layout,
  },
  {
    name: 'React 19',
    category: 'UI Library',
    description: 'Concurrent rendering, specialized hooks, and suspense boundaries powering a highly interactive, stateful frontend.',
    icon: Code2,
  },
  {
    name: 'TypeScript',
    category: 'Language',
    description: 'Strict type safety across the entire stack, eliminating runtime errors and providing absolute schema confidence.',
    icon: Cpu,
  },
  {
    name: 'Tailwind CSS v4',
    category: 'Styling',
    description: 'Utility-first design system customized with raw hex values for a premium, high-contrast brutalist aesthetic.',
    icon: Sparkles,
  },
  {
    name: 'Framer Motion',
    category: 'Animation',
    description: 'Hardware-accelerated spring physics and scroll-driven kinematics for cinematic, 60fps micro-interactions.',
    icon: Zap,
  },
  {
    name: 'MongoDB Atlas',
    category: 'Database',
    description: 'Vector-enabled NoSQL persistence layer for chat history, learning paths, and high-throughput telemetry ingestion.',
    icon: Database,
  },
  {
    name: 'AWS Bedrock',
    category: 'AI Infrastructure',
    description: 'Enterprise-grade foundational model routing (Claude 3, Mistral, Llama 3) with guaranteed zero data retention.',
    icon: Server,
  },
  {
    name: 'Radix UI & Lucide',
    category: 'Components',
    description: 'Unstyled, highly accessible primitive components paired with crisp, monochrome technical iconography.',
    icon: Layers,
  },
];

function TechCard({ tech, index }: { tech: typeof TECH_STACK[0], index: number }) {
  const Icon = tech.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="p-6 group relative overflow-hidden flex flex-col h-full"
      style={{ border: '1px solid #1F1F1F', background: '#0D0D0D' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center justify-center w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ border: '1px solid #1F1F1F', background: '#050505' }}
        >
          <Icon className="w-4 h-4 text-[#9CA3AF]" />
        </div>
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#4B5563]">
          {tech.category}
        </span>
      </div>
      
      <h3 className="text-[14px] font-bold text-[#FFFFFF] mb-2 uppercase tracking-widest">
        {tech.name}
      </h3>
      <p className="font-mono text-[11px] text-[#6B7280] leading-relaxed flex-grow">
        {tech.description}
      </p>

      {/* Neon accent on hover */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#FF6B00] group-hover:w-full transition-all duration-300 ease-out" />
    </motion.div>
  );
}

/**
 * Tech Stack Section (Replaces TrustLayer)
 * 
 * Displays the core architecture of the project in neat, enterprise-grade brutalist cards.
 */
export default function TrustLayer(_props: TrustLayerProps) {
  return (
    <section
      id="tech-stack"
      aria-labelledby="tech-stack-heading"
      className="relative z-10 py-24 sm:py-32"
      style={{ borderTop: '1px solid #1F1F1F', borderBottom: '1px solid #1F1F1F' }}
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

        {/* ─── Section Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1,  y: 0  }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="font-mono block text-[10px] font-bold uppercase tracking-[0.3em] text-[#9CA3AF] mb-4">
            System Architecture
          </span>
          <h2
            id="tech-stack-heading"
            className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase tracking-[-0.04em]
                       text-[#FFFFFF] leading-[1.0] max-w-2xl"
          >
            Engineered For<br />
            Maximum <span className="text-[#FF6B00]">Velocity.</span>
          </h2>
        </motion.div>

        {/* ─── Tech Stack Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TECH_STACK.map((tech, i) => (
            <TechCard key={tech.name} tech={tech} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
