"use client";

import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Code, Zap, Globe, Sparkles, MessageSquare,
  BarChart2, Users, Play, Star, CheckCircle2, Shield, Cpu,
  Linkedin, Github, Mail, ChevronDown, Rocket, BookOpen,
  Mic, Image as ImageIcon, Brain, Target, Trophy, Clock
} from 'lucide-react';
import React, { useRef, useState, useEffect, useCallback } from 'react'
  ;

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
function Particles() {
  const [particles, setParticles] = useState<{ width: number, height: number, left: string, top: string, duration: number, delay: number }[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setParticles(Array.from({ length: 30 }).map(() => ({
        width: Math.random() * 4 + 2,
        height: Math.random() * 4 + 2,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 2,
      })));
    }, 0);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p: { width: number, height: number, left: string, top: string, duration: number, delay: number }, i: number) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-indigo-500/20"
          style={{
            width: p.width,
            height: p.height,
            left: p.left,
            top: p.top,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
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
        ? 'bg-black/70 backdrop-blur-2xl border-b border-white/5 py-2 md:py-3'
        : 'bg-transparent py-3 md:py-5'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 overflow-hidden group-hover:shadow-indigo-500/50 transition-shadow">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }} />
            <Sparkles className="h-5 w-5 text-white hidden" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Ganapathi AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            Sign In
          </Link>
          <Link href="/auth/sign-up" className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-105">
            Get Started Free
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex md:hidden flex-col gap-1.5 p-2"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenu ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenu ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenu ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <Link href="/auth/login" className="py-3 text-center text-gray-300 hover:text-white font-medium rounded-xl hover:bg-white/5 transition-all" onClick={() => setMobileMenu(false)}>
                Sign In
              </Link>
              <Link href="/auth/sign-up" className="py-3 text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl" onClick={() => setMobileMenu(false)}>
                Get Started Free
              </Link>
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
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
      <Particles />
      {/* Aurora Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-purple-600/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[10%] right-[-15%] w-[50%] h-[70%] bg-indigo-600/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[-15%] left-[15%] w-[70%] h-[50%] bg-cyan-600/8 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div style={{ y, opacity }} className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 sm:mb-8 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs sm:text-sm font-medium text-gray-300">v2.0 Neural Update Live</span>
          <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[5.5rem] 2xl:text-[6.5rem] font-extrabold tracking-tight mb-6 sm:mb-8 leading-[1.1]"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
            Master Coding with
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            AI Mentorship
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-gray-400 max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2"
        >
          Your intelligent companion for learning code, debugging complex issues,
          and building software faster. Powered by advanced neural networks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:px-0"
        >
          <Link href="/auth/sign-up" className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-base sm:text-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2 group">
            Start Learning Free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#features" className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium text-base sm:text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
            <Play className="h-5 w-5 fill-current" />
            Explore Features
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── STATS BAR ───────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: 50000, suffix: "+", label: "Active Users" },
    { value: 2, suffix: "M+", label: "Lines Reviewed" },
    { value: 99, suffix: "%", label: "Satisfaction" },
    { value: 150, suffix: "+", label: "Countries" },
  ];

  return (
    <div className="relative z-10 py-10 sm:py-14 border-y border-white/5 bg-gradient-to-r from-black/40 via-indigo-950/10 to-black/40">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-1">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE SHOWCASE (MOBILE SCROLL + DESKTOP GRID) ─────────────
function FeatureShowcase() {
  const features = [
    {
      title: "Neural AI Chatbot",
      desc: "Instant answers, code generation, debugging help, and real-time AI conversation powered by GPT-4o and Gemini.",
      icon: MessageSquare,
      gradient: "from-indigo-500 to-purple-600",
      glow: "shadow-indigo-500/20",
    },
    {
      title: "Smart Code Review",
      desc: "Get expert-level architecture feedback, security vulnerability detection, and performance optimization suggestions.",
      icon: Code,
      gradient: "from-orange-500 to-red-500",
      glow: "shadow-orange-500/20",
    },
    {
      title: "Adaptive Roadmaps",
      desc: "AI-generated personalized learning paths that adapt to your skill level and career goals.",
      icon: Globe,
      gradient: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/20",
    },
    {
      title: "Interview Simulator",
      desc: "Practice with voice-first AI interviews including technical, behavioral, and system design rounds.",
      icon: Mic,
      gradient: "from-pink-500 to-rose-500",
      glow: "shadow-pink-500/20",
    },
    {
      title: "Creative Studio",
      desc: "Generate images, diagrams, and visual assets directly within the platform for your projects.",
      icon: ImageIcon,
      gradient: "from-cyan-500 to-blue-500",
      glow: "shadow-cyan-500/20",
    },
    {
      title: "Productivity Hub",
      desc: "AI-powered task prioritization using Eisenhower Matrix and smart agenda generation.",
      icon: Target,
      gradient: "from-amber-500 to-yellow-500",
      glow: "shadow-amber-500/20",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 relative z-10">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3 block">Features</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 px-2">
            Everything you need to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">ship faster</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Powerful AI tools integrated into one seamless, premium platform.
          </p>
        </motion.div>

        {/* Mobile: Horizontal Scroll Carousel */}
        <div className="flex md:hidden gap-4 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 scrollbar-none">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              className="snap-center flex-shrink-0 w-[80vw] max-w-[320px]"
            >
              <div className={`h-full p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all shadow-xl ${f.glow}`}>
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: Bento Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`group p-7 lg:p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl ${f.glow}`}
            >
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed">{f.desc}</p>
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
    { icon: Rocket, title: "Sign Up in Seconds", desc: "Create your free account with Google OAuth or email." },
    { icon: Brain, title: "Tell AI Your Goals", desc: "Share your learning targets and current skill level." },
    { icon: BookOpen, title: "Get Personalized Path", desc: "Receive a custom roadmap with curated resources." },
    { icon: Trophy, title: "Track & Level Up", desc: "Monitor progress with analytics and earn achievements." },
  ];

  return (
    <section className="py-16 sm:py-24 relative z-10 bg-gradient-to-b from-transparent via-indigo-950/5 to-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3 block">How It Works</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 px-2">From zero to hero in 4 steps</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative text-center group"
            >
              <div className="relative mx-auto mb-5">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto group-hover:border-indigo-500/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-500/10">
                  <s.icon className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-400" />
                </div>
                <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TECH STACK SHOWCASE ─────────────────────────────────────────
function TechStack() {
  const techs = [
    "Next.js 15", "React 19", "TypeScript", "TailwindCSS", "MongoDB",
    "Vercel AI SDK", "GPT-4o", "Gemini", "Framer Motion", "IndexedDB"
  ];

  return (
    <section className="py-12 sm:py-16 relative z-10 border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 text-center mb-8">
        <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-widest">Powered by Modern Stack</p>
      </div>
      {/* Infinite Scroll Strip */}
      <div className="relative">
        <div className="flex animate-scroll-x gap-8 sm:gap-12">
          {[...techs, ...techs].map((t, i) => (
            <span key={i} className="text-base sm:text-lg md:text-xl font-bold text-white/20 hover:text-white/60 transition-colors whitespace-nowrap cursor-default select-none flex-shrink-0">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ────────────────────────────────────────────────
function Testimonials() {
  const reviews = [
    { name: "Sarah Chen", role: "Frontend Dev @ Google", text: "Ganapathi AI helped me understand React hooks in minutes. Usually takes me hours of reading docs!", avatar: "SC" },
    { name: "Mike Ross", role: "Full Stack Engineer", text: "The code review feature is insane. It caught a memory leak I missed completely.", avatar: "MR" },
    { name: "Alex V.", role: "CS Student, MIT", text: "Best learning companion ever. It's like having a senior dev sitting next to you 24/7.", avatar: "AV" },
    { name: "Priya K.", role: "DevOps Lead", text: "The interview prep feature helped me land my dream job. The voice simulation is incredibly realistic.", avatar: "PK" },
    { name: "James Li", role: "Startup Founder", text: "We onboard new devs 3x faster using Ganapathi's learning paths. Absolutely game-changing.", avatar: "JL" },
    { name: "Emma Wilson", role: "Senior SWE", text: "The productivity hub's Eisenhower Matrix saves me hours every week. Brilliant implementation.", avatar: "EW" },
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-transparent to-indigo-950/10 relative z-10">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-yellow-400 mb-3 block">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold px-2">Loved by developers worldwide</h2>
        </motion.div>

        {/* Mobile: Horizontal scroll */}
        <div className="flex md:hidden gap-4 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 scrollbar-none">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              className="snap-center flex-shrink-0 w-[85vw] max-w-[340px]"
            >
              <TestimonialCard r={r} />
            </motion.div>
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <TestimonialCard r={r} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ r }: { r: { name: string; role: string; text: string; avatar: string } }) {
  return (
    <div className="h-full p-6 sm:p-7 rounded-2xl bg-white/[0.03] border border-white/10 relative hover:border-white/20 transition-all">
      <div className="flex gap-1 mb-4 text-yellow-400">
        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />)}
      </div>
      <p className="text-sm sm:text-base text-gray-300 mb-5 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-lg">
          {r.avatar}
        </div>
        <div>
          <div className="font-bold text-sm">{r.name}</div>
          <div className="text-xs text-gray-500">{r.role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 blur-[100px]" />
      <Particles />
      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 sm:mb-8 px-2">Ready to level up?</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
            Join thousands of developers building the future with Ganapathi Mentor AI.
          </p>
          <Link href="/auth/sign-up" className="inline-flex items-center gap-2 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-white text-black font-bold text-base sm:text-lg hover:scale-105 transition-transform shadow-2xl shadow-white/10 group">
            Get Started Now
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-10 sm:py-12 border-t border-white/5 bg-black/40 text-sm text-gray-500">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="font-bold text-white text-lg">Ganapathi AI</span>
            <p className="mt-1">Built with ❤️ by G R Harsha</p>
          </div>
          <div className="flex flex-wrap justify-center gap-5 sm:gap-6 items-center">
            <a href="https://www.linkedin.com/in/grharsha777/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
            <a href="https://github.com/grharsha777" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a href="mailto:grharsha777@gmail.com" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Mail className="h-4 w-4" /> Gmail
            </a>
          </div>
          <div className="text-center md:text-right">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <Navbar />
      <Hero />
      <StatsBar />
      <FeatureShowcase />
      <HowItWorks />
      <TechStack />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
