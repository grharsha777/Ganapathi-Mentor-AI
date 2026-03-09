"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    Github, Star, GitFork, Clock, Code2, AlertCircle, ExternalLink,
    RefreshCw, Trophy, Zap, Flame, Shield, Search,
    Users, MapPin, Building2, Globe, BookOpen, Swords, Sparkles,
    TrendingUp, GitPullRequest, Bug, Award, ChevronRight, Heart,
    Brain, Target, Loader2, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ===== Types =====
interface Repository {
    name: string; full_name: string; description: string | null; language: string | null;
    stars: number; forks: number; open_issues: number; size: number;
    updated_at: string; created_at: string; html_url: string; default_branch: string;
    is_fork: boolean; has_wiki: boolean; license: string | null; topics: string[];
}
interface StarredRepo {
    name: string; full_name: string; description: string | null; language: string | null;
    stars: number; forks: number; html_url: string;
    owner: { login: string; avatar_url: string };
}
interface GitHubUser { login: string; avatar_url: string; html_url: string; }
interface GitHubProfile {
    login: string; avatar_url: string; name: string | null; bio: string | null;
    company: string | null; location: string | null; blog: string | null;
    twitter_username: string | null; public_repos: number; public_gists: number;
    followers: number; following: number; created_at: string; html_url: string;
}
interface AIAnalysis {
    overallGrade: string; title: string;
    strengths: string[]; improvements: string[]; weeklyGoals: string[];
    mentorMessage: string; techStack: string; riskAreas: string[];
    skillRadar: { coding: number; collaboration: number; documentation: number; consistency: number; diversity: number };
}

type TabType = 'overview' | 'repositories' | 'stars' | 'followers' | 'following';

// ===== Gamification =====
function computeGravity(repos: Repository[], profile: GitHubProfile | null, starredCount: number) {
    const xp = repos.length * 50 + repos.reduce((s, r) => s + r.stars, 0) * 200 + repos.reduce((s, r) => s + r.forks, 0) * 150 +
        new Set(repos.map(r => r.language).filter(Boolean)).size * 100 + (profile?.followers || 0) * 25 + starredCount * 30;
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const pct = Math.min(100, ((xp - Math.pow(level - 1, 2) * 100) / (Math.pow(level, 2) * 100 - Math.pow(level - 1, 2) * 100)) * 100);
    const titles = [{ min: 1, t: 'Code Apprentice', i: '🌱' }, { min: 5, t: 'Bug Slayer', i: '🗡️' }, { min: 10, t: 'Code Warrior', i: '⚔️' },
    { min: 15, t: 'Architect', i: '🏛️' }, { min: 20, t: 'Open Source Knight', i: '🛡️' }, { min: 30, t: 'Gravity Master', i: '🌌' }, { min: 50, t: 'Legendary Dev', i: '👑' }];
    const ct = titles.filter(t => level >= t.min).pop() || titles[0];
    return { xp, level, pct, title: ct.t, icon: ct.i };
}

function generateQuests(repos: Repository[]) {
    const q = [];
    const noDesc = repos.filter(r => !r.description).length;
    const noLic = repos.filter(r => !r.license).length;
    const stale = repos.filter(r => (Date.now() - new Date(r.updated_at).getTime()) > 30 * 86400000).length;
    if (noDesc > 0) q.push({ t: 'Add Descriptions', d: `${noDesc} repos need descriptions`, xp: noDesc * 20, icon: BookOpen, c: 'text-blue-400' });
    if (noLic > 0) q.push({ t: 'License Your Code', d: `${noLic} repos unprotected`, xp: noLic * 30, icon: Shield, c: 'text-green-400' });
    if (stale > 0) q.push({ t: 'Revive Stale Repos', d: `${stale} repos idle 30+ days`, xp: stale * 15, icon: Flame, c: 'text-orange-400' });
    q.push({ t: 'Review a PR', d: 'Help a teammate by reviewing code', xp: 75, icon: GitPullRequest, c: 'text-cyan-400' });
    return q.slice(0, 4);
}

const LC: Record<string, string> = {
    TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', Java: '#b07219',
    Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95',
    'C++': '#f34b7d', C: '#555', CSS: '#563d7c', HTML: '#e34c26',
    Shell: '#89e051', Kotlin: '#A97BFF', Swift: '#F05138', Dart: '#00B4AB',
    'Jupyter Notebook': '#DA5B0B', Vue: '#41b883', Svelte: '#ff3e00',
};

