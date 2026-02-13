"use client";

import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ArrowRight, Code, Zap, Globe, Sparkles, MessageSquare,
  BarChart2, Users, Play, Star, CheckCircle2,
  Linkedin, Github, Mail
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// --- Components ---

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }} />
            <Sparkles className="h-6 w-6 text-white hidden" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Ganapathi AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/auth/sign-up" className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-white text-black hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl shadow-white/10">
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Aurora Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse delay-2000" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-300">v2.0 Neural Update Live</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
            Master Coding with
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
            AI Mentorship
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Your intelligent companion for learning code, debugging complex issues,
          and building software faster. Powered by advanced neural networks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/auth/sign-up" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-105 flex items-center gap-2 group">
            Start Learning Free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm">
            <Play className="h-5 w-5 fill-current" />
            Watch Demo
          </button>
        </motion.div>

        {/* Floating UI Elements Parallax */}
        <div className="absolute top-1/2 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          {/* Add subtle floating elements if needed, but keeping it clean for performance */}
        </div>
      </div>
    </section>
  );
}

function BentoGrid() {
  const features = [
    {
      title: "AI Chat Assistant",
      desc: "Instant answers, code generation, and debugging help.",
      icon: MessageSquare,
      col: "md:col-span-2",
      bg: "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20"
    },
    {
      title: "Learning Paths",
      desc: "Personalized roadmaps to master any tech stack.",
      icon: Globe,
      col: "md:col-span-1",
      bg: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20"
    },
    {
      title: "Code Review",
      desc: "Get expert-level code reviews instantly.",
      icon: Code,
      col: "md:col-span-1",
      bg: "bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20"
    },
    {
      title: "Performance Analytics",
      desc: "Track your progress with detailed metrics.",
      icon: BarChart2,
      col: "md:col-span-2",
      bg: "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20"
    },
  ];

  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to ship faster</h2>
          <p className="text-gray-400 text-lg">Powerful tools integrated into one seamless platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className={`p-8 rounded-3xl border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group ${f.col} ${f.bg}`}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const companies = ["Google", "Microsoft", "Netflix", "Amazon", "Meta", "Uber"];

  return (
    <div className="py-12 border-y border-white/5 bg-black/20">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">Trusted by developers from</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Mock Logos - Text for now as specified "rich text" */}
          {companies.map((c, i) => (
            <span key={i} className="text-xl font-bold text-white/40 hover:text-white/80 transition-colors cursor-default">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  const reviews = [
    { name: "Sarah Chen", role: "Frontend Dev", text: "Ganapathi AI helped me understand React hooks in minutes. Usually takes me hours of reading docs!" },
    { name: "Mike Ross", role: "Full Stack", text: "The code review feature is insane. It caught a memory leak I missed completely." },
    { name: "Alex V.", role: "Student", text: "Best learning companion ever. It's like having a senior dev sitting next to you 24/7." },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-transparent to-indigo-950/20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Loved by Developers</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 relative"
            >
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center font-bold text-sm">
                  {r.name[0]}
                </div>
                <div>
                  <div className="font-bold">{r.name}</div>
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

function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-600/10 blur-[100px]" />
      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to level up?</h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Join thousands of developers building the future with Ganapathi Mentor AI.</p>
        <Link href="/auth/sign-up" className="px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-2xl inline-flex items-center gap-2">
          Get Started Now <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-black/40 text-sm text-gray-500">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="font-bold text-white text-lg">Ganapathi AI</span>
          <p className="mt-2">Built with ❤️ by G R Harsha</p>
        </div>
        <div className="flex gap-6 items-center">
          <a href="https://www.linkedin.com/in/grharsha777/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
          <a href="https://github.com/grharsha777" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
            <Github className="h-4 w-4" /> GitHub
          </a>
          <a href="mailto:grharsha777@gmail.com" className="hover:text-white transition-colors flex items-center gap-2">
            <Mail className="h-4 w-4" /> Gmail
          </a>
        </div>
        <div>
          © {new Date().getFullYear()} All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-indigo-500/30">
      <Navbar />
      <Hero />
      <SocialProof />
      <BentoGrid />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
