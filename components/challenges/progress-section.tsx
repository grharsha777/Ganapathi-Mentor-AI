"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Flame, Target, Code, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

function ContributionHeatmap({ heatmap }: { heatmap: Record<string, number> }) {
    const weeks = useMemo(() => {
        const result: { date: string; count: number; day: number }[][] = [];
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 364);
        // Align to Sunday
        startDate.setDate(startDate.getDate() - startDate.getDay());

        let currentWeek: { date: string; count: number; day: number }[] = [];
        const cursor = new Date(startDate);

        while (cursor <= today) {
            const dateStr = cursor.toISOString().split('T')[0];
            currentWeek.push({
                date: dateStr,
                count: heatmap[dateStr] || 0,
                day: cursor.getDay(),
            });
            if (cursor.getDay() === 6) {
                result.push(currentWeek);
                currentWeek = [];
            }
            cursor.setDate(cursor.getDate() + 1);
        }
        if (currentWeek.length > 0) result.push(currentWeek);
        return result;
    }, [heatmap]);

    const getColor = (count: number) => {
        if (count === 0) return 'bg-white/5';
        if (count === 1) return 'bg-emerald-900/60';
        if (count <= 3) return 'bg-emerald-700/60';
        if (count <= 5) return 'bg-emerald-500/60';
        return 'bg-emerald-400/80';
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="overflow-x-auto">
            <div className="flex gap-[3px] min-w-[700px]">
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map((d, di) => (
                            <div
                                key={di}
                                className={cn('w-[11px] h-[11px] rounded-sm transition-colors', getColor(d.count))}
                                title={`${d.date}: ${d.count} submission${d.count !== 1 ? 's' : ''}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="w-[11px] h-[11px] rounded-sm bg-white/5" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-900/60" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-700/60" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-500/60" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-400/80" />
                <span>More</span>
            </div>
        </div>
    );
}

export default function ProgressSection() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await fetch('/api/challenges/progress');
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!data || data.error) {
        return (
            <Card className="border-white/10 bg-background/40 p-8 text-center">
                <p className="text-muted-foreground">Sign in and solve challenges to see your progress.</p>
            </Card>
        );
    }

    const { stats, allBadges, heatmap } = data;

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="border-white/10 bg-background/40">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.totalSolved}</div>
                            <div className="text-xs text-muted-foreground">Solved</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-background/40">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Flame className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.currentStreak}</div>
                            <div className="text-xs text-muted-foreground">Day Streak</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-background/40">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Code className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                            <div className="text-xs text-muted-foreground">Submissions</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-background/40">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.uniqueLanguages}</div>
                            <div className="text-xs text-muted-foreground">Languages</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Difficulty Breakdown */}
            <Card className="border-white/10 bg-background/40">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Difficulty Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="text-sm">Easy: <strong>{stats.easySolved}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="text-sm">Medium: <strong>{stats.mediumSolved}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-sm">Hard: <strong>{stats.hardSolved}</strong></span>
                    </div>
                </CardContent>
            </Card>

            {/* Contribution Heatmap */}
            <Card className="border-white/10 bg-background/40">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Submission Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ContributionHeatmap heatmap={heatmap} />
                </CardContent>
            </Card>

            {/* Achievement Badges */}
            <Card className="border-white/10 bg-background/40">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">🏅 Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {allBadges.map((badge: any) => (
                            <div
                                key={badge.id}
                                className={cn(
                                    "flex flex-col items-center text-center p-3 rounded-xl border transition-all",
                                    badge.earned
                                        ? "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5"
                                        : "bg-muted/10 border-white/5 opacity-40 grayscale"
                                )}
                            >
                                <span className="text-2xl mb-1">{badge.icon}</span>
                                <span className="text-xs font-bold leading-tight">{badge.name}</span>
                                <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{badge.description}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
