"use client"

import { useState, useEffect } from 'react';
import { useContentStore } from '@/lib/content-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    ExternalLink,
    GraduationCap,
    Loader2,
    PlayCircle,
    Plus,
    Trophy,
    ArrowRight,
    Video,
    FileText,
    Flame,
    Target,
    Star,
    Zap,
    Brain,
    Rocket,
    BookOpen,
    Code2,
    TrendingUp,
    Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface Resource {
    id?: string;
    title: string;
    url: string;
    type: 'video' | 'article' | 'doc' | 'course';
    is_completed: boolean;
}

interface Milestone {
    id?: string;
    title: string;
    description: string;
    week: number;
    due_date?: string;
    status?: string;
    resources: Resource[];
}

interface Roadmap {
    id: string;
    title: string;
    description: string;
    milestones: Milestone[];
}

const DURATION_PRESETS = [
    { label: '1 Week', weeks: 1, icon: Zap, color: 'from-red-500 to-orange-500' },
    { label: '2 Weeks', weeks: 2, icon: Flame, color: 'from-orange-500 to-amber-500' },
    { label: '1 Month', weeks: 4, icon: Target, color: 'from-amber-500 to-yellow-500' },
    { label: '2 Months', weeks: 8, icon: Star, color: 'from-green-500 to-emerald-500' },
    { label: '3 Months', weeks: 12, icon: Trophy, color: 'from-blue-500 to-indigo-500' },
];

const LEVELS = [
    { value: 'Beginner', label: '🌱 Beginner', desc: 'New to this field' },
    { value: 'Intermediate', label: '⚡ Intermediate', desc: 'Some experience' },
    { value: 'Advanced', label: '🔥 Advanced', desc: 'Experienced developer' },
    { value: 'Expert', label: '🏆 Expert', desc: 'Senior/Lead level' },
];

