'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import {
  Terminal, Zap, Layers, Cpu, Radio, Award,
  Copy, Check, ArrowRight, Activity, Network, ShieldAlert, FileText
} from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

// ─── Tech Stack Marquee ──────────────────────────────────────────────────────
function MarqueeRow({ text, dir }: { text: string; dir: 'left' | 'right' }) {
  return (
    <div className="flex w-full overflow-hidden whitespace-nowrap">
      <motion.div
        initial={{ x: dir === 'left' ? '0%' : '-50%' }}
        animate={{ x: dir === 'left' ? '-50%' : '0%' }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 35 }}
        className="flex whitespace-nowrap text-[clamp(3rem,8vw,6rem)] font-black uppercase text-white/[0.03] select-none tracking-tight"
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="mr-8">{text}</span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function NeuralLanding() {
  const [copied, setCopied] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // ─── 3D Mouse Tracking with Heavy Momentum ─────────────────────────────
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Heavy spring: mass=3 creates dramatic momentum/inertia
  const heavy = { damping: 12, stiffness: 40, mass: 3 };
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [18, -18]), heavy);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-22, 22]), heavy);
  const textX = useSpring(useTransform(mx, [-0.5, 0.5], [-40, 40]), heavy);
  const textY = useSpring(useTransform(my, [-0.5, 0.5], [-30, 30]), heavy);
  const skewXVal = useSpring(useTransform(mx, [-0.5, 0.5], [-3, 3]), heavy);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    };
    const handleLeave = () => {
      mx.set(0);
      my.set(0);
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [mx, my]);

  const handleCopy = () => {
    navigator.clipboard.writeText('npm i -g ganapathi-mentor-cli');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          SLIDE 1: GANAPATHI AI — AURORA HERO
          Full-screen immersive branding with 3D perspective text,
          aurora gradient blobs, and glowing particle background.
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="h-screen w-full snap-start relative flex flex-col items-center justify-center overflow-hidden"
        style={{ background: '#030712' }}
      >
        {/* ── Aurora Gradient Blobs ──────────────────────────────────────── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Purple Blob — slow orbit top-left */}
          <motion.div
            animate={{
              x: [0, 120, -80, 100, 0],
              y: [0, -100, 120, -50, 0],
              scale: [1, 1.3, 0.85, 1.15, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[5%] left-[15%] w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full opacity-30"
            style={{
              background:
                'radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(124,58,237,0.1) 40%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          {/* Cyan Blob — drift top-right */}
          <motion.div
            animate={{
              x: [0, -120, 80, -140, 0],
              y: [0, 70, -100, 60, 0],
              scale: [1, 0.85, 1.25, 0.9, 1],
            }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[20%] right-[5%] w-[450px] h-[450px] md:w-[700px] md:h-[700px] rounded-full opacity-25"
            style={{
              background:
                'radial-gradient(circle, rgba(56,189,248,0.6) 0%, rgba(56,189,248,0.1) 40%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          {/* Rose/Pink Blob — bottom center */}
          <motion.div
            animate={{
              x: [0, 90, -50, 70, 0],
              y: [0, -70, 90, -40, 0],
              scale: [1, 1.15, 0.9, 1.2, 1],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[5%] left-[35%] w-[500px] h-[500px] md:w-[750px] md:h-[750px] rounded-full opacity-20"
            style={{
              background:
                'radial-gradient(circle, rgba(236,72,153,0.5) 0%, rgba(236,72,153,0.08) 40%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
          {/* Teal Blob — bottom-left */}
          <motion.div
            animate={{
              x: [0, -70, 100, -40, 0],
              y: [0, 100, -60, 80, 0],
              scale: [1, 1.2, 0.8, 1.1, 1],
            }}
            transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[55%] left-[5%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full opacity-20"
            style={{
              background:
                'radial-gradient(circle, rgba(20,184,166,0.5) 0%, rgba(20,184,166,0.08) 40%, transparent 70%)',
              filter: 'blur(90px)',
            }}
          />
          {/* Blue core Blob — center (subtle) */}
          <motion.div
            animate={{
              scale: [1, 1.1, 0.95, 1.05, 1],
              opacity: [0.15, 0.25, 0.15, 0.2, 0.15],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 60%)',
              filter: 'blur(100px)',
            }}
          />
        </div>

        {/* ── 3D Perspective Title Container ─────────────────────────────── */}
        <div className="relative z-10" style={{ perspective: '800px' }}>
          <motion.div
            style={{
              rotateX: rotX,
              rotateY: rotY,
              x: textX,
              y: textY,
              skewX: skewXVal,
              transformStyle: 'preserve-3d',
            }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.75, rotateX: 25 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(3rem,15vw,12rem)] font-black uppercase tracking-[-0.04em] text-white leading-none select-none"
              style={{
                textShadow:
                  '0 0 80px rgba(124,58,237,0.5), 0 0 160px rgba(56,189,248,0.25), 0 6px 30px rgba(0,0,0,0.6)',
                transform: 'translateZ(60px)',
              }}
            >
              GANAPATHI{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-teal-400">
                AI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 font-mono text-[clamp(11px,1.6vw,15px)] text-white/40 uppercase tracking-[0.3em]"
              style={{ transform: 'translateZ(25px)' }}
            >
              The AI that lives in your code, terminal &amp; web
            </motion.p>
          </motion.div>
        </div>

        {/* ── Scroll Indicator ───────────────────────────────────────────── */}
        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] text-white/25 uppercase tracking-[0.35em]">
            Scroll
          </span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-white/25 to-transparent" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SLIDE 2: CORE NARRATIVE + CTAs
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen w-full snap-start relative flex flex-col items-center justify-center overflow-hidden border-b border-white/[0.05]">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-600/10 to-cyan-400/10 rounded-full blur-[140px] opacity-50 pointer-events-none" />

        {/* Tech Stack Marquee */}
        <div className="absolute inset-0 z-0 flex flex-col justify-center gap-20 opacity-80 pointer-events-none">
          <MarqueeRow text="NEXT.JS • REACT • TAILWIND • TYPESCRIPT • FRAMER MOTION •" dir="left" />
          <MarqueeRow text="AWS BEDROCK • MISTRAL • CLAUDE • GPT-4O • GROQ •" dir="right" />
          <MarqueeRow text="WEBSOCKETS • PYTHON • POSTGRES • REDIS • DOCKER •" dir="left" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 py-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-sm font-mono backdrop-blur-xl"
            >
              <Zap className="w-4 h-4" />
              <span>Neural Code Symbiosis</span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="text-[clamp(2rem,5vw,4.5rem)] font-black tracking-tight text-white leading-[1.05]"
            >
              The AI Mentor That Lives in Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Code
              </span>
              , Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Terminal
              </span>
              , and Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Career.
              </span>
            </motion.h2>

            <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Go from local terminal commits to production-ready architect. Ganapathi
              Mentor AI unifies deep learning paths, real-time WebSocket local syncing,
              voice interview simulations, and an elite global CLI.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
            >
              <Link
                href="/auth/sign-up"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-bold rounded-lg overflow-hidden transition-transform hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">
                  Launch Console{' '}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <button
                onClick={handleCopy}
                className="group flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/[0.1] rounded-lg hover:border-cyan-500/50 transition-colors backdrop-blur-xl"
              >
                <Terminal className="w-5 h-5 text-cyan-400" />
                <code className="font-mono text-sm text-slate-300 group-hover:text-white transition-colors">
                  npm i -g ganapathi-mentor-cli
                </code>
                <div className="pl-3 border-l border-white/[0.1]">
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  )}
                </div>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SLIDE 3: THE UBIQUITOUS RUNTIME
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen w-full snap-start relative py-24 px-6 border-b border-white/[0.05] flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              The Ubiquitous{' '}
              <span className="text-cyan-400">Runtime.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-2xl">
              Forget context switching. Ganapathi Mentor AI operates where you do—bridging
              the gap between the IDE, the terminal, and the web.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hive WebSocket Sync */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-[#0F172A]/80 to-[#020617]/80 border border-white/[0.08] relative overflow-hidden group backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Network className="w-32 h-32 text-cyan-400" />
              </div>
              <Cpu className="w-10 h-10 text-cyan-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Hive WebSocket Sync</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                A secure, bidirectional WebSocket bridge that mirrors your{' '}
                <code className="text-white">localhost</code> state to the web console. Conduct
                live architectural reviews, debug runtime traces, and chat with Claude/GPT-4o
                about your active code—all without copying and pasting a single file.
              </p>
              <div className="flex flex-wrap gap-3 mt-auto">
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-xs font-mono">
                  wss://api.ganapathi.ai
                </span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono">
                  End-to-End Encrypted
                </span>
              </div>
            </motion.div>

            {/* Global CLI */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -4 }}
              className="p-8 rounded-2xl bg-[#0F172A]/80 border border-white/[0.08] relative overflow-hidden group flex flex-col justify-center backdrop-blur-xl"
            >
              <Terminal className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-4">Global CLI</h3>
              <p className="text-slate-400 leading-relaxed">
                Run <code className="text-white">ganapathi scan</code> to instantly evaluate
                architecture drift, run unit test generation, and pull mentorship insights
                directly into your terminal.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SLIDE 4: CAREER & MASTERY BENTO
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen w-full snap-start relative py-24 px-6 border-b border-white/[0.05] flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="mb-16 md:text-right"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              The Continuous{' '}
              <span className="text-emerald-400">Upskilling Engine.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-2xl md:ml-auto">
              Dynamic roadmaps and gamified mastery. Built to transform junior developers
              into Staff Engineers.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[240px]">
            {/* AI Learning Paths — large card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 p-8 rounded-2xl bg-gradient-to-br from-[#0F172A]/80 to-[#020617]/80 border border-white/[0.08] flex flex-col backdrop-blur-xl"
            >
              <Layers className="w-10 h-10 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">AI Learning Paths</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-grow">
                Multi-tier Concept Engine that dynamically adjusts to your cognitive load.
                Generates custom roadmaps, curates AWS architecture concepts, and challenges
                you based on real-world system design patterns.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono">
                  System Design
                </span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono">
                  Microservices
                </span>
              </div>
            </motion.div>

            {/* Voice Interview Simulator */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="col-span-1 md:col-span-2 row-span-1 p-6 rounded-2xl bg-[#0F172A]/80 border border-white/[0.08] backdrop-blur-xl"
            >
              <Radio className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Voice Interview Simulator</h3>
              <p className="text-slate-400 text-sm">
                Real-time technical and system design audio prep powered by Groq&apos;s
                sub-second LPU inference.
              </p>
            </motion.div>

            {/* XP & Hackathons */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="col-span-1 row-span-1 p-6 rounded-2xl bg-[#0F172A]/80 border border-white/[0.08] backdrop-blur-xl"
            >
              <Award className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">XP &amp; Hackathons</h3>
              <p className="text-slate-400 text-sm">
                Gamified sandboxes with global leaderboards.
              </p>
            </motion.div>

            {/* Last-Minute Revision */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="col-span-1 row-span-1 p-6 rounded-2xl bg-[#0F172A]/80 border border-white/[0.08] backdrop-blur-xl"
            >
              <Zap className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Last-Minute Revision</h3>
              <p className="text-slate-400 text-sm">
                Instant technical refreshers before your deployment or interview.
                It helps you crush hackathons and massive projects.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SLIDE 5: INTELLIGENCE PIPELINE
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen w-full snap-start relative py-24 px-6 bg-gradient-to-b from-[#020617] to-[#030712] flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="mb-16 text-center"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              Developer <span className="text-indigo-400">Intelligence Hub.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-2xl mx-auto">
              Stay ahead of the curve. A multi-source research engine aggregating insights
              from arXiv, StackOverflow, and Semantic Scholar.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Curated AI Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="group flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-b from-[#0F172A]/40 to-[#020617]/40 border border-white/[0.05] hover:border-indigo-500/30 backdrop-blur-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 relative z-10">
                <Activity className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">Curated AI Feed</h3>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                A real-time, noise-free pipeline of the latest developer tooling,
                framework updates, and architectural patterns.
              </p>
            </motion.div>

            {/* Dependency Drift */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -6 }}
              className="group flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-b from-[#0F172A]/40 to-[#020617]/40 border border-white/[0.05] hover:border-amber-500/30 backdrop-blur-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 relative z-10">
                <ShieldAlert className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">Dependency Drift</h3>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                Proactive warnings when your local stack falls behind industry
                standards or encounters critical CVEs.
              </p>
            </motion.div>

            {/* Paper Distillation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -6 }}
              className="group flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-b from-[#0F172A]/40 to-[#020617]/40 border border-white/[0.05] hover:border-emerald-500/30 backdrop-blur-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 relative z-10">
                <FileText className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">Paper Distillation</h3>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                Complex machine learning and distributed systems research papers
                automatically summarized into actionable engineering takeaways.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* ═══════════════════════════════════════════════════════════════════
          SLIDE 6: FREQUENTLY ASKED QUESTIONS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen w-full snap-start relative py-24 px-6 border-b border-white/[0.05] flex items-center bg-gradient-to-b from-[#030712] to-[#050505]">
        <div className="max-w-4xl mx-auto w-full relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="mb-16 text-center"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Questions.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg">
              Everything you need to know about the product and billing.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full rounded-3xl bg-[#0F172A]/20 border border-white/[0.05] backdrop-blur-2xl p-6 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {/* Subtle inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-white/[0.05] rounded-2xl bg-white/[0.02] px-6 data-[state=open]:bg-white/[0.04] transition-colors">
                <AccordionTrigger className="text-white hover:no-underline hover:text-cyan-400 transition-colors text-left text-lg py-6 font-medium">
                  What makes Ganapathi Mentor AI different from GitHub Copilot?
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 text-base leading-relaxed pb-6">
                  While Copilot focuses on line-by-line autocomplete, Ganapathi acts as a Staff Engineer paired with you. It reads your entire workspace architecture, provides system design feedback, simulates technical interviews, and warns you about dependency drift before you merge.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-white/[0.05] rounded-2xl bg-white/[0.02] px-6 data-[state=open]:bg-white/[0.04] transition-colors">
                <AccordionTrigger className="text-white hover:no-underline hover:text-cyan-400 transition-colors text-left text-lg py-6 font-medium">
                  How does the Hive WebSocket Sync work?
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 text-base leading-relaxed pb-6">
                  Using our global CLI, your local environment connects securely to our web dashboard. Your active file structure and unsaved changes are synced in real-time, allowing you to ask high-level architectural questions to our LLM cluster without pasting code manually.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border border-white/[0.05] rounded-2xl bg-white/[0.02] px-6 data-[state=open]:bg-white/[0.04] transition-colors">
                <AccordionTrigger className="text-white hover:no-underline hover:text-cyan-400 transition-colors text-left text-lg py-6 font-medium">
                  Is my proprietary code safe?
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 text-base leading-relaxed pb-6">
                  Yes. We use end-to-end encryption for WebSocket transmission. We offer enterprise plans that include zero-retention policies and local VPC deployments ensuring your codebase never leaves your internal network.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border border-white/[0.05] rounded-2xl bg-white/[0.02] px-6 data-[state=open]:bg-white/[0.04] transition-colors">
                <AccordionTrigger className="text-white hover:no-underline hover:text-cyan-400 transition-colors text-left text-lg py-6 font-medium">
                  Do you support custom enterprise integrations?
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 text-base leading-relaxed pb-6">
                  Absolutely. We provide dedicated support for integrating with internal CI/CD pipelines, private GitLab/Bitbucket instances, and custom SSO providers like Okta and Active Directory.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </section>
    </>
  );
}
