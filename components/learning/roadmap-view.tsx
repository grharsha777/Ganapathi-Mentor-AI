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
    ChevronRight,
    Clock,
    ExternalLink,
    GraduationCap,
    Loader2,
    PlayCircle,
    Plus,
    Trophy,
    ArrowRight,
    Video,
    FileText
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

export default function RoadmapView() {
    const [role, setRole] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const store = useContentStore('roadmaps');

    // Helper to ensure all resources have unique IDs
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

    // Auto-load user and their last roadmap on mount
    useEffect(() => {
        const init = async () => {
            try {
                // Get current user to isolate localStorage/IndexedDB
                const userRes = await fetch('/api/auth/me');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (userData.user?.id) {
                        const uid = userData.user.id;
                        setUserId(uid);

                        // Load roadmap specific to this user
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
                body: JSON.stringify({ role, repoUrl })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (data.roadmap) {
                const rm = ensureIds({ ...data.roadmap, id: 'generated' });
                setRoadmap(rm);
                // Auto-save with user scoping
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
                    if (r.id === resourceId) {
                        return { ...r, is_completed: !currentStatus };
                    }
                    return r;
                })
            }))
        };

        setRoadmap(updatedRoadmap);
        // Save updated roadmap state
        if (userId) {
            store.save(`last_roadmap_${userId}`, { role, repoUrl, roadmap: updatedRoadmap }, role).catch(() => { });
        }
        toast.success(currentStatus ? "Marked as incomplete" : "Marked as completed");
    };

    // Check overall completion
    const allCompleted = roadmap?.milestones?.every(m => m.resources.every(r => r.is_completed));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {!roadmap ? (
                <Card className="w-full max-w-2xl mx-auto border-none shadow-xl bg-gradient-to-br from-background to-secondary/20">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            Generate Your AI Learning Path
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Analyze your skills and get a personalized 4-week roadmap.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="role">Target Role</Label>
                            <Input
                                id="role"
                                placeholder="e.g. Senior React Developer, DevOps Engineer"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="h-12 text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="repo">GitHub Repository (Optional)</Label>
                            <Input
                                id="repo"
                                placeholder="https://github.com/username/repo"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                className="h-12"
                            />
                            <p className="text-xs text-muted-foreground">
                                We&apos;ll analyze this code to detect skill gaps and tailor the roadmap.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            size="lg"
                            className="w-full text-lg h-14 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all"
                            onClick={generateRoadmap}
                            disabled={loading}
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Intelligence...</>
                            ) : (
                                <>Generate Roadmap <ArrowRight className="ml-2 h-5 w-5" /></>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">{roadmap.title}</h2>
                            <p className="text-muted-foreground">{roadmap.description}</p>
                        </div>
                        <Badge variant="outline" className="text-lg py-1 px-4 border-primary/30 bg-primary/5 text-primary">
                            {allCompleted ? '100% Completed' : 'In Progress'}
                        </Badge>
                    </div>

                    {allCompleted && (
                        <Card className="mt-8 relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 border-green-500/30 ring-1 ring-green-500/20 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center relative z-10">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mb-6 shadow-xl shadow-green-500/20 ring-4 ring-green-500/10">
                                    <Trophy className="h-12 w-12 text-white" />
                                </div>
                                <h3 className="text-3xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500">
                                    Mastery Achieved!
                                </h3>
                                <p className="text-muted-foreground text-lg max-w-lg mb-8">
                                    You have successfully completed the entire 4-week <strong className="text-foreground">{roadmap.title}</strong> learning path. You&apos;ve earned a massive XP boost and mastered these skills!
                                </p>
                                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-green-500/25 h-12 px-8 text-lg font-bold rounded-xl" onClick={() => setRoadmap(null)}>
                                    Generate Next Milestone <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
                        {roadmap.milestones.map((m, i) => {
                            const total = m.resources.length;
                            const completed = m.resources.filter(r => r.is_completed).length;
                            const isMilestoneDone = total > 0 && completed === total;

                            return (
                                <Card key={i} className={`relative overflow-hidden transition-all duration-500 ${isMilestoneDone ? 'border-green-500/50 bg-green-500/5' : i === 0 ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-muted'}`}>
                                    {isMilestoneDone && (
                                        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                                            <div className="absolute top-0 right-0 border-[32px] border-transparent border-t-green-500 border-r-green-500 opacity-20" />
                                            <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between pointer-events-none">
                                                <Badge variant={isMilestoneDone ? "default" : "secondary"} className={`w-8 h-8 flex items-center justify-center rounded-full text-xs ${isMilestoneDone ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                                                    W{m.week}
                                                </Badge>
                                                {isMilestoneDone && <span className="text-xs font-bold text-green-500 uppercase tracking-widest mr-7">Done</span>}
                                            </div>
                                            <span className={`${isMilestoneDone ? 'text-green-500/90' : ''} leading-tight`}>{m.title}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 mb-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-500 ${isMilestoneDone ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{m.description}</p>
                                        <div className="space-y-3 relative z-10">
                                            {m.resources.map((resource, ri) => (
                                                <div key={resource.id || ri} className={`flex flex-col gap-2 p-3 border rounded-lg transition-colors group ${resource.is_completed ? 'bg-green-500/10 border-green-500/30' : 'bg-card hover:border-primary/50'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 w-[85%]">
                                                            {resource.type === 'video' ? <PlayCircle className={`h-4 w-4 flex-shrink-0 ${resource.is_completed ? 'text-green-500' : 'text-red-500'}`} /> : <ExternalLink className={`h-4 w-4 flex-shrink-0 ${resource.is_completed ? 'text-green-500' : 'text-blue-500'}`} />}
                                                            <span className={`text-xs font-medium leading-tight line-clamp-2 ${resource.is_completed ? 'text-muted-foreground line-through' : ''}`}>{resource.title}</span>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                                            <a href={resource.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /></a>
                                                        </Button>
                                                    </div>

                                                    {!resource.is_completed && resource.type === 'video' && resource.url.includes('youtube.com') && (
                                                        <div className="relative aspect-video rounded-md overflow-hidden bg-muted my-1">
                                                            <img
                                                                src={`https://img.youtube.com/vi/${resource.url.split('v=')[1]?.split('&')[0]}/mqdefault.jpg`}
                                                                alt="Thumbnail"
                                                                className="object-cover w-full h-full"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none">
                                                                <PlayCircle className="h-8 w-8 text-white opacity-80" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 mt-auto pt-1">
                                                        <Checkbox
                                                            checked={resource.is_completed}
                                                            onCheckedChange={() => toggleResource(resource.id || '', resource.is_completed)}
                                                            className={resource.is_completed ? 'border-green-500 data-[state=checked]:bg-green-500' : ''}
                                                        />
                                                        <span className={`text-[10px] font-medium ${resource.is_completed ? 'text-green-500 uppercase tracking-widest' : 'text-muted-foreground'}`}>
                                                            {resource.is_completed ? 'Completed' : 'Mark as completed'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
