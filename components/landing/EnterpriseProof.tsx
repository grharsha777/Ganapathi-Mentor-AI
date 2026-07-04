'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Code, Shield, Globe, Cpu, Building2 } from 'lucide-react';

const STATS = [
  { icon: Code,      value: '2M+',   label: 'Lines Analyzed',    detail: 'Static + runtime analysis' },
  { icon: Shield,    value: '99.9%', label: 'Uptime SLA',         detail: 'Enterprise availability' },
  { icon: Globe,     value: '150+',  label: 'Countries Served',   detail: 'Global deployment' },
  { icon: Cpu,       value: '15+',   label: 'AI Models',          detail: 'Multi-model orchestration' },
  { icon: Building2, value: '25+',   label: 'Enterprise Teams',   detail: 'Trusted globally' },
] as const;

function StatCard({ icon: Icon, value, label, detail, index }: {
  icon: typeof Code;
  value: string;
  label: string;
  detail: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative p-6 flex flex-col gap-3"
      style={{ border: '1px solid #1F1F1F', background: '#0D0D0D' }}
    >
      {/* Corner accent dot */}
      <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <Icon
        className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#FFFFFF] transition-colors duration-300"
        strokeWidth={1.5}
      />

      <div>
        <div
          className="text-3xl md:text-4xl font-black text-[#FFFFFF] tabular-nums tracking-tight leading-none mb-1"
          style={{ fontFamily: 'var(--font-manrope), system-ui, sans-serif' }}
        >
          {value}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9CA3AF]">{label}</div>
      </div>

      {/* Hover reveal detail */}
      <div className="text-[10px] text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-[0.15em]">
        {detail}
      </div>
    </motion.div>
  );
}

export default function EnterpriseProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      ref={sectionRef}
      id="enterprise"
      className="relative z-10 py-24 md:py-32"
      aria-labelledby="enterprise-heading"
    >
      <div className="container mx-auto px-6 md:px-10 lg:px-16 max-w-6xl">

        {/* ─── Section Header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#9CA3AF] mb-4 block">
            Enterprise Scale
          </span>
          <h2
            id="enterprise-heading"
            className="text-[clamp(2rem,4vw,3.5rem)] font-black text-[#FFFFFF] leading-[1.05] tracking-tight max-w-2xl"
          >
            Built for Teams That Ship.
          </h2>
        </motion.div>

        {/* ─── Stats Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-[#1F1F1F]">
          {STATS.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>

        {/* ─── Enterprise Proof Line ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={titleInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid #1F1F1F' }}
        >
          <p className="text-xs text-[#9CA3AF] uppercase tracking-[0.2em] font-semibold">
            Trusted by 25+ global enterprise engineering teams
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#10B981]">All Systems Operational</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
