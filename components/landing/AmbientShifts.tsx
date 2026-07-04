'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { AmbientShiftsProps } from '@/types/landing';

/**
 * AmbientShifts
 *
 * Scroll-driven full-bleed background context transition.
 * As the user scrolls through the wrapped content, the viewport
 * baseline atmosphere transitions mathematically from Deep Carbon
 * (#050505) into a pure deep-slate block (#080E1A) and back.
 *
 * – Uses Framer Motion useScroll + useTransform for pixel-perfect easing
 * – No jarring cuts: the transition is a smooth linear interpolation
 * – Pointer-events passthrough: the bg layer never blocks content
 * – The section itself carries the id="how-it-works" anchor
 */
export default function AmbientShifts({
  children,
  baseColor = '#050505',
  peakColor = '#000A1A', // Deep Cyber Blue base
}: AmbientShiftsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Full-bleed background color: base → peak → base across the section
  // We map via a 0→0.5→1 keyframe so the peak hits at section midpoint
  const bgOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0,   1,    1,   1,   0]
  );

  return (
    <div ref={sectionRef} id="how-it-works" className="relative">
      {/* ── Ambient background layer ─────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundColor: peakColor,
          opacity:         bgOpacity,
        }}
        aria-hidden="true"
      />

      {/* ── Top edge — crisp 1px rule ─────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
        style={{ background: '#1F1F1F' }}
        aria-hidden="true"
      />

      {/* ── Bottom edge ───────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none z-10"
        style={{ background: '#1F1F1F' }}
        aria-hidden="true"
      />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
