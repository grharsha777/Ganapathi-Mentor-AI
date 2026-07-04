"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search, ArrowRight, Loader2, Sparkles, Code2, GraduationCap, Database,
    Flame, Zap, Trophy, ExternalLink, Rocket, BookOpen, Timer, Star,
    ChevronRight, Play, TrendingUp, Brain, BarChart3, Globe
} from 'lucide-react';

// ═══════════════════════════════════════
//  External Online Resources
// ═══════════════════════════════════════
const EXTERNAL_SOURCES = [
    { name: 'LeetCode', url: 'https://leetcode.com/problemset/', icon: '⚡', color: 'from-amber-500 to-orange-600', desc: 'Top interview problems', tag: '3000+ problems' },
    { name: 'Codeforces', url: 'https://codeforces.com/problemset', icon: '🏆', color: 'from-blue-500 to-cyan-600', desc: 'Competitive programming', tag: 'Live contests' },
    { name: 'HackerRank', url: 'https://www.hackerrank.com/domains', icon: '💚', color: 'from-emerald-500 to-green-600', desc: 'Skill certifications', tag: 'Certificates' },
    { name: 'CodeChef', url: 'https://www.codechef.com/practice', icon: '🍳', color: 'from-violet-500 to-purple-600', desc: 'Monthly challenges', tag: 'Rating system' },
    { name: 'AtCoder', url: 'https://atcoder.jp/contests/', icon: '🎌', color: 'from-rose-500 to-pink-600', desc: 'Japanese CP platform', tag: 'High quality' },
    { name: 'Project Euler', url: 'https://projecteuler.net/archives', icon: '🧮', color: 'from-indigo-500 to-blue-600', desc: 'Math + CS puzzles', tag: '900+ problems' },
];