// ===== Skill Radar SVG =====
function SkillRadar({ data }: { data: AIAnalysis['skillRadar'] }) {
    const skills = [
        { key: 'coding', label: 'Coding' },
        { key: 'collaboration', label: 'Collab' },
        { key: 'documentation', label: 'Docs' },
        { key: 'consistency', label: 'Consistency' },
        { key: 'diversity', label: 'Diversity' },
    ];
    const cx = 100, cy = 100, r = 70;
    const angleStep = (2 * Math.PI) / skills.length;

    const getPoint = (index: number, value: number) => {
        const angle = angleStep * index - Math.PI / 2;
        const dist = (value / 100) * r;
        return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1];
    const points = skills.map((s, i) => getPoint(i, (data as any)[s.key] || 0));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
        <svg viewBox="0 0 200 200" className="w-full max-w-[220px] mx-auto">
            {/* Grid */}
            {gridLevels.map((gl, gi) => (
                <polygon key={gi} points={skills.map((_, i) => { const p = getPoint(i, gl * 100); return `${p.x},${p.y}`; }).join(' ')}
                    fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            ))}
            {/* Axis lines */}
            {skills.map((_, i) => { const p = getPoint(i, 100); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />; })}
            {/* Data polygon */}
            <motion.path d={pathD} fill="rgba(168, 85, 247, 0.2)" stroke="rgba(168, 85, 247, 0.8)" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
            {/* Data points */}
            {points.map((p, i) => <motion.circle key={i} cx={p.x} cy={p.y} r="3" fill="#a855f7" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} />)}
            {/* Labels */}
            {skills.map((s, i) => {
                const p = getPoint(i, 120);
                return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontWeight="500">{s.label}</text>;
            })}
        </svg>
    );
}

