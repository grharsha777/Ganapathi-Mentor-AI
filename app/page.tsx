"use client";

import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Code, Zap, Globe, Sparkles, MessageSquare,
  BarChart2, Users, Play, Star, CheckCircle2, Shield, Cpu,
  Linkedin, Github, Mail, ChevronDown, Rocket, BookOpen,
  Mic, Image as ImageIcon, Brain, Target, Trophy, Clock,
  Layers, Terminal, Eye, Wand2, Music, Newspaper, Video,
  Palette, Server, Bot, Blocks, GraduationCap, Cable,
  MousePointer2, Braces, Database, Cloud, Lock, Gauge,
  FileCode2, Workflow, Atom, Flame, Lightbulb, Heart
} from 'lucide-react';
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

// ─── CUSTOM CURSOR ───────────────────────────────────────────────
function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hue, setHue] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const [trail, setTrail] = useState<{ x: number, y: number, id: number }[]>([]);
  const trailId = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      trailId.current++;
      setTrail(prev => [...prev.slice(-12), { x: e.clientX, y: e.clientY, id: trailId.current }]);
    };
    const over = () => setIsHover(true);
    const out = () => setIsHover(false);
    window.addEventListener('mousemove', move);
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', over);
      el.addEventListener('mouseleave', out);
    });

    const hueInterval = setInterval(() => setHue(h => (h + 1) % 360), 30);

    return () => {
      window.removeEventListener('mousemove', move);
      clearInterval(hueInterval);
    };
  }, []);

  return (
    <>
      <div className="fixed pointer-events-none z-[9999] hidden lg:block" style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}>
        <div
          className="rounded-full transition-all duration-150 ease-out"
          style={{
            width: isHover ? 48 : 20,
            height: isHover ? 48 : 20,
            border: `2px solid hsl(${hue}, 90%, 65%)`,
            boxShadow: `0 0 20px hsl(${hue}, 90%, 65%, 0.4), 0 0 60px hsl(${hue}, 90%, 65%, 0.1)`,
            background: isHover ? `hsl(${hue}, 90%, 65%, 0.1)` : 'transparent',
          }}
        />
      </div>
      {trail.map((t, i) => (
        <div
          key={t.id}
          className="fixed pointer-events-none z-[9998] rounded-full hidden lg:block"
          style={{
            left: t.x, top: t.y,
            transform: 'translate(-50%, -50%)',
            width: 4 + i * 0.3,
            height: 4 + i * 0.3,
            background: `hsl(${(hue + i * 8) % 360}, 80%, 60%)`,
            opacity: (i + 1) / trail.length * 0.5,
          }}
        />
      ))}
    </>
  );
}

