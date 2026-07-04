'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface TldrBannerProps {
  tldr: string;
  methodologySummary?: string;
  confidence: number;
  sourcesCount?: number;
}

function confidenceArc(confidence: number) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, confidence));
  const arc = (clamped / 100) * circumference;
  return { dash: `${arc} ${circumference - arc}`, value: clamped, circumference };
}

function confidenceColor(v: number) {
  if (v >= 75) return '#00d4aa';
  if (v >= 50) return '#f59e0b';
  return '#f43f5e';
}

function ConfidenceIcon({ value }: { value: number }) {
  if (value >= 75) return <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#00d4aa' }} />;
  if (value >= 50) return <Info className="h-3.5 w-3.5" style={{ color: '#f59e0b' }} />;
  return <AlertCircle className="h-3.5 w-3.5" style={{ color: '#f43f5e' }} />;
}

export function TldrBanner({ tldr, methodologySummary, confidence, sourcesCount }: TldrBannerProps) {
  const arc = confidenceArc(confidence);
  const col = confidenceColor(arc.value);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] p-8 md:p-10 shadow-lg"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 min-w-0">
          <h2 className="font-sans text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-sky-400 mb-6">
            Abstract / Executive TL;DR
          </h2>
          <p className="font-serif text-base md:text-lg leading-relaxed text-zinc-200 text-justify">
            {tldr}
          </p>

          {methodologySummary && (
            <div className="mt-8 pt-6 border-t border-white/5">
              <h3 className="font-sans text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
                Introduction & Methodology
              </h3>
              <p className="font-serif text-sm leading-relaxed text-zinc-400">
                {methodologySummary}
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-center p-6 rounded-lg bg-black/40 border border-white/5 md:w-48">
          <div className="relative">
            <svg className="-rotate-90" width="80" height="80" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              <motion.circle
                cx="28" cy="28" r="22"
                fill="none"
                stroke={col}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={arc.dash}
                initial={{ strokeDasharray: `0 ${arc.circumference}` }}
                animate={{ strokeDasharray: arc.dash }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ filter: `drop-shadow(0 0 4px ${col})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold font-sans" style={{ color: col }}>{arc.value}%</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Confidence Score</p>
            {sourcesCount !== undefined && (
              <p className="font-sans text-[10px] text-zinc-600 mt-1">{sourcesCount} Sources Evaluated</p>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