const TRACK_META: Record<string, { icon: any; gradient: string; glow: string; label: string; bg: string }> = {
    Beginner: { icon: GraduationCap, gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20', label: 'Foundation', bg: 'bg-emerald-500/10' },
    Intermediate: { icon: Code2, gradient: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20', label: 'Patterns', bg: 'bg-amber-500/10' },
    Advanced: { icon: Zap, gradient: 'from-rose-500 to-violet-600', glow: 'shadow-rose-500/20', label: 'Expert', bg: 'bg-rose-500/10' },
};

const DIFF_DOT: Record<string, string> = { Easy: 'bg-emerald-400', Medium: 'bg-amber-400', Hard: 'bg-rose-400' };

// Daily challenge picks one based on date
function getDailyIndex(total: number) {
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    return seed % total;
}

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTrack, setActiveTrack] = useState('all');
    const [seeding, setSeeding] = useState(false);
    const [bgUrl, setBgUrl] = useState('');

    // Fetch Pexels background
    useEffect(() => {
        fetch('/api/assets/pexels?query=dark+code+programming&per_page=3&orientation=landscape')
            .then(r => r.json())
            .then(data => {
                if (data.photos && data.photos.length > 0) {
                    const randomPhoto = data.photos[Math.floor(Math.random() * data.photos.length)];
                    setBgUrl(randomPhoto.src?.large2x || randomPhoto.src?.landscape || '');
                }
            })
            .catch(() => {});
    }, []);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            const res = await fetch(`/api/challenges?${params.toString()}`);
            const data = await res.json();
            setChallenges(data.challenges || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchChallenges(); }, []);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            await fetch('/api/challenges/seed', { method: 'POST' });
            await fetchChallenges();
        } catch (e) {
            console.error(e);
        } finally {
            setSeeding(false);
        }
    };

    const filtered = useMemo(() => {
        let list = challenges;
        if (activeTrack !== 'all') list = list.filter(c => c.track === activeTrack);
        return list;
    }, [challenges, activeTrack]);

    const trackCounts = useMemo(() => ({
        Beginner: challenges.filter(c => c.track === 'Beginner').length,
        Intermediate: challenges.filter(c => c.track === 'Intermediate').length,
        Advanced: challenges.filter(c => c.track === 'Advanced').length,
    }), [challenges]);

    const dailyChallenge = useMemo(() => {
        if (challenges.length === 0) return null;
        return challenges[getDailyIndex(challenges.length)];
    }, [challenges]);

    const isEmpty = !loading && challenges.length === 0;

    return (
        <div className="flex-1 w-full min-h-screen bg-black text-white overflow-y-auto">
            {/* ═══════════ HERO SECTION ═══════════ */}
            <section className="relative w-full min-h-[420px] flex items-end overflow-hidden">
                {/* Background Image from Pexels */}
                <div className="absolute inset-0">
                    {bgUrl ? (
                        <img src={bgUrl} alt="" className="w-full h-full object-cover opacity-40 scale-105 hover:scale-100 transition-transform duration-3000" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-950 via-black to-indigo-950" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    {/* Animated grid lines */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>

                <div className="relative z-10 w-full mx-auto px-6 md:px-10 pb-10 pt-20">
                    <div className="flex flex-col lg:flex-row items-end justify-between gap-8">
                        <div className="space-y-5 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                    <Brain className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Ganapathi AI Mentor</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50">
                                Code.<br/>Compete.<br/>Conquer.
                            </h1>
                            <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                                25+ curated challenges across DSA, SQL, and Pandas. Guided tracks with AI mentor insights, recruiter notes, and community discussions.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                                    <span className="text-gray-300">{challenges.length} Problems</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                                    <Globe className="h-4 w-4 text-blue-400" />
                                    <span className="text-gray-300">6 External Sources</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                                    <Timer className="h-4 w-4 text-amber-400" />
                                    <span className="text-gray-300">Daily Challenge</span>
                                </div>
                            </div>
                        </div>

                        {/* Daily Challenge Card */}
                        {dailyChallenge && (
                            <Link href={`/dashboard/challenges/${dailyChallenge.slug}`} className="group w-full lg:w-[400px] shrink-0">
                                <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-black/60 backdrop-blur-xl p-6 hover:border-violet-400/50 transition-all duration-500 hover:shadow-[0_0_60px_rgba(139,92,246,0.15)]">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 blur-[80px] rounded-full" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full" />
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                                                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Daily Challenge</span>
                                            </div>
                                            <div className={`h-2 w-2 rounded-full ${DIFF_DOT[dailyChallenge.difficulty]}`} />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-violet-300 transition-colors">{dailyChallenge.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                            <span>{dailyChallenge.category}</span>
                                            <span>•</span>
                                            <span>{dailyChallenge.difficulty}</span>
                                            <span>•</span>
                                            <span>{dailyChallenge.source}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1.5">
                                                {(dailyChallenge.tags || []).slice(0, 3).map((t: string) => (
                                                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">#{t}</span>
                                                ))}
                                            </div>
                                            <div className="h-9 w-9 rounded-full bg-violet-600 flex items-center justify-center group-hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/30">
                                                <Play className="h-4 w-4 text-white ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════ TRACK NAVIGATION ═══════════ */}
            <section className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
                <div className="w-full mx-auto px-6 md:px-10 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        <button
                            onClick={() => setActiveTrack('all')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeTrack === 'all' ? 'bg-white text-black shadow-xl shadow-white/10' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'}`}
                        >
                            <Rocket className="h-4 w-4" /> All ({challenges.length})
                        </button>
                        {Object.entries(TRACK_META).map(([track, meta]) => {
                            const Icon = meta.icon;
                            const count = trackCounts[track as keyof typeof trackCounts] || 0;
                            return (
                                <button
                                    key={track}
                                    onClick={() => setActiveTrack(track)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeTrack === track ? `bg-gradient-to-r ${meta.gradient} text-white shadow-xl ${meta.glow}` : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'}`}
                                >
                                    <Icon className="h-4 w-4" /> {track} ({count})
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search problems..."
                                className="bg-white/5 border-white/10 pl-10 h-10 rounded-xl text-sm focus-visible:ring-violet-500 placeholder:text-gray-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchChallenges()}
                            />
                        </div>
                        <Button
                            onClick={handleSeed}
                            disabled={seeding}
                            size="sm"
                            className="h-10 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/20 shrink-0"
                        >
                            {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                            {isEmpty ? 'Deploy' : 'Sync'}
                        </Button>
                    </div>
                </div>
            </section>

            {/* ═══════════ MAIN CONTENT ═══════════ */}
            <div className="w-full mx-auto px-6 md:px-10 py-8 space-y-10">

                {/* Loading Skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="h-48 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {isEmpty && (
                    <div className="flex flex-col items-center justify-center py-28 text-center relative">
                        <div className="absolute w-96 h-96 bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
                        <div className="relative space-y-6">
                            <div className="h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-600/30">
                                <Sparkles className="h-12 w-12 text-white" />
                            </div>
                            <h2 className="text-4xl font-black">Initialize Your Arena</h2>
                            <p className="text-gray-400 max-w-md mx-auto text-lg">Deploy 25+ curated problems across Beginner, Intermediate, and Advanced tracks to begin your journey.</p>
                            <Button onClick={handleSeed} disabled={seeding} size="lg" className="h-14 px-10 text-lg font-bold bg-white text-black hover:bg-gray-100 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                                {seeding ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Rocket className="h-6 w-6 mr-3" />}
                                Deploy Knowledge Base
                            </Button>
                        </div>
                    </div>
                )}

                {/* ═══════════ TRACK SECTIONS ═══════════ */}
                {!loading && filtered.length > 0 && (
                    <div className="space-y-12">
                        {(activeTrack === 'all' ? ['Beginner', 'Intermediate', 'Advanced'] : [activeTrack]).map(track => {
                            const items = filtered.filter(c => c.track === track);
                            if (items.length === 0) return null;
                            const meta = TRACK_META[track] || TRACK_META['Beginner'];
                            const TrackIcon = meta.icon;

                            return (
                                <div key={track}>
                                    {/* Track Header */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-xl ${meta.glow}`}>
                                            <TrackIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight">{track} Track</h2>
                                            <p className="text-sm text-gray-500">{meta.label} • {items.length} challenges</p>
                                        </div>
                                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4" />
                                    </div>

                                    {/* Challenge Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {items.map((c: any) => (
                                            <Link key={c.slug} href={`/dashboard/challenges/${c.slug}`} className="group block">
                                                <div className="relative h-full min-h-[200px] rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 overflow-hidden hover:-translate-y-1 hover:shadow-2xl">
                                                    {/* Top glow */}
                                                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                                    {/* Background icon */}
                                                    <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                                        <TrackIcon className="h-32 w-32" />
                                                    </div>

                                                    <div className="relative p-6 h-full flex flex-col">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`h-2.5 w-2.5 rounded-full ${DIFF_DOT[c.difficulty]} shadow-sm`} />
                                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{c.difficulty}</span>
                                                            </div>
                                                            <span className="text-[10px] text-gray-600 font-mono bg-white/5 px-2 py-0.5 rounded">{c.category}</span>
                                                        </div>

                                                        <h3 className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors mb-3 leading-snug line-clamp-2 pr-4">
                                                            {c.title}
                                                        </h3>

                                                        <div className="flex-1" />

                                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                            <div className="flex gap-1.5">
                                                                {(c.tags || []).slice(0, 2).map((tag: string) => (
                                                                    <span key={tag} className="text-[10px] text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded-sm">#{tag}</span>
                                                                ))}
                                                            </div>
                                                            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                                                                <ArrowRight className="h-3.5 w-3.5" />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-gray-600">
                                                            <ExternalLink className="h-3 w-3" /> {c.source}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ═══════════ ONLINE SOURCES ═══════════ */}
                <section className="pt-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
                            <Globe className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Online Resources</h2>
                            <p className="text-sm text-gray-500">Practice on world-class competitive programming platforms</p>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {EXTERNAL_SOURCES.map((src) => (
                            <a
                                key={src.name}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden hover:-translate-y-1"
                            >
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${src.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                <div className="p-5 text-center space-y-3">
                                    <span className="text-3xl">{src.icon}</span>
                                    <h3 className="font-bold text-sm group-hover:text-white text-gray-300">{src.name}</h3>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">{src.desc}</p>
                                    <Badge variant="outline" className="text-[9px] border-white/10 bg-white/5 font-semibold">{src.tag}</Badge>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* ═══════════ DAILY TIP FOOTER ═══════════ */}
                <section className="pb-8">
                    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-r from-violet-950/30 to-indigo-950/30 p-8 flex flex-col md:flex-row items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/20 shrink-0">
                            <BookOpen className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-bold mb-1">New challenges added daily</h3>
                            <p className="text-sm text-gray-400">Our AI mentor curates a new daily challenge every 24 hours. Combined with 6 external platforms, you&apos;ll never run out of problems to solve.</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Updated today
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
