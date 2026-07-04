"use client"

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Trophy, Flame, Star, Terminal, Code2, Search, Newspaper, Brain, Globe,
    ChevronRight, Play, BarChart3, CheckCircle, Sparkles,
    GraduationCap, Rocket, FileCode, GitBranch, Cpu, Database,
    Layers, History, ArrowUpRight, Zap, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ResponsiveContainer, RadarChart, PolarGrid, 
    PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip as RechartsTooltip 
} from 'recharts';

// ═══════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════
const fetcher = (url: string) => fetch(url).then(r => r.json());

// High-quality direct background images (no API dependency)
const BG_IMAGES = [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=80&auto=format', // code on screen
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=80&auto=format', // matrix style
    'https://images.unsplash.com/photo-1550439062-609e1531270e?w=1920&q=80&auto=format', // code IDE
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1920&q=80&auto=format', // code closeup
];

function trackVisit(page: string, title: string) {
    try {
        const history = JSON.parse(localStorage.getItem('gm_visit_history') || '[]');
        const filtered = history.filter((h: any) => h.page !== page);
        filtered.unshift({ page, title, time: Date.now() });
        localStorage.setItem('gm_visit_history', JSON.stringify(filtered.slice(0, 8)));
    } catch {
        // ignore
    }
}

function getVisitHistory(): { page: string; title: string; time: number }[] {
    try { return JSON.parse(localStorage.getItem('gm_visit_history') || '[]'); } catch { return []; }
}

// ═══════════════════════════════════════
//  RANK SYSTEM
// ═══════════════════════════════════════
function getRankInfo(xp: number) {
    if (xp >= 5000) return { title: 'Grandmaster', color: 'from-yellow-400 to-amber-600', icon: '👑', level: 10, next: 999999 };
    if (xp >= 3000) return { title: 'Master', color: 'from-violet-500 to-purple-600', icon: '💎', level: 9, next: 5000 };
    if (xp >= 2000) return { title: 'Expert', color: 'from-rose-500 to-red-600', icon: '🔥', level: 8, next: 3000 };
    if (xp >= 1500) return { title: 'Architect III', color: 'from-cyan-500 to-blue-600', icon: '🏗️', level: 7, next: 2000 };
    if (xp >= 1000) return { title: 'Architect II', color: 'from-blue-500 to-indigo-600', icon: '⚡', level: 6, next: 1500 };
    if (xp >= 500) return { title: 'Architect I', color: 'from-emerald-500 to-teal-600', icon: '📐', level: 5, next: 1000 };
    if (xp >= 200) return { title: 'Senior Dev', color: 'from-green-500 to-emerald-600', icon: '💻', level: 4, next: 500 };
    if (xp >= 100) return { title: 'Developer', color: 'from-lime-500 to-green-600', icon: '🧑‍💻', level: 3, next: 200 };
    if (xp >= 50) return { title: 'Intermediate', color: 'from-amber-500 to-orange-600', icon: '📘', level: 2, next: 100 };
    return { title: 'Beginner', color: 'from-gray-400 to-gray-600', icon: '🌱', level: 1, next: 50 };
}

function NeuralBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
                    </linearGradient>
                </defs>
                <motion.path
                    d="M0,50 Q25,30 50,50 T100,50"
                    fill="none"
                    stroke="url(#neuralGrad)"
                    strokeWidth="0.1"
                    animate={{
                        d: [
                            "M0,50 Q25,30 50,50 T100,50",
                            "M0,50 Q25,70 50,50 T100,50",
                            "M0,50 Q25,30 50,50 T100,50"
                        ]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.path
                    d="M0,30 Q25,50 50,30 T100,30"
                    fill="none"
                    stroke="url(#neuralGrad)"
                    strokeWidth="0.1"
                    animate={{
                        d: [
                            "M0,30 Q25,50 50,30 T100,30",
                            "M0,30 Q25,10 50,30 T100,30",
                            "M0,30 Q25,50 50,30 T100,30"
                        ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
            </svg>
            <div className="absolute inset-0 bg-[#0a0a0a]/40" />
        </div>
    );
}

// ═══════════════════════════════════════
//  FEATURE CARDS
// ═══════════════════════════════════════
const FEATURES = [
    { title: 'Challenge Hub', desc: 'DSA, SQL, Pandas', href: '/dashboard/challenges', icon: Code2, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20' },
    { title: 'Research Engine', desc: 'AI-powered search', href: '/dashboard/research', icon: Search, gradient: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/20' },
    { title: 'AI News Hub', desc: 'Tech headlines', href: '/dashboard/news', icon: Newspaper, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20' },
    { title: 'Interview Prep', desc: 'Mock & tips', href: '/dashboard/interview', icon: Brain, gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/20' },
    { title: 'Learning Paths', desc: 'Guided courses', href: '/dashboard/learning', icon: GraduationCap, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
    { title: 'Concepts Lab', desc: 'Deep-dive topics', href: '/dashboard/concepts', icon: Layers, gradient: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-500/20' },
    { title: 'Hive Mind', desc: 'Real-time IDE', href: '/dashboard/tools/hive-mind', icon: GitBranch, gradient: 'from-yellow-500 to-amber-600', shadow: 'shadow-yellow-500/20' },
    { title: 'Terminal CLI', desc: 'Neural CLI', href: '/dashboard/tools/cli', icon: Terminal, gradient: 'from-gray-400 to-zinc-600', shadow: 'shadow-gray-500/20' },
    { title: 'Code Review', desc: 'AI analysis', href: '/dashboard/code-review', icon: FileCode, gradient: 'from-teal-500 to-cyan-600', shadow: 'shadow-teal-500/20' },
    { title: 'DevOps Studio', desc: 'Docker & K8s', href: '/dashboard/devops-studio', icon: Cpu, gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/20' },
    { title: 'GitHub Hub', desc: 'Repos & stats', href: '/dashboard/github', icon: Globe, gradient: 'from-gray-600 to-zinc-800', shadow: 'shadow-gray-600/20' },
    { title: 'Specialized', desc: 'Advanced topics', href: '/dashboard/specialized', icon: Rocket, gradient: 'from-fuchsia-500 to-pink-600', shadow: 'shadow-fuchsia-500/20' },
];

// ═══════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════
function ActivityFeed({ history }: { history: any[] }) {
    return (
        <div className="space-y-4">
            {history.length === 0 ? (
                <div className="py-10 text-center opacity-40">
                    <Activity className="h-10 w-10 mx-auto mb-3 text-gray-600" />
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">No Neural Activity Detected</p>
                </div>
            ) : (
                <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                    {history.map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-4 group pl-6 relative"
                        >
                            <div className="absolute left-[3px] top-[7px] w-2 h-2 rounded-full bg-indigo-500/40 border border-indigo-400 group-hover:scale-125 group-hover:bg-indigo-400 transition-all shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <span className="text-xs font-bold text-gray-300 group-hover:text-indigo-300 transition-colors truncate">{item.title}</span>
                                    <span className="text-[10px] text-gray-600 font-mono shrink-0">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-mono truncate">{item.page}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PersonalDashboard() {
    const { data: meRes, isLoading: meLoading } = useSWR('/api/auth/me', fetcher, { refreshInterval: 5000 });
    const { data: lbRes } = useSWR('/api/leaderboard', fetcher, { refreshInterval: 30000 });
    const { data: newsRes } = useSWR('/api/news?limit=3', fetcher, { refreshInterval: 60000 });

    // Pick a random BG image once (stable per session)
    const [bgImg] = useState(() => BG_IMAGES[Math.floor(Math.random() * BG_IMAGES.length)]);

    // User data
    const m = meRes?.user?.metrics || {};
    const xp = m.practice_points || 0;
    const streak = m.current_streak || 0;
    const firstName = meRes?.user?.full_name?.split(' ')[0] || 'Developer';
    const rank = getRankInfo(xp);
    const xpProgress = rank.next > 0 ? Math.min(100, Math.round((xp / rank.next) * 100)) : 100;

    const leaderboard = lbRes?.leaderboard || [];
    const newsArticles = newsRes?.articles?.slice(0, 4) || [];

    // Visit history
    const [visitHistory, setVisitHistory] = useState<any[]>([]);
    useEffect(() => { setVisitHistory(getVisitHistory()); }, []);

    if (meLoading) {
        return (
            <div className="space-y-6 w-full animate-pulse">
                <div className="h-[360px] rounded-3xl bg-white/[0.03]" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-2xl bg-white/[0.03]" />)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-44 rounded-2xl bg-white/[0.03]" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-700">

            {/* ═══════════════════════════════════════════
                 HERO BANNER - Full Width with Background
                 ═══════════════════════════════════════════ */}
            <section className="relative rounded-3xl overflow-hidden min-h-[380px] flex items-end">
                {/* Background Image - Always shows */}
                <div className="absolute inset-0">
                    <img
                        src={bgImg}
                        alt=""
                        className="w-full h-full object-cover opacity-40 scale-[1.02]"
                        style={{ filter: 'hue-rotate(-10deg) saturate(1.2)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-950/60 via-transparent to-indigo-950/40" />
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.3) 1px,transparent 1px)',
                        backgroundSize: '50px 50px'
                    }} />
                    {/* Floating glow orbs */}
                    <div className="absolute top-10 right-20 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-10 w-48 h-48 bg-indigo-600/20 rounded-full blur-[80px]" />
                    <div className="absolute top-20 left-1/3 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px]" />
                    
                    {/* Neural Network Animation */}
                    <NeuralBackground />
                </div>

                <div className="relative z-10 w-full p-8 md:p-12 flex flex-col lg:flex-row items-end justify-between gap-8">
                    {/* Left: User Info */}
                    <div className="space-y-5 flex-1">
                        <div className="flex items-center gap-4">
                            <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${rank.color} flex items-center justify-center shadow-2xl text-3xl border border-white/10`}>
                                {rank.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 uppercase tracking-[0.2em] font-bold">Level {rank.level}</p>
                                <p className={`text-2xl font-black bg-gradient-to-r ${rank.color} bg-clip-text text-transparent`}>{rank.title}</p>
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
                            Welcome back,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400">{firstName}</span>
                        </h1>

                        <p className="text-xl text-gray-300 flex items-center gap-3 font-medium">
                            {streak > 0 ? (
                                <>
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                                        <Flame className="h-5 w-5 text-orange-400" />
                                        <span className="text-orange-300 font-bold">{streak}-day streak</span>
                                    </span>
                                    Keep the fire burning! 🔥
                                </>
                            ) : (
                                <>Start solving to build your streak! 🚀</>
                            )}
                        </p>
                    </div>

                    {/* Right: XP Card */}
                    <div className="bg-black/50 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 text-center min-w-[220px] shadow-2xl shadow-violet-500/10">
                        <div className="relative mx-auto w-28 h-28 mb-4">
                            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#xpGrad)" strokeWidth="7" strokeLinecap="round"
                                    strokeDasharray={`${xpProgress * 2.64} 264`}
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8b5cf6"/>
                                        <stop offset="50%" stopColor="#a855f7"/>
                                        <stop offset="100%" stopColor="#6366f1"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Star className="h-6 w-6 text-violet-400 mb-1" />
                                <span className="text-xs text-gray-500">{xpProgress}%</span>
                            </div>
                        </div>
                        <p className="text-4xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{xp.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold mt-1">Total XP</p>
                        <p className="text-[10px] text-gray-600 mt-2">Next: {rank.next.toLocaleString()} XP</p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                 STATS ROW - Colorful Gradient Cards
                 ═══════════════════════════════════════════ */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                    { label: 'LEARNING STREAK', value: `${streak} Days`, icon: Flame, gradient: 'from-orange-500 via-red-500 to-pink-500', shadow: 'shadow-orange-500/30' },
                    { label: 'PROBLEMS SOLVED', value: m.completed_lessons || 0, icon: CheckCircle, gradient: 'from-emerald-400 via-green-500 to-teal-600', shadow: 'shadow-emerald-500/30' },
                    { label: 'TOTAL SESSIONS', value: m.total_sessions || 0, icon: Code2, gradient: 'from-blue-500 via-indigo-500 to-violet-600', shadow: 'shadow-blue-500/30' },
                    { label: 'XP EARNED', value: xp.toLocaleString(), icon: Star, gradient: 'from-purple-500 via-fuchsia-500 to-pink-600', shadow: 'shadow-purple-500/30' },
                ].map((stat, i) => (
                    <div key={i} className={`relative group overflow-hidden rounded-2xl p-6 min-h-[140px] flex flex-col justify-between shadow-2xl ${stat.shadow} hover:scale-[1.03] transition-all duration-300`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`} />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHg9IjAiIHk9IjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2EpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-30" />
                        <div className="relative z-10 text-white">
                            <p className="text-sm font-bold uppercase tracking-[0.15em] opacity-90">{stat.label}</p>
                            <h3 className="text-4xl md:text-5xl font-black mt-2 drop-shadow-lg">{stat.value}</h3>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/20 p-3 rounded-2xl backdrop-blur-sm z-10">
                            <stat.icon className="h-8 w-8 text-white drop-shadow" />
                        </div>
                    </div>
                ))}
            </section>

            {/* ═══════════════════════════════════════════
                 COMMAND CENTER - Feature Grid
                 ═══════════════════════════════════════════ */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/20">
                        <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Command Center</h2>
                        <p className="text-gray-500 text-sm">All your tools in one place</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {FEATURES.map((f) => {
                        const Icon = f.icon;
                        return (
                            <Link key={f.href} href={f.href} onClick={() => trackVisit(f.href, f.title)}>
                                <div className={`group h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl ${f.shadow} p-5 flex flex-col min-h-[170px]`}>
                                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-xl ${f.shadow} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-base group-hover:text-white text-gray-200 mb-1">{f.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed flex-1">{f.desc}</p>
                                    <div className="flex items-center gap-1 mt-3 text-xs text-gray-600 group-hover:text-violet-400 transition-colors">
                                        Open <ArrowUpRight className="h-3 w-3" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                 CONTINUE WHERE YOU LEFT OFF
                 ═══════════════════════════════════════════ */}
            {visitHistory.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <History className="h-5 w-5 text-white" />
                        </div>
                        Continue Where You Left Off
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
                        {visitHistory.slice(0, 6).map((v, i) => (
                            <Link key={i} href={v.page} className="shrink-0 group">
                                <div className="px-5 py-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-violet-500/30 hover:bg-white/[0.06] transition-all flex items-center gap-4 min-w-[240px] hover:-translate-y-0.5">
                                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:bg-violet-500/20 transition-colors">
                                        <Play className="h-4 w-4 text-violet-400 ml-0.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-200 group-hover:text-white truncate">{v.title}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{new Date(v.time).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══════════════════════════════════════════
                 BOTTOM GRID: Leaderboard + News + Skill Radar
                 ═══════════════════════════════════════════ */}
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Skill Radar Chart */}
                <div className="lg:col-span-1 rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                            <Activity className="h-5 w-5 text-violet-400" />
                        </div>
                        <h2 className="text-xl font-black">Proficiency</h2>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                { subject: 'DSA', value: Math.min(100, xp/20 + 20), full: 100 },
                                { subject: 'System', value: Math.min(100, xp/30 + 10), full: 100 },
                                { subject: 'Security', value: Math.min(100, xp/40 + 5), full: 100 },
                                { subject: 'Frontend', value: Math.min(100, xp/25 + 15), full: 100 },
                                { subject: 'Backend', value: Math.min(100, xp/20 + 25), full: 100 },
                                { subject: 'DevOps', value: Math.min(100, xp/50 + 5), full: 100 },
                            ]}>
                                <PolarGrid stroke="#ffffff10" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <Radar 
                                    name="Skills" 
                                    dataKey="value" 
                                    stroke="#8b5cf6" 
                                    fill="#8b5cf6" 
                                    fillOpacity={0.4} 
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="pt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Evolutionary Growth</span>
                            <span className="text-emerald-400">↑ {Math.floor(xp/100)}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${xpProgress}%` }}
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500" 
                            />
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black flex items-center gap-3">
                            <Trophy className="h-6 w-6 text-yellow-500" /> Leaderboard
                        </h2>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">This Week</span>
                    </div>
                    <div className="space-y-2">
                        {leaderboard.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                                <Trophy className="h-12 w-12 text-gray-600 mb-4" />
                                <p className="text-sm text-gray-500 font-bold">Complete challenges to rank up!</p>
                            </div>
                        ) : (
                            leaderboard.slice(0, 5).map((user: any) => (
                                <div key={user.id} className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${user.id === meRes?.user?.id ? 'bg-gradient-to-r from-violet-500/15 to-indigo-500/10 border border-violet-500/30 shadow-lg shadow-violet-500/10' : 'hover:bg-white/[0.04]'}`}>
                                    <span className="w-8 text-center font-black text-base">
                                        {user.rank === 1 ? '👑' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : <span className="text-gray-500">#{user.rank}</span>}
                                    </span>
                                    <Avatar className="h-10 w-10 border-2 border-white/10">
                                        <AvatarFallback className="text-xs bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold">{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{user.name}</p>
                                    </div>
                                    <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">{user.xp} XP</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* News Preview */}
                <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black flex items-center gap-3">
                            <Newspaper className="h-6 w-6 text-rose-400" /> Latest Headlines
                        </h2>
                        <Link href="/dashboard/news" onClick={() => trackVisit('/dashboard/news', 'AI News Hub')}>
                            <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white gap-1">More <ChevronRight className="h-3 w-3" /></Button>
                        </Link>
                    </div>
                    {newsArticles.length > 0 ? (
                        <div className="space-y-3">
                            {newsArticles.map((article: any, i: number) => (
                                <a key={i} href={article.url || article.link || '#'} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                                    {(article.image_url || article.urlToImage) ? (
                                        <img src={article.image_url || article.urlToImage} alt="" className="h-16 w-24 rounded-xl object-cover shrink-0 border border-white/10 group-hover:border-violet-500/30 transition-colors" />
                                    ) : (
                                        <div className="h-16 w-24 rounded-xl bg-gradient-to-br from-rose-950/50 to-transparent border border-white/5 flex items-center justify-center shrink-0">
                                            <Newspaper className="h-5 w-5 text-rose-600" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-gray-300 group-hover:text-white line-clamp-2 transition-colors leading-snug">{article.title}</p>
                                        <p className="text-[10px] text-gray-500 mt-1.5 font-medium">{article.source?.name || 'News'}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 opacity-40">
                            <Newspaper className="h-10 w-10 mx-auto mb-3 text-gray-600" />
                            <p className="text-sm text-gray-500">Loading headlines...</p>
                        </div>
                    )}
                </div>

                {/* Power Tools */}
                <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-4">
                    <h2 className="text-xl font-black flex items-center gap-3">
                        <Terminal className="h-6 w-6 text-orange-400" /> Power Tools
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { title: 'Hive Mind', desc: 'Real-time IDE sync', icon: GitBranch, href: '/dashboard/tools/hive-mind', color: 'amber', live: true },
                            { title: 'Neural CLI', desc: 'Terminal access', icon: Terminal, href: '/dashboard/tools/cli', color: 'gray', cmd: '$ gm mentor' },
                            { title: 'DevOps', desc: 'Docker & K8s audit', icon: Cpu, href: '/dashboard/devops-studio', color: 'cyan' },
                            { title: 'Code Review', desc: 'AI-powered', icon: FileCode, href: '/dashboard/code-review', color: 'teal' },
                        ].map((tool) => (
                            <Link key={tool.href} href={tool.href} onClick={() => trackVisit(tool.href, tool.title)}>
                                <div className={`group p-4 rounded-xl bg-gradient-to-br from-${tool.color}-950/40 to-transparent border border-${tool.color}-500/10 hover:border-${tool.color}-500/40 transition-all hover:-translate-y-0.5 h-full`}>
                                    <tool.icon className={`h-7 w-7 text-${tool.color}-400 mb-3`} />
                                    <h3 className="font-bold text-sm mb-1">{tool.title}</h3>
                                    <p className="text-[10px] text-gray-500">{tool.desc}</p>
                                    {tool.live && (
                                        <div className="flex items-center gap-1.5 mt-3">
                                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[10px] text-emerald-400 font-bold">Live</span>
                                        </div>
                                    )}
                                    {tool.cmd && (
                                        <code className="text-[9px] text-green-400 font-mono mt-3 block bg-black/60 px-2 py-1 rounded">{tool.cmd}</code>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                 NEURAL ACTIVITY FEED & MENTOR TIP
                 ═══════════════════════════════════════════ */}
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 h-full">
                    <div className="h-full relative rounded-3xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-violet-950/40 via-indigo-950/30 to-black p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 shrink-0">
                            <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-black text-xl mb-2">🧠 Ganapathi AI Mentor Tip</h3>
                            <p className="text-base text-gray-300 leading-relaxed">Consistency beats intensity. Solve 2–3 problems daily across different categories. Build pattern recognition by practicing Easy problems first, then apply those patterns to Medium and Hard challenges.</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 shrink-0 bg-white/5 px-3 py-2 rounded-full border border-white/10">
                            <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                            AI-generated daily
                        </div>
                    </div>
                </div>

                {/* Neural Activity Logs */}
                <div className="lg:col-span-1 rounded-3xl border border-white/[0.06] bg-black/40 backdrop-blur-3xl p-6 space-y-5 shadow-2xl min-h-[220px]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-400" />
                            Neural Logs
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                    <ActivityFeed history={visitHistory} />
                </div>
            </section>
        </div>
    );
}