export default function RoadmapView() {
    const [role, setRole] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [durationWeeks, setDurationWeeks] = useState(4);
    const [customWeeks, setCustomWeeks] = useState('');
    const [level, setLevel] = useState('Intermediate');
    const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
    const store = useContentStore('roadmaps');

    const ensureIds = (rm: Roadmap): Roadmap => {
        return {
            ...rm,
            milestones: rm.milestones.map(m => ({
                ...m,
                resources: m.resources.map(r => ({
                    ...r,
                    id: r.id || Math.random().toString(36).substring(7)
                }))
            }))
        };
    };

    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const userRes = await fetch('/api/auth/me');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (userData.user?.id) {
                        const uid = userData.user.id;
                        setUserId(uid);
                        const data = await store.load<any>(`last_roadmap_${uid}`);
                        if (data) {
                            if (data.role) setRole(data.role);
                            if (data.roadmap) setRoadmap(ensureIds(data.roadmap));
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load user or roadmap:", e);
            }
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const generateRoadmap = async () => {
        if (!role) return toast.error("Please enter a role");
        setLoading(true);
        try {
            const res = await fetch('/api/learning-path/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, repoUrl, durationWeeks, level })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (data.roadmap) {
                const rm = ensureIds({ ...data.roadmap, id: 'generated' });
                setRoadmap(rm);
                setExpandedWeeks(new Set([1]));
                if (userId) {
                    store.save(`last_roadmap_${userId}`, { role, repoUrl, roadmap: rm }, role).catch(() => { });
                }
            }
            toast.success("Roadmap generated!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleResource = async (resourceId: string, currentStatus: boolean) => {
        if (!roadmap) return;
        const updatedRoadmap = {
            ...roadmap,
            milestones: roadmap.milestones.map(m => ({
                ...m,
                resources: m.resources.map(r => {
                    if (r.id === resourceId) return { ...r, is_completed: !currentStatus };
                    return r;
                })
            }))
        };
        setRoadmap(updatedRoadmap);
        if (userId) {
            store.save(`last_roadmap_${userId}`, { role, repoUrl, roadmap: updatedRoadmap }, role).catch(() => { });
        }
        toast.success(currentStatus ? "Marked as incomplete" : "Marked as completed! +10 XP");
    };

    const toggleWeek = (week: number) => {
        setExpandedWeeks(prev => {
            const next = new Set(prev);
            if (next.has(week)) next.delete(week);
            else next.add(week);
            return next;
        });
    };

    // Progress calculations
    const totalResources = roadmap?.milestones?.reduce((acc, m) => acc + m.resources.length, 0) || 0;
    const completedResources = roadmap?.milestones?.reduce((acc, m) => acc + m.resources.filter(r => r.is_completed).length, 0) || 0;
    const progressPercent = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;
    const totalXP = completedResources * 10;
    const allCompleted = totalResources > 0 && completedResources === totalResources;

    const getResourceIcon = (type: string, completed: boolean) => {
        const cls = `h-5 w-5 flex-shrink-0 ${completed ? 'text-green-400' : ''}`;
        if (type === 'video') return <PlayCircle className={cls + (!completed ? ' text-red-400' : '')} />;
        if (type === 'article') return <FileText className={cls + (!completed ? ' text-blue-400' : '')} />;
        if (type === 'doc') return <BookOpen className={cls + (!completed ? ' text-purple-400' : '')} />;
        return <Code2 className={cls + (!completed ? ' text-amber-400' : '')} />;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {!roadmap ? (
                /* ── GENERATOR FORM ── */
                <div className="w-full max-w-4xl mx-auto space-y-8">
                    <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-background via-background to-purple-950/20">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl" />

                        <CardHeader className="relative z-10 pb-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl shadow-purple-500/20">
                                    <Brain className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                                        AI Learning Engine
                                    </CardTitle>
                                    <CardDescription className="text-lg text-muted-foreground">
                                        Generate a hyper-personalized roadmap powered by AI
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="relative z-10 space-y-8">
                            {/* Target Role */}
                            <div className="space-y-3">
                                <Label htmlFor="role" className="text-lg font-bold flex items-center gap-2">
                                    <Rocket className="h-5 w-5 text-purple-400" /> Target Role
                                </Label>
                                <Input
                                    id="role"
                                    placeholder="e.g. Full-Stack Engineer, ML Engineer, DevOps Architect..."
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="h-14 text-lg bg-muted/30 border-muted-foreground/20 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                />
                            </div>

                            {/* Experience Level */}
                            <div className="space-y-3">
                                <Label className="text-lg font-bold flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-400" /> Experience Level
                                </Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {LEVELS.map(l => (
                                        <button
                                            key={l.value}
                                            onClick={() => setLevel(l.value)}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${level === l.value
                                                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10 scale-[1.02]'
                                                : 'border-border/50 bg-muted/20 hover:border-muted-foreground/30 hover:bg-muted/30'
                                                }`}
                                        >
                                            <p className="text-lg font-bold">{l.label}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{l.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration Selector */}
                            <div className="space-y-3">
                                <Label className="text-lg font-bold flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-amber-400" /> Duration
                                </Label>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                    {DURATION_PRESETS.map(d => {
                                        const Icon = d.icon;
                                        return (
                                            <button
                                                key={d.weeks}
                                                onClick={() => { setDurationWeeks(d.weeks); setCustomWeeks(''); }}
                                                className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 group ${durationWeeks === d.weeks && !customWeeks
                                                    ? 'border-transparent shadow-lg scale-[1.02]'
                                                    : 'border-border/50 bg-muted/20 hover:border-muted-foreground/30'
                                                    }`}
                                            >
                                                {durationWeeks === d.weeks && !customWeeks && (
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${d.color} opacity-15`} />
                                                )}
                                                <div className="relative z-10 flex flex-col items-center gap-2">
                                                    <Icon className={`h-6 w-6 ${durationWeeks === d.weeks && !customWeeks ? 'text-white' : 'text-muted-foreground'}`} />
                                                    <span className="text-sm font-bold">{d.label}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-sm text-muted-foreground font-medium">Custom:</span>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 6"
                                        min={1}
                                        max={12}
                                        value={customWeeks}
                                        onChange={(e) => {
                                            setCustomWeeks(e.target.value);
                                            if (e.target.value) setDurationWeeks(parseInt(e.target.value) || 4);
                                        }}
                                        className="w-24 h-10 text-center bg-muted/30 rounded-lg"
                                    />
                                    <span className="text-sm text-muted-foreground">weeks</span>
                                </div>
                            </div>

                            {/* GitHub Repo */}
                            <div className="space-y-3">
                                <Label htmlFor="repo" className="text-lg font-bold flex items-center gap-2">
                                    <Code2 className="h-5 w-5 text-green-400" /> GitHub Repository
                                    <Badge variant="outline" className="text-xs">Optional</Badge>
                                </Label>
                                <Input
                                    id="repo"
                                    placeholder="https://github.com/username/repo"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    className="h-14 text-lg bg-muted/30 border-muted-foreground/20 rounded-xl"
                                />
                                <p className="text-sm text-muted-foreground">
                                    We&apos;ll analyze your code to detect skill gaps and tailor the roadmap.
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="relative z-10 pt-4 pb-8">
                            <Button
                                size="lg"
                                className="w-full text-xl h-16 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 hover:opacity-90 transition-all rounded-2xl shadow-xl shadow-purple-500/20 font-black tracking-wide"
                                onClick={generateRoadmap}
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Generating Your Neural Path...</>
                                ) : (
                                    <><Sparkles className="mr-3 h-6 w-6" /> Generate {durationWeeks}-Week Roadmap <ArrowRight className="ml-3 h-6 w-6" /></>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            ) : (
                /* ── ROADMAP DISPLAY ── */
                <div className="space-y-8">
                    {/* Header + Progress */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background via-background to-purple-950/20 border border-border/30 p-8 shadow-2xl">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl" />

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                                    {roadmap.title}
                                </h2>
                                <p className="text-lg text-muted-foreground mt-2">{roadmap.description}</p>
                            </div>

                            <div className="flex items-center gap-6 flex-shrink-0">
                                <div className="text-center">
                                    <div className="text-4xl font-black text-amber-400">{totalXP}</div>
                                    <div className="text-sm text-muted-foreground font-medium">Total XP</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-black text-emerald-400">{progressPercent}%</div>
                                    <div className="text-sm text-muted-foreground font-medium">Complete</div>
                                </div>
                                <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setRoadmap(null)}>
                                    <Plus className="h-5 w-5 mr-2" /> New Path
                                </Button>
                            </div>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="relative z-10 mt-6">
                            <div className="flex items-center justify-between text-sm font-medium mb-2">
                                <span className="text-muted-foreground">{completedResources}/{totalResources} resources completed</span>
                                <span className="text-amber-400 font-bold">{totalXP} XP earned</span>
                            </div>
                            <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-full transition-all duration-1000 ease-out relative"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completion Banner */}
                    {allCompleted && (
                        <Card className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 border-green-500/30 ring-1 ring-green-500/20 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center relative z-10">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mb-6 shadow-xl shadow-green-500/20 ring-4 ring-green-500/10 animate-bounce">
                                    <Trophy className="h-12 w-12 text-white" />
                                </div>
                                <h3 className="text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500">
                                    🎉 Mastery Achieved!
                                </h3>
                                <p className="text-lg text-muted-foreground max-w-lg mb-8">
                                    You&apos;ve completed the entire <strong className="text-foreground">{roadmap.title}</strong> learning path! You earned <strong className="text-amber-400">{totalXP} XP</strong>!
                                </p>
                                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-green-500/25 h-14 px-10 text-lg font-black rounded-2xl" onClick={() => setRoadmap(null)}>
                                    Generate Next Path <ArrowRight className="ml-3 h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Milestones - Accordion Style */}
                    <div className="space-y-4">
                        {roadmap.milestones.map((m, i) => {
                            const total = m.resources.length;
                            const completed = m.resources.filter(r => r.is_completed).length;
                            const isMilestoneDone = total > 0 && completed === total;
                            const isExpanded = expandedWeeks.has(m.week);
                            const milestoneXP = completed * 10;

                            return (
                                <Card
                                    key={i}
                                    className={`relative overflow-hidden transition-all duration-500 border-0 shadow-lg ${isMilestoneDone
                                        ? 'bg-gradient-to-r from-green-500/5 to-emerald-500/5 ring-1 ring-green-500/30'
                                        : 'bg-card/80 backdrop-blur-sm ring-1 ring-border/30 hover:ring-primary/30'
                                        }`}
                                >
                                    {/* Milestone Header - Clickable */}
                                    <button
                                        onClick={() => toggleWeek(m.week)}
                                        className="w-full p-6 flex items-center justify-between text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${isMilestoneDone
                                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/20'
                                                : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400'
                                                }`}>
                                                {isMilestoneDone ? <CheckCircle2 className="h-7 w-7" /> : `W${m.week}`}
                                            </div>
                                            <div>
                                                <h3 className={`text-xl font-bold ${isMilestoneDone ? 'text-green-400' : ''}`}>
                                                    {m.title}
                                                </h3>
                                                <p className="text-base text-muted-foreground mt-1">{m.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-amber-400">{milestoneXP} XP</div>
                                                <div className="text-sm text-muted-foreground">{completed}/{total}</div>
                                            </div>
                                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Progress Bar */}
                                    <div className="px-6 pb-2">
                                        <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-500 ${isMilestoneDone ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}
                                                style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
                                        </div>
                                    </div>

                                    {/* Expanded Resources */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 pt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                            {m.resources.map((resource, ri) => (
                                                <div
                                                    key={resource.id || ri}
                                                    className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${resource.is_completed
                                                        ? 'bg-green-500/5 border-green-500/20'
                                                        : 'bg-muted/20 border-border/30 hover:border-primary/30 hover:bg-muted/30'
                                                        }`}
                                                >
                                                    <Checkbox
                                                        checked={resource.is_completed}
                                                        onCheckedChange={() => toggleResource(resource.id || '', resource.is_completed)}
                                                        className={`h-6 w-6 rounded-lg ${resource.is_completed ? 'border-green-500 data-[state=checked]:bg-green-500' : ''}`}
                                                    />

                                                    {getResourceIcon(resource.type, resource.is_completed)}

                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-base font-semibold truncate ${resource.is_completed ? 'text-muted-foreground line-through' : ''}`}>
                                                            {resource.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs capitalize">{resource.type}</Badge>
                                                            {resource.is_completed && <span className="text-xs text-green-400 font-bold">+10 XP ✓</span>}
                                                        </div>
                                                    </div>

                                                    <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
