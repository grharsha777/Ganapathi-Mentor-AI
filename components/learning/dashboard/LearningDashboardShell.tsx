'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

export function LearningDashboardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-[#1f2937] bg-[#020617]',
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(56,189,248,0.10),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_55%_92%,rgba(251,191,36,0.10),transparent_42%),linear-gradient(135deg,#020617_0%,#0b1220_45%,#111827_100%)]" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay" />
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}

