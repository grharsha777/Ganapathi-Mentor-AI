'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlus, BrainCircuit, Route, Trophy } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Sign Up in Seconds',
    desc: 'Create your account with Google OAuth or email. No credit card required. Enterprise SSO available.',
    meta: 'Setup time: <30s',
  },
  {
    num: '02',
    icon: BrainCircuit,
    title: 'Define Your Stack',
    desc: 'Tell the AI your learning targets, current skill level, preferred languages, and career objectives.',
    meta: 'Onboarding: 5 questions',
  },
  {
    num: '03',
    icon: Route,
    title: 'Get Your Neural Path',
    desc: 'Receive a personalized AI roadmap with curated resources, milestones, and real project briefs.',
    meta: 'Roadmap: <2 seconds',
  },
  {
    num: '04',
    icon: Trophy,
    title: 'Ship Real Products',
    desc: 'Track progress with analytics, complete challenges, and deploy production-ready code with AI assistance.',
    meta: 'Avg. time-to-ship: 8wks',
  },
] as const;

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative z-10 py-24 md:py-32"
      aria-labelledby="howitworks-heading"
    >
      {/* Top rule */}
      <div className="w-full h-px bg-[#1F1F1F] mb-0" />

      <div className="container mx-auto px-6 md:px-10 lg:px-16 max-w-7xl pt-16 md:pt-20">

        {/* ─── Header ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 md:mb-20"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#9CA3AF] mb-4 block">
            Protocol
          </span>
          <h2
            id="howitworks-heading"
            className="text-[clamp(2rem,4.5vw,4rem)] font-black text-[#FFFFFF] leading-[1.0] tracking-tight max-w-xl"
          >
            From Zero to
            <br />
            Production.
          </h2>
        </motion.div>

        {/* ─── Steps Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1F1F1F]">
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col gap-6 p-8"
      style={{ background: '#0D0D0D' }}
    >
      {/* Large step number — structural anchor */}
      <div
        className="absolute top-6 right-6 text-[4rem] font-black leading-none select-none pointer-events-none"
        style={{
          color: '#1F1F1F',
          fontFamily: 'var(--font-manrope), system-ui, sans-serif',
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        {step.num}
      </div>

      {/* Icon */}
      <Icon
        className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#FFFFFF] transition-colors duration-300 relative z-10"
        strokeWidth={1.5}
      />

      {/* Title */}
      <h3
        className="text-base font-bold text-[#FFFFFF] tracking-tight relative z-10"
        style={{ fontFamily: 'var(--font-manrope), system-ui, sans-serif' }}
      >
        {step.title}
      </h3>

      {/* Desc */}
      <p className="text-sm text-[#9CA3AF] leading-relaxed flex-1 relative z-10">
        {step.desc}
      </p>

      {/* Meta tag */}
      <div
        className="inline-flex items-center gap-2 self-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10"
        style={{ borderTop: '1px solid #1F1F1F', paddingTop: '1rem' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#10B981]">
          {step.meta}
        </span>
      </div>

      {/* Left edge accent on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-[#8B5CF6] scale-y-0 group-hover:scale-y-100 transition-transform duration-400 origin-top" />
    </motion.div>
  );
}
