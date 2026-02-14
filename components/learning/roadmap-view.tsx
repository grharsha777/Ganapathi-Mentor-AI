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

    // Auto-load last roadmap on mount
    useEffect(() => {
        store.load<any>('last_roadmap').then(data => {
            if (data) {
                if (data.role) setRole(data.role);
                if (data.roadmap) setRoadmap(ensureIds(data.roadmap));
            }
        }).catch(() => { });
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
                // Auto-save
                store.save('last_roadmap', { role, repoUrl, roadmap: rm }, role).catch(() => { });
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
        store.save('last_roadmap', { role, repoUrl, roadmap: updatedRoadmap }, role).catch(() => { });
        toast.success(currentStatus ? "Marked as incomplete" : "Marked as completed");
    };

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
                                We'll analyze this code to detect skill gaps and tailor the roadmap.
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
                        <Badge variant="outline" className="text-lg py-1 px-4">
                            Week 1 of 4
                        </Badge>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {roadmap.milestones.map((m, i) => (
                            <Card key={i} className={`relative overflow-hidden border-l-4 ${i === 0 ? 'border-l-primary' : 'border-l-muted'}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center rounded-full text-xs">
                                            W{m.week}
                                        </Badge>
                                        {m.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">{m.description}</p>
                                    <div className="space-y-3">
                                        {m.resources.map((resource, ri) => (
                                            <div key={resource.id || ri} className="flex flex-col gap-2 p-3 border rounded-lg bg-card hover:border-primary/50 transition-colors group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {resource.type === 'video' ? <PlayCircle className="h-4 w-4 text-red-500" /> : <ExternalLink className="h-4 w-4 text-blue-500" />}
                                                        <span className="text-xs font-medium leading-none truncate max-w-[120px]">{resource.title}</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                                        <a href={resource.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /></a>
                                                    </Button>
                                                </div>
                                                {resource.type === 'video' && resource.url.includes('youtube.com') && (
                                                    <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                                                        <img
                                                            src={`https://img.youtube.com/vi/${resource.url.split('v=')[1]?.split('&')[0]}/mqdefault.jpg`}
                                                            alt="Thumbnail"
                                                            className="object-cover w-full h-full"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                            <PlayCircle className="h-8 w-8 text-white opacity-80" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mt-auto">
                                                    <Checkbox
                                                        checked={resource.is_completed}
                                                        onCheckedChange={() => toggleResource(resource.id || '', resource.is_completed)}
                                                    />
                                                    <span className="text-[10px] text-muted-foreground">Mark as completed</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