// ─── Animated Counter ────────────────────────────────────────────
function Counter({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    const step = Math.ceil(end / (duration * 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Floating Particles ──────────────────────────────────────────
function Particles({ count = 40 }: { count?: number }) {
  const [particles, setParticles] = useState<{ width: number, height: number, left: string, top: string, duration: number, delay: number, hue: number }[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setParticles(Array.from({ length: count }).map(() => ({
        width: Math.random() * 4 + 1,
        height: Math.random() * 4 + 1,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: Math.random() * 5 + 3,
        delay: Math.random() * 3,
        hue: Math.random() * 360,
      })));
    }, 0);
  }, [count]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.width,
            height: p.height,
            left: p.left,
            top: p.top,
            background: `hsl(${p.hue}, 70%, 60%)`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.6, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Color Shifting Background ───────────────────────────────────
function AuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute w-[800px] h-[800px] -top-[300px] -left-[200px] rounded-full animate-aurora-1"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
      <div className="absolute w-[600px] h-[600px] top-[20%] -right-[150px] rounded-full animate-aurora-2"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
      <div className="absolute w-[700px] h-[700px] -bottom-[200px] left-[20%] rounded-full animate-aurora-3"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)' }} />
      <div className="absolute w-[500px] h-[500px] top-[50%] left-[40%] rounded-full animate-aurora-1"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', animationDelay: '3s' }} />
    </div>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-black/80 backdrop-blur-3xl border-b border-white/5 py-2 md:py-3'
        : 'bg-transparent py-3 md:py-5'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 overflow-hidden group-hover:shadow-indigo-500/50 transition-all group-hover:scale-110">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }} />
            <Sparkles className="h-5 w-5 text-white hidden" />
          </div>
          <span className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200">
            Ganapathi AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-all rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10">
            Sign In
          </Link>
          <Link href="/auth/sign-up" className="group relative px-6 py-2.5 text-sm font-bold rounded-xl text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-pink-600 via-indigo-600 to-cyan-600" />
            <span className="relative z-10 flex items-center gap-2">
              Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        <button className="flex md:hidden flex-col gap-1.5 p-2" onClick={() => setMobileMenu(!mobileMenu)}>
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenu ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenu ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenu ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-3xl border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <Link href="/auth/login" className="py-3 text-center text-gray-300 hover:text-white font-medium rounded-xl hover:bg-white/5 transition-all" onClick={() => setMobileMenu(false)}>Sign In</Link>
              <Link href="/auth/sign-up" className="py-3 text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl" onClick={() => setMobileMenu(false)}>Get Started Free</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── HERO ────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
      <Particles count={50} />

      <motion.div style={{ y, opacity, scale }} className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-6 sm:mb-8 hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs sm:text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">v3.0 Neural Nexus — Now Live</span>
          <ArrowRight className="h-3.5 w-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6rem] font-black tracking-tighter mb-6 sm:mb-8 leading-[0.95]"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
            The Future of
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x bg-[length:200%_auto]">
            AI-Powered Development
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2"
        >
          Experience the world&apos;s most advanced AI mentor. Powered by
          <span className="text-indigo-400 font-semibold"> Mistral</span>,
          <span className="text-purple-400 font-semibold"> Claude</span>,
          <span className="text-pink-400 font-semibold"> GPT</span>,
          <span className="text-cyan-400 font-semibold"> Gemini</span>, and
          <span className="text-emerald-400 font-semibold"> Groq</span> —
          your code mentor, debugger, architect, and creative studio in one legendary platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:px-0"
        >
          <Link href="/auth/sign-up" className="group w-full sm:w-auto relative px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x bg-[length:200%_auto]" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 text-white flex items-center justify-center gap-2">
              Start Building Free <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link href="#features" className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm hover:border-white/20">
            <Play className="h-5 w-5 fill-current text-indigo-400" />
            Explore Platform
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold">Discover</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="h-5 w-5 text-gray-600" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── AI PARTNERS MARQUEE ─────────────────────────────────────────
function AIPartners() {
  const partners = [
    { name: "AWS", color: "text-orange-400" },
    { name: "Mistral AI", color: "text-indigo-400" },
    { name: "Groq", color: "text-cyan-400" },
    { name: "Grok (xAI)", color: "text-blue-400" },
    { name: "Claude (Anthropic)", color: "text-amber-400" },
    { name: "Gemini (Google)", color: "text-emerald-400" },
    { name: "GPT (OpenAI)", color: "text-green-400" },
    { name: "Kling AI", color: "text-pink-400" },
    { name: "Runway ML", color: "text-purple-400" },
    { name: "NanoBanana", color: "text-yellow-400" },
    { name: "Freepik AI", color: "text-rose-400" },
    { name: "NewsOrg API", color: "text-sky-400" },
    { name: "Vercel", color: "text-white" },
    { name: "MongoDB Atlas", color: "text-green-500" },
    { name: "Sarvam AI", color: "text-violet-400" },
  ];

  return (
    <section className="relative z-10 py-8 sm:py-12 border-y border-white/5 bg-black/20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 text-center mb-6">
        <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-gray-500">
          Powered by the World&apos;s Leading AI Infrastructure
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#030014] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#030014] to-transparent z-10" />
        <div className="flex animate-scroll-x gap-10 sm:gap-16">
          {[...partners, ...partners, ...partners].map((p, i) => (
            <span key={i} className={`text-sm sm:text-base md:text-lg font-black whitespace-nowrap flex-shrink-0 ${p.color} opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default select-none`}>
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STATS BAR ───────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: 50000, suffix: "+", label: "Active Developers", icon: Users },
    { value: 2, suffix: "M+", label: "Lines Analyzed", icon: Code },
    { value: 99, suffix: "%", label: "Uptime SLA", icon: Shield },
    { value: 150, suffix: "+", label: "Countries Reached", icon: Globe },
    { value: 15, suffix: "+", label: "AI Models Integrated", icon: Cpu },
  ];

  return (
    <div className="relative z-10 py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center group-hover:border-indigo-500/30 group-hover:shadow-lg group-hover:shadow-indigo-500/10 transition-all">
                <s.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-1">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE SHOWCASE ────────────────────────────────────────────
function FeatureShowcase() {
  const features = [
    { title: "Neural AI Chatbot", desc: "Multi-model conversations powered by GPT-4o, Gemini Pro, Claude 3, and Mistral Large. Context-aware code generation with streaming responses.", icon: MessageSquare, gradient: "from-indigo-500 to-purple-600" },
    { title: "Quantum Code Review", desc: "Architecture-level feedback, security vulnerability detection, performance profiling, and automated refactoring suggestions.", icon: Code, gradient: "from-orange-500 to-red-500" },
    { title: "Adaptive Learning Paths", desc: "AI-generated personalized roadmaps that evolve with your skills. 500+ curated courses across 50+ technologies.", icon: GraduationCap, gradient: "from-emerald-500 to-teal-500" },
    { title: "Voice Interview Simulator", desc: "Practice real interviews with AI-powered voice simulation. Technical, behavioral, and system design rounds with instant feedback.", icon: Mic, gradient: "from-pink-500 to-rose-500" },
    { title: "Creative AI Studio", desc: "Generate images with Freepik AI, create videos with Kling & Runway ML, compose music, and design visual assets.", icon: Palette, gradient: "from-cyan-500 to-blue-500" },
    { title: "Productivity Neural Hub", desc: "AI task prioritization using Eisenhower Matrix, Pomodoro timers, smart agenda, and automated workflow generation.", icon: Target, gradient: "from-amber-500 to-yellow-500" },
    { title: "DevOps Command Center", desc: "Docker orchestration, CI/CD pipeline generation, infrastructure monitoring, and cloud deployment automation powered by AWS.", icon: Server, gradient: "from-violet-500 to-indigo-500" },
    { title: "Real-Time News Engine", desc: "Developer-focused news aggregation via NewsOrg API. Stay updated with AI-curated tech headlines and industry trends.", icon: Newspaper, gradient: "from-sky-500 to-cyan-500" },
    { title: "Terminal Mentor CLI", desc: "A legendary AI architect living in your command line. npm install -g ganapathi-mentor-cli for instant access worldwide.", icon: Terminal, gradient: "from-green-500 to-emerald-500" },
  ];

  return (
    <section id="features" className="py-20 sm:py-32 relative z-10">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.35em] text-indigo-400 mb-4 block">Feature Arsenal</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-5 px-2 leading-tight">
            One Platform.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Infinite Power.</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Every tool a developer needs — from AI-powered code review to creative media generation — unified in one legendary experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 max-w-7xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative p-7 lg:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm hover:border-white/15 transition-all duration-500 hover:shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={`relative z-10 h-14 w-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <f.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="relative z-10 text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-200 transition-all">{f.title}</h3>
              <p className="relative z-10 text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: Rocket, title: "Sign Up in Seconds", desc: "Create your free account with Google OAuth or email. No credit card required.", color: "from-indigo-500 to-blue-500" },
    { icon: Brain, title: "Tell AI Your Goals", desc: "Share your learning targets, current skill level, and preferred stack.", color: "from-purple-500 to-pink-500" },
    { icon: BookOpen, title: "Get Your Neural Path", desc: "Receive a personalized AI roadmap with curated resources and milestones.", color: "from-emerald-500 to-teal-500" },
    { icon: Trophy, title: "Level Up & Ship", desc: "Track progress with analytics, earn achievements, and build real projects.", color: "from-amber-500 to-orange-500" },
  ];

  return (
    <section className="py-20 sm:py-32 relative z-10">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.35em] text-purple-400 mb-4 block">How It Works</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 px-2">From Zero to <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Legendary</span></h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -5 }}
              className="relative text-center group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-all"
            >
              <div className="relative mx-auto mb-6">
                <div className={`h-20 w-20 rounded-3xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                  <s.icon className="h-9 w-9 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white text-black text-sm font-black flex items-center justify-center shadow-lg">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ────────────────────────────────────────────────
function Testimonials() {
  const reviews = [
    { name: "Sarah Chen", role: "Frontend Dev @ Google", text: "Ganapathi AI helped me understand React hooks in minutes. The multi-model AI is incredibly precise. It's like having a senior dev mentor 24/7.", avatar: "SC" },
    { name: "Mike Ross", role: "Full Stack Engineer", text: "The code review feature caught a memory leak I missed completely. The architecture feedback is on par with a staff engineer's review.", avatar: "MR" },
    { name: "Alex V.", role: "CS Student, MIT", text: "Best learning companion ever. The adaptive roadmap adjusted to my pace perfectly. Went from basics to shipping a full-stack app in 8 weeks.", avatar: "AV" },
    { name: "Priya K.", role: "DevOps Lead @ Amazon", text: "The DevOps command center and interview prep helped me land my dream job. AWS integration is seamless. Absolutely game-changing.", avatar: "PK" },
    { name: "James Li", role: "Startup Founder", text: "We onboard new devs 3x faster using Ganapathi's learning paths. The creative studio saves us thousands in design costs monthly.", avatar: "JL" },
    { name: "Emma Wilson", role: "Senior SWE @ Meta", text: "The terminal CLI is a masterpiece. I use ganapathi-mentor daily for code reviews, planning, and debugging. It's replaced my IDE copilot.", avatar: "EW" },
  ];

  return (
    <section className="py-20 sm:py-32 relative z-10">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.35em] text-yellow-400 mb-4 block">Testimonials</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black px-2">
            Trusted by <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">50,000+</span> Developers
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
              className="p-7 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-sm sm:text-base text-gray-300 mb-6 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center font-bold text-xs text-white shadow-lg">
                  {r.avatar}
                </div>
                <div>
                  <div className="font-bold text-sm">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 sm:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/15 to-pink-600/10" />
      <Particles count={30} />
      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-block mb-8"
          >
            <Flame className="w-16 h-16 text-orange-400" />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 sm:mb-8 px-2 leading-tight">
            Ready to Build<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Something Legendary?</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto px-2 leading-relaxed">
            Join 50,000+ developers who have already unlocked the most powerful AI development platform on the planet.
          </p>
          <Link href="/auth/sign-up" className="group relative inline-flex items-center gap-3 px-10 sm:px-14 py-5 sm:py-6 rounded-full font-black text-lg sm:text-xl overflow-hidden">
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 text-black group-hover:text-white transition-colors">Get Started Now</span>
            <ArrowRight className="relative z-10 h-6 w-6 text-black group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-12 sm:py-16 border-t border-white/5 bg-black/60 text-sm text-gray-500">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="text-center md:text-left">
            <span className="font-black text-white text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Ganapathi Mentor AI</span>
            <p className="mt-2 text-gray-500">The world&apos;s most advanced AI development platform.</p>
            <p className="mt-1 text-gray-600">Built with ❤️ by G R Harsha</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <a href="https://www.linkedin.com/in/grharsha777/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 font-medium">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
            <a href="https://github.com/grharsha777" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors flex items-center gap-1.5 font-medium">
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a href="mailto:grharsha777@gmail.com" className="hover:text-pink-400 transition-colors flex items-center gap-1.5 font-medium">
              <Mail className="h-4 w-4" /> Gmail
            </a>
          </div>
          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} All rights reserved.</p>
            <p className="text-[10px] mt-1 text-gray-600 uppercase tracking-widest font-bold">Neural Code Symbiosis</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── GLOBAL CSS ANIMATIONS ───────────────────────────────────────
function GlobalStyles() {
  return (
    <style jsx global>{`
      @keyframes aurora-1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
      }
      @keyframes aurora-2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-40px, 30px) scale(1.15); }
        66% { transform: translate(30px, -40px) scale(0.85); }
      }
      @keyframes aurora-3 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(50px, 20px) scale(0.95); }
        66% { transform: translate(-30px, -30px) scale(1.1); }
      }
      .animate-aurora-1 { animation: aurora-1 12s ease-in-out infinite; }
      .animate-aurora-2 { animation: aurora-2 15s ease-in-out infinite; }
      .animate-aurora-3 { animation: aurora-3 18s ease-in-out infinite; }
      @keyframes gradient-x {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      .animate-gradient-x { animation: gradient-x 4s ease infinite; }
      @keyframes scroll-x {
        from { transform: translateX(0); }
        to { transform: translateX(-33.333%); }
      }
      .animate-scroll-x { animation: scroll-x 30s linear infinite; }
      body { cursor: none; }
      @media (max-width: 1023px) { body { cursor: auto; } }
      .scrollbar-none::-webkit-scrollbar { display: none; }
      .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <GlobalStyles />
      <CustomCursor />
      <AuroraBackground />
      <Navbar />
      <Hero />
      <AIPartners />
      <StatsBar />
      <FeatureShowcase />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