// ===== Main Component =====
export default function GitHubDashboard() {
    const [repos, setRepos] = useState<Repository[]>([]);
    const [starred, setStarred] = useState<StarredRepo[]>([]);
    const [followersList, setFollowersList] = useState<GitHubUser[]>([]);
    const [followingList, setFollowingList] = useState<GitHubUser[]>([]);
    const [profile, setProfile] = useState<GitHubProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasToken, setHasToken] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLang, setFilterLang] = useState<string | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const fetchGitHubData = async () => {
        setLoading(true); setError(null);
        try {
            const r1 = await fetch('/api/session/github');
            const d1 = await r1.json();
            if (!d1.hasToken) { setHasToken(false); setLoading(false); return; }
            setHasToken(true);
            const r2 = await fetch('/api/session/github/repos');
            if (!r2.ok) throw new Error('Failed to fetch repos');
            const d2 = await r2.json();
            setRepos(d2.repos || []);
            setProfile(d2.profile || null);
            setStarred(d2.starred || []);
            setFollowersList(d2.followers || []);
            setFollowingList(d2.following || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load GitHub data');
        } finally { setLoading(false); }
    };

    const fetchAIAnalysis = useCallback(async () => {
        if (!profile || repos.length === 0 || aiLoading) return;
        setAiLoading(true);
        try {
            const res = await fetch('/api/session/github/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, repos: repos.slice(0, 15), starred })
            });
            if (res.ok) {
                const data = await res.json();
                setAiAnalysis(data);
            }
        } catch (e) {
            console.error('AI analysis failed:', e);
        } finally { setAiLoading(false); }
    }, [profile, repos, starred, aiLoading]);

    useEffect(() => { fetchGitHubData(); }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (profile && repos.length > 0 && !aiAnalysis && !aiLoading) fetchAIAnalysis(); }, [profile, repos]);

    const grav = useMemo(() => computeGravity(repos, profile, starred.length), [repos, profile, starred]);
    const quests = useMemo(() => generateQuests(repos), [repos]);
    const totalStars = repos.reduce((s, r) => s + r.stars, 0);
    const totalForks = repos.reduce((s, r) => s + r.forks, 0);
    const langStats = useMemo(() => {
        const m: Record<string, number> = {};
        repos.forEach(r => { if (r.language) m[r.language] = (m[r.language] || 0) + 1; });
        return Object.entries(m).map(([n, c]) => ({ n, c })).sort((a, b) => b.c - a.c);
    }, [repos]);
    const filteredRepos = useMemo(() => {
        let res = repos;
        if (searchQuery) res = res.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase()));
        if (filterLang) res = res.filter(r => r.language === filterLang);
        return res;
    }, [repos, searchQuery, filterLang]);

    // ===== Render States =====
    if (loading) return (
        <div className="space-y-6 animate-pulse">
            <div className="h-12 bg-white/5 rounded-xl w-96" />
            <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                <div className="space-y-4"><Skeleton className="h-64 w-64 rounded-full mx-auto" /><Skeleton className="h-20 rounded-xl" /></div>
                <div className="space-y-4"><div className="grid grid-cols-4 gap-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div><Skeleton className="h-80 rounded-xl" /></div>
            </div>
        </div>
    );

    if (!hasToken) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md w-full border-purple-500/20 bg-gradient-to-br from-gray-900 to-purple-950/30 backdrop-blur-xl">
                <CardContent className="py-12 text-center space-y-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                        className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 rotate-12">
                        <Github className="h-10 w-10 text-white -rotate-12" />
                    </motion.div>
                    <div><h3 className="font-bold text-2xl text-white">Connect GitHub</h3><p className="text-gray-400 mt-2 text-sm">Unlock your gamified developer journey</p></div>
                    <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/20 w-full">
                        <a href="/dashboard/settings">Connect Now <ArrowUpRight className="ml-2 h-4 w-4" /></a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    if (error) return (
        <Card className="border-red-500/20 bg-red-950/10"><CardContent className="py-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" /><h3 className="font-semibold">Failed to Load</h3><p className="text-sm text-gray-400">{error}</p>
            <Button onClick={fetchGitHubData} variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button>
        </CardContent></Card>
    );

    const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : null;
    const tabs: { id: TabType; label: string; count?: number; icon: any }[] = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'repositories', label: 'Repositories', count: repos.length, icon: Github },
        { id: 'stars', label: 'Stars', count: starred.length, icon: Star },
        { id: 'followers', label: 'Followers', count: followersList.length, icon: Users },
        { id: 'following', label: 'Following', count: followingList.length, icon: Heart },
    ];

    // ===== Repo Card =====
    const RepoCard = ({ repo, delay = 0, full = false }: { repo: Repository; delay?: number; full?: boolean }) => (
        <motion.a href={repo.html_url} target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            className="block group">
            <div className={`p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-500/20 transition-all duration-300 h-full`}>
                <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[15px] text-purple-400 group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-gray-500 flex-shrink-0" />{repo.name}
                    </p>
                    {repo.language && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                            <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: LC[repo.language] || '#666' }} />{repo.language}
                        </span>
                    )}
                </div>
                {repo.description && <p className={`text-[13px] text-gray-500 mt-1.5 leading-relaxed ${full ? '' : 'line-clamp-2'}`}>{repo.description}</p>}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
                    {repo.stars > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{repo.stars}</span>}
                    {repo.forks > 0 && <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{repo.forks}</span>}
                    {repo.open_issues > 0 && <span className="flex items-center gap-1"><Bug className="h-3 w-3 text-orange-400" />{repo.open_issues}</span>}
                    <span className="ml-auto flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
                {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {repo.topics.slice(0, full ? 6 : 3).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/15">{t}</span>)}
                    </div>
                )}
            </div>
        </motion.a>
    );

    return (
        <div className="animate-in fade-in duration-500">
            {/* Tab Nav */}
            <div className="border-b border-white/[0.06] mb-8 sticky top-0 bg-background/80 backdrop-blur-xl z-10 -mx-2 px-2">
                <div className="flex gap-0.5 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap relative
                                ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {tab.count !== undefined && <span className={`text-[11px] px-1.5 py-0.5 rounded-full ml-0.5 ${activeTab === tab.id ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-gray-500'}`}>{tab.count}</span>}
                            {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />}
                        </button>
                    ))}
                    <div className="ml-auto flex items-center"><Button variant="ghost" size="sm" onClick={fetchGitHubData} className="text-gray-500 hover:text-white"><RefreshCw className="h-4 w-4" /></Button></div>
                </div>
            </div>

            {/* Layout */}
            <div className="grid lg:grid-cols-[260px_1fr] gap-10">
                {/* Sidebar */}
                <aside className="hidden lg:block space-y-5">
                    <div className="relative group w-fit mx-auto">
                        <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                        <img src={profile?.avatar_url || ''} alt="" className="relative h-56 w-56 rounded-full border-[3px] border-gray-800 object-cover" />
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
                            className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-orange-500/30">
                            Lv.{grav.level}
                        </motion.div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{profile?.name || profile?.login}</h2>
                        <p className="text-gray-500">{profile?.login}</p>
                    </div>
                    {profile?.bio && <p className="text-sm text-gray-400 leading-relaxed">{profile.bio}</p>}
                    <div className="flex flex-wrap gap-1.5">
                        <Badge className="bg-gradient-to-r from-yellow-500/15 to-orange-500/15 text-yellow-400 border-yellow-500/20 text-xs">{grav.icon} {grav.title}</Badge>
                        <Badge variant="outline" className="text-purple-300 border-purple-500/20 text-xs"><Trophy className="h-3 w-3 mr-1" />{grav.xp.toLocaleString()} XP</Badge>
                    </div>
                    {/* XP Progress */}
                    <div className="space-y-1"><div className="flex justify-between text-[10px] text-gray-600"><span>Lv.{grav.level}</span><span>Lv.{grav.level + 1}</span></div>
                        <div className="h-1.5 bg-gray-800/80 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${grav.pct}%` }} transition={{ duration: 1.5 }} /></div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-500">
                        {profile?.company && <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />{profile.company}</div>}
                        {profile?.location && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{profile.location}</div>}
                        {profile?.blog && <a href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-purple-400 transition-colors"><Globe className="h-3.5 w-3.5" /><span className="truncate">{profile.blog}</span></a>}
                        {memberSince && <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" />Joined {memberSince}</div>}
                    </div>
                    <div className="flex gap-3 text-sm">
                        <button onClick={() => setActiveTab('followers')} className="hover:text-purple-400 transition-colors"><span className="text-white font-semibold">{profile?.followers || 0}</span> <span className="text-gray-500">followers</span></button>
                        <span className="text-gray-800">·</span>
                        <button onClick={() => setActiveTab('following')} className="hover:text-purple-400 transition-colors"><span className="text-white font-semibold">{profile?.following || 0}</span> <span className="text-gray-500">following</span></button>
                    </div>
                    <a href={profile?.html_url} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="w-full border-white/[0.06] text-gray-400 hover:text-white hover:border-purple-500/20"><Github className="h-3.5 w-3.5 mr-2" />View on GitHub</Button></a>
                </aside>

                {/* Mobile Profile */}
                <div className="lg:hidden mb-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <div className="relative">
                            <img src={profile?.avatar_url || ''} alt="" className="h-14 w-14 rounded-full border-2 border-gray-800" />
                            <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">Lv.{grav.level}</div>
                        </div>
                        <div className="flex-1 min-w-0"><h2 className="font-bold text-white truncate">{profile?.name || profile?.login}</h2><p className="text-xs text-gray-500">@{profile?.login}</p>
                            <div className="flex gap-2 mt-1 text-xs"><span><b className="text-white">{profile?.followers}</b> <span className="text-gray-500">followers</span></span><span><b className="text-white">{profile?.following}</b> <span className="text-gray-500">following</span></span></div>
                        </div>
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px]">{grav.icon} {grav.title}</Badge>
                    </div>
                </div>

                {/* Main Content */}
                <main className="min-w-0">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                {/* Stats */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    {[
                                        { l: 'Repositories', v: repos.length, icon: Github, g: 'from-gray-800/60 to-gray-900/60', ic: 'text-white' },
                                        { l: 'Stars Given', v: starred.length, icon: Star, g: 'from-yellow-900/30 to-orange-900/30', ic: 'text-yellow-400' },
                                        { l: 'Stars Earned', v: totalStars, icon: Award, g: 'from-pink-900/30 to-rose-900/30', ic: 'text-pink-400' },
                                        { l: 'Forks', v: totalForks, icon: GitFork, g: 'from-cyan-900/30 to-blue-900/30', ic: 'text-cyan-400' },
                                    ].map((s, i) => (
                                        <motion.div key={s.l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                                            <div className={`p-4 rounded-xl bg-gradient-to-br ${s.g} border border-white/[0.04]`}>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">{s.l}</p>
                                                <div className="flex items-center justify-between mt-1"><h3 className="text-2xl font-black text-white">{s.v}</h3><s.icon className={`h-6 w-6 ${s.ic} opacity-50`} /></div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Ganapathi AI Analysis Panel */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                    <div className="rounded-xl border border-purple-500/15 bg-gradient-to-br from-purple-950/20 via-gray-900/50 to-indigo-950/20 overflow-hidden">
                                        <div className="p-5 border-b border-white/[0.04] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg"><Brain className="h-5 w-5 text-white" /></div>
                                                <div><h3 className="font-bold text-white text-base">Ganapathi Mentor AI Analysis</h3><p className="text-[11px] text-gray-500">Personalized developer insights & coaching</p></div>
                                            </div>
                                            {aiAnalysis && <Badge className="bg-gradient-to-r from-green-500/15 to-emerald-500/15 text-green-400 border-green-500/20 text-lg font-bold px-3">{aiAnalysis.overallGrade}</Badge>}
                                            {aiLoading && <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />}
                                        </div>

                                        {aiLoading && !aiAnalysis && (
                                            <div className="p-8 text-center"><Loader2 className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Ganapathi is analyzing your profile...</p></div>
                                        )}

                                        {aiAnalysis && (
                                            <div className="p-5 space-y-5">
                                                {/* Mentor Message */}
                                                <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/5 to-pink-500/5 border border-orange-500/10">
                                                    <p className="text-sm text-gray-300 leading-relaxed italic">&quot;{aiAnalysis.mentorMessage}&quot;</p>
                                                    <p className="text-xs text-orange-400 mt-2 font-medium">— Ganapathi Mentor AI</p>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-5">
                                                    {/* Skill Radar */}
                                                    <div><p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Skill Radar</p><SkillRadar data={aiAnalysis.skillRadar} /></div>

                                                    {/* Strengths & Improvements */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wider text-green-400 font-semibold mb-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" />Strengths</p>
                                                            <div className="space-y-1.5">{aiAnalysis.strengths.map((s, i) => <div key={i} className="flex items-start gap-2 text-sm text-gray-400"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />{s}</div>)}</div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wider text-orange-400 font-semibold mb-2 flex items-center gap-1"><Target className="h-3 w-3" />Areas to Improve</p>
                                                            <div className="space-y-1.5">{aiAnalysis.improvements.map((s, i) => <div key={i} className="flex items-start gap-2 text-sm text-gray-400"><ArrowUpRight className="h-3.5 w-3.5 text-orange-400 mt-0.5 flex-shrink-0" />{s}</div>)}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Weekly Goals */}
                                                <div>
                                                    <p className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-2 flex items-center gap-1"><Swords className="h-3 w-3" />This Week&apos;s Goals</p>
                                                    <div className="grid sm:grid-cols-3 gap-2">{aiAnalysis.weeklyGoals.map((g, i) => (
                                                        <div key={i} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 text-sm text-gray-400 flex items-start gap-2"><Zap className="h-3.5 w-3.5 text-purple-400 mt-0.5 flex-shrink-0" />{g}</div>
                                                    ))}</div>
                                                </div>

                                                <Button variant="ghost" size="sm" onClick={fetchAIAnalysis} disabled={aiLoading} className="text-purple-400 hover:text-purple-300">
                                                    {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}Refresh Analysis
                                                </Button>
                                            </div>
                                        )}

                                        {!aiAnalysis && !aiLoading && (
                                            <div className="p-8 text-center space-y-3">
                                                <Brain className="h-8 w-8 text-purple-400/50 mx-auto" />
                                                <p className="text-sm text-gray-500">AI analysis not available</p>
                                                <Button variant="outline" size="sm" onClick={fetchAIAnalysis} className="border-purple-500/20 text-purple-400"><Sparkles className="h-4 w-4 mr-2" />Generate Analysis</Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Quests */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Swords className="h-4 w-4 text-yellow-500" />Active Quests</h3>
                                    <div className="grid sm:grid-cols-2 gap-2">
                                        {quests.map((q, i) => (
                                            <motion.div key={q.t} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/[0.04] group cursor-pointer">
                                                <q.icon className={`h-4 w-4 ${q.c} flex-shrink-0`} />
                                                <div className="flex-1 min-w-0"><p className="font-medium text-sm text-white">{q.t}</p><p className="text-[11px] text-gray-600 truncate">{q.d}</p></div>
                                                <span className="text-[10px] font-semibold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">+{q.xp} XP</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Languages */}
                                {langStats.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Code2 className="h-4 w-4 text-purple-400" />Languages</h3>
                                        {/* Language bar */}
                                        <div className="h-3 rounded-full overflow-hidden flex mb-3 bg-gray-800/50">
                                            {langStats.slice(0, 8).map((l, i) => (
                                                <motion.div key={l.n} className="h-full cursor-pointer hover:opacity-80 transition-opacity relative group" title={`${l.n}: ${l.c}`}
                                                    style={{ backgroundColor: LC[l.n] || '#666', width: `${(l.c / repos.length) * 100}%` }}
                                                    initial={{ width: 0 }} animate={{ width: `${(l.c / repos.length) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.08 }}
                                                    onClick={() => { setFilterLang(filterLang === l.n ? null : l.n); setActiveTab('repositories'); }} />
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                                            {langStats.slice(0, 8).map(l => (
                                                <button key={l.n} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors" onClick={() => { setFilterLang(l.n); setActiveTab('repositories'); }}>
                                                    <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: LC[l.n] || '#666' }} />{l.n} <span className="text-gray-700">{((l.c / repos.length) * 100).toFixed(1)}%</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pinned Repos */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Repositories</h3>
                                    <div className="grid md:grid-cols-2 gap-3">{repos.slice(0, 6).map((r, i) => <RepoCard key={r.full_name} repo={r} delay={0.5 + i * 0.04} />)}</div>
                                    {repos.length > 6 && <Button variant="ghost" className="mt-3 w-full text-purple-400 hover:text-purple-300 text-sm" onClick={() => setActiveTab('repositories')}>View all {repos.length} repositories <ChevronRight className="h-4 w-4 ml-1" /></Button>}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'repositories' && (
                            <motion.div key="repos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                <div className="flex gap-2">
                                    <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" /><Input placeholder="Find a repository..." className="pl-9 bg-white/[0.03] border-white/[0.06] focus:border-purple-500/30" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                                    <select className="bg-gray-900/80 border border-white/[0.06] rounded-lg px-3 text-sm text-gray-400" onChange={(e) => setFilterLang(e.target.value || null)} value={filterLang || ''}><option value="">Language</option>{langStats.map(l => <option key={l.n} value={l.n}>{l.n}</option>)}</select>
                                </div>
                                {filterLang && <div className="flex items-center gap-2"><Badge variant="outline" className="border-purple-500/20 text-purple-400">{filterLang}</Badge><button onClick={() => setFilterLang(null)} className="text-xs text-gray-500 hover:text-white">Clear filter</button></div>}
                                <p className="text-xs text-gray-600">{filteredRepos.length} results</p>
                                <div className="space-y-2">{filteredRepos.map((r, i) => <RepoCard key={r.full_name} repo={r} delay={Math.min(i * 0.02, 0.3)} full />)}</div>
                            </motion.div>
                        )}

                        {activeTab === 'stars' && (
                            <motion.div key="stars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                <p className="text-xs text-gray-600">{starred.length} starred repositories</p>
                                {starred.map((repo, i) => (
                                    <motion.a key={repo.full_name} href={repo.html_url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
                                        className="block p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-yellow-500/15 transition-all group">
                                        <div className="flex items-start gap-3">
                                            <img src={repo.owner.avatar_url} alt={repo.owner.login} className="h-5 w-5 rounded-full mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-purple-400 group-hover:text-purple-300">{repo.full_name}</p>
                                                {repo.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{repo.description}</p>}
                                                <div className="flex gap-3 mt-2 text-xs text-gray-600">
                                                    {repo.language && <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: LC[repo.language] || '#666' }} />{repo.language}</span>}
                                                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{repo.stars.toLocaleString()}</span>
                                                    {repo.forks > 0 && <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{repo.forks.toLocaleString()}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.a>
                                ))}
                                {starred.length === 0 && <div className="text-center py-12 text-gray-600">No starred repositories</div>}
                            </motion.div>
                        )}

                        {(activeTab === 'followers' || activeTab === 'following') && (
                            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                {(() => {
                                    const users = activeTab === 'followers' ? followersList : followingList; return (<>
                                        <p className="text-xs text-gray-600">{users.length} people</p>
                                        <div className="grid sm:grid-cols-2 gap-2">
                                            {users.map((u, i) => (
                                                <motion.a key={u.login} href={u.html_url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.2) }}
                                                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/15 transition-all">
                                                    <img src={u.avatar_url} alt={u.login} className="h-10 w-10 rounded-full border border-white/[0.06]" />
                                                    <p className="font-medium text-purple-400 text-sm">{u.login}</p>
                                                    <ExternalLink className="h-3.5 w-3.5 text-gray-700 ml-auto" />
                                                </motion.a>
                                            ))}
                                        </div>
                                        {users.length === 0 && <div className="text-center py-12 text-gray-600">{activeTab === 'followers' ? 'No followers yet' : 'Not following anyone'}</div>}
                                    </>);
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
