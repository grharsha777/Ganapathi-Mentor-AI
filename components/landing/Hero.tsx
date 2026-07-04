'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import type { HeroProps, HeroStatItem } from '@/types/landing';

// ─── Default content ──────────────────────────────────────────────────────────
const DEFAULT_STATS: HeroStatItem[] = [
  { value: '15+',    label: 'AI Models'       },
  { value: '99.9%',  label: 'Uptime SLA'      },
  { value: '<80ms',  label: 'Median Latency'  },
  { value: '150+',   label: 'Countries'        },
];

/**
 * Hero
 *
 * Full-viewport hero section with:
 * – Parallax scroll: content fades + translates as user scrolls
 * – Enterprise proof badge (no colorful rounded pill — flat sharp badge)
 * – Headline: pure white, maximum typographic weight
 * – Sub-headline: metallic gray, factual copy
 * – Dual CTA: solid white primary + flat outlined secondary
 * – Technical metadata strip: 4 hard enterprise stats
 * – Animated scroll indicator
 */
export default function Hero({
  headline    = 'The AI Mentor for\nElite Engineers.',
  subheadline = 'Powered by Mistral, Claude, GPT, Gemini, and Groq — deployed on AWS Bedrock. Your code mentor, debugger, architect, and technical co-pilot in one enterprise-grade platform.',
  stats       = DEFAULT_STATS,
}: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const y       = useTransform(scrollYProgress, [0, 1],    [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      aria-labelledby="hero-heading"
      className="relative min-h-[100svh] flex items-center justify-center bg-[#050505] overflow-hidden pt-14"
    >
      {/* Structural anchor line at the base of the hero — HackArena language */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1F1F1F] z-10" />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-10 lg:px-16"
      >
        {/* ─── Enterprise Proof Badge ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1,  y: 0  }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 mb-10"
        >
          <span
            role="status"
            aria-label="Platform status: operational"
            className="inline-flex items-center gap-2.5 px-3 py-1.5
                       text-[10px] font-bold uppercase tracking-[0.25em] text-[#9CA3AF]"
            style={{ border: '1px solid #1F1F1F', background: '#0D0D0D' }}
          >
            {/* Operational status dot */}
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#059669]" />
            </span>
            Infrastructure Trusted by 25+ Global Enterprise Teams
          </span>
        </motion.div>

        {/* ─── Headline ───────────────────────────────────────────────────── */}
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1,  y: 0  }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(3rem,9vw,6rem)] font-black uppercase tracking-[-0.05em] text-[#FFFFFF] leading-[0.9] mb-8"
        >
          Engineering <br />
          <span className="text-[#0055FF]">Intelligence.</span>
        </motion.h1>

        {/* ─── Sub-headline ───────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1,  y: 0  }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-[#9CA3AF] max-w-2xl mb-12 leading-relaxed"
        >
          {subheadline}
        </motion.p>

        {/* ─── CTA Buttons ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1,  y: 0  }}
          transition={{ duration: 0.65, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-start gap-3"
        >
          <Link
            href="/auth/sign-up"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5
                       text-[11px] font-bold uppercase tracking-[0.18em]
                       text-[#050505] bg-[#FFFFFF] hover:bg-[#E5E7EB]
                       transition-colors duration-150
                       focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-[#2563EB] focus-visible:ring-offset-2
                       focus-visible:ring-offset-[#050505]"
            aria-label="Start building — create your free account"
          >
            Start Building Free
            <ArrowRight
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150"
              aria-hidden="true"
            />
          </Link>

          <a
            href="#features"
            className="inline-flex items-center gap-2.5 px-7 py-3.5
                       text-[11px] font-bold uppercase tracking-[0.18em]
                       text-[#9CA3AF] hover:text-[#FFFFFF] transition-colors duration-150
                       focus-visible:outline-none focus-visible:ring-1
                       focus-visible:ring-[#2563EB]
                       border border-[#1F1F1F] bg-[#0D0D0D]"
            aria-label="Explore platform features section"
          >
            Explore Platform
          </a>
        </motion.div>

        {/* ─── Technical Metadata Strip ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4"
          aria-label="Platform statistics"
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs font-black text-[#FFFFFF] tabular-nums">{value}</span>
              <span className="text-[10px] text-[#9CA3AF] uppercase tracking-[0.2em]">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ─── Scroll Indicator ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:flex
                   flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-[9px] text-[#9CA3AF] uppercase tracking-[0.35em] font-bold">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
