"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Search, Filter, ArrowRight, Loader2, Flame, Sparkles, Zap } from 'lucide-react';
import ProgressSection from '@/components/challenges/progress-section';

const DIFFICULTY_COLORS: Record<string, string> = {
    Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Hard: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const DIFFICULTY_ICONS: Record<string, any> = {
    Easy: Sparkles,
    Medium: Flame,
    Hard: Zap,
};

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
    const [seeding, setSeeding] = useState(false);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (difficultyFilter) params.set('difficulty', difficultyFilter);
            const res = await fetch(`/api/challenges?${params.toString()}`);
            const data = await res.json();
            setChallenges(data.challenges || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchChallenges(); }, [difficultyFilter]);

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

    const grouped = {
        Easy: challenges.filter(c => c.difficulty === 'Easy'),
        Medium: challenges.filter(c => c.difficulty === 'Medium'),
        Hard: challenges.filter(c => c.difficulty === 'Hard'),
    };

    return (
        <PageShell>
            <PageHeader
                title="Challenge Hub"
                description="Master DSA with 20+ curated problems from LeetCode, HackerRank & more. Write code, run tests, and level up."
                icon={Trophy}
            />

            {/* Progress Dashboard */}
            <ProgressSection />

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search challenges by name or tag..."
                        className="pl-10 bg-background/50 border-white/10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchChallenges()}
                    />
                </div>
                <div className="flex gap-2">
                    {['Easy', 'Medium', 'Hard'].map((d) => (
                        <Button
                            key={d}
                            variant={difficultyFilter === d ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
                            className={difficultyFilter === d ? DIFFICULTY_COLORS[d] : 'border-white/10'}
                        >
                            {d}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Empty state / Seed prompt */}
            {!loading && challenges.length === 0 && (
                <Card className="border-dashed border-white/10 bg-background/30 text-center py-16">
                    <CardContent className="flex flex-col items-center gap-4">
                        <Trophy className="h-16 w-16 text-muted-foreground opacity-40" />
                        <h3 className="text-xl font-bold">No Challenges Found</h3>
                        <p className="text-muted-foreground max-w-md">
                            Seed the database with 20 curated coding problems to get started.
                        </p>
                        <Button
                            onClick={handleSeed}
                            disabled={seeding}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                        >
                            {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            Seed 20 Problems
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Challenge Grid */}
            {!loading && challenges.length > 0 && (
                <div className="space-y-10">
                    {Object.entries(grouped).map(([difficulty, items]) => {
                        if (items.length === 0) return null;
                        const DiffIcon = DIFFICULTY_ICONS[difficulty];
                        return (
                            <div key={difficulty}>
                                <div className="flex items-center gap-2 mb-4">
                                    <DiffIcon className="h-5 w-5" />
                                    <h2 className="text-lg font-bold uppercase tracking-wide">{difficulty}</h2>
                                    <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {items.map((c: any) => (
                                        <Link key={c.slug} href={`/dashboard/challenges/${c.slug}`}>
                                            <Card className="group cursor-pointer border-white/10 hover:border-white/20 bg-background/40 hover:bg-background/60 transition-all duration-200 h-full">
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-start justify-between">
                                                        <CardTitle className="text-base font-bold group-hover:text-primary transition-colors line-clamp-1">
                                                            {c.title}
                                                        </CardTitle>
                                                        <Badge className={`text-[10px] shrink-0 ml-2 ${DIFFICULTY_COLORS[c.difficulty]}`}>
                                                            {c.difficulty}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {(c.tags || []).slice(0, 3).map((tag: string) => (
                                                                <Badge key={tag} variant="outline" className="text-[10px] border-white/10 px-1.5">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                                                    </div>
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        {c.category} • {c.source}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </PageShell>
    );
}
