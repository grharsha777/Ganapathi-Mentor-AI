"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import {
    FileText, Download, Loader2, Trophy, Code, Flame,
    ExternalLink, Star, Target, Zap, Award
} from 'lucide-react';

const DIFFICULTY_COLORS: Record<string, string> = {
    Easy: 'text-emerald-400',
    Medium: 'text-amber-400',
    Hard: 'text-red-400',
};

const SKILL_COLORS: Record<string, string> = {
    Expert: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    Advanced: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Intermediate: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Beginner: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function PortfolioPage() {
    const [portfolio, setPortfolio] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const resumeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await fetch('/api/portfolio');
                const data = await res.json();
                setPortfolio(data.portfolio);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, []);

    const handleExport = () => {
        if (!resumeRef.current) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <html>
            <head>
                <title>${portfolio?.name || 'Developer'} - Resume</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
                    h1 { font-size: 28px; margin-bottom: 4px; color: #16213e; }
                    h2 { font-size: 18px; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #6c63ff; color: #16213e; }
                    h3 { font-size: 14px; margin: 8px 0 4px; }
                    p, li { font-size: 13px; line-height: 1.6; }
                    .subtitle { color: #666; font-size: 14px; margin-bottom: 16px; }
                    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 12px 0; }
                    .stat-box { background: #f8f9fa; border-radius: 8px; padding: 12px; text-align: center; }
                    .stat-num { font-size: 24px; font-weight: bold; color: #6c63ff; }
                    .stat-label { font-size: 11px; color: #888; text-transform: uppercase; }
                    .skills { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
                    .skill-badge { background: #f0f0ff; color: #6c63ff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
                    .problem-list { columns: 2; column-gap: 20px; }
                    .problem-item { font-size: 12px; padding: 3px 0; break-inside: avoid; }
                    .difficulty { font-weight: 700; }
                    .easy { color: #22c55e; }
                    .medium { color: #f59e0b; }
                    .hard { color: #ef4444; }
                    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
                    .tag { background: #e8e8ff; color: #555; padding: 2px 8px; border-radius: 8px; font-size: 11px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <h1>${portfolio?.name || 'Developer'}</h1>
                <p class="subtitle">${portfolio?.email || ''} • Ganapathi Mentor AI</p>

                <h2>📊 Coding Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-box"><div class="stat-num">${portfolio?.stats?.totalSolved || 0}</div><div class="stat-label">Solved</div></div>
                    <div class="stat-box"><div class="stat-num">${portfolio?.stats?.streak || 0}</div><div class="stat-label">Day Streak</div></div>
                    <div class="stat-box"><div class="stat-num">${portfolio?.stats?.totalSubmissions || 0}</div><div class="stat-label">Submissions</div></div>
                    <div class="stat-box"><div class="stat-num">${portfolio?.stats?.languages?.length || 0}</div><div class="stat-label">Languages</div></div>
                </div>
                <p>
                    <span class="difficulty easy">Easy: ${portfolio?.stats?.easySolved || 0}</span> •
                    <span class="difficulty medium">Medium: ${portfolio?.stats?.mediumSolved || 0}</span> •
                    <span class="difficulty hard">Hard: ${portfolio?.stats?.hardSolved || 0}</span>
                </p>

                <h2>🛠️ Technical Skills</h2>
                <div class="skills">
                    ${(portfolio?.skills || []).map((s: any) => `<span class="skill-badge">${s.name} (${s.level})</span>`).join('')}
                </div>
                <h3>Languages</h3>
                <div class="tags">
                    ${(portfolio?.stats?.languages || []).map((l: string) => `<span class="tag">${l}</span>`).join('')}
                </div>
                <h3>Algorithm Tags</h3>
                <div class="tags">
                    ${(portfolio?.stats?.tags || []).map((t: string) => `<span class="tag">${t}</span>`).join('')}
                </div>

                <h2>✅ Solved Problems</h2>
                <div class="problem-list">
                    ${(portfolio?.solvedProblems || []).map((p: any) => `<div class="problem-item"><span class="difficulty ${p.difficulty.toLowerCase()}">[${p.difficulty}]</span> ${p.title}</div>`).join('')}
                </div>

                <h2>🏆 Profile Summary</h2>
                <p>Level ${portfolio?.level || 1} developer with ${portfolio?.xp || 0} XP, proficient in ${(portfolio?.stats?.languages || []).join(', ') || 'multiple languages'}, with expertise in ${(portfolio?.stats?.categories || []).slice(0, 5).join(', ') || 'algorithms and data structures'}.</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 500);
    };

    if (loading) {
        return (
            <PageShell>
                <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            </PageShell>
        );
    }

    if (!portfolio) {
        return (
            <PageShell>
                <PageHeader title="Portfolio" description="Generate your professional developer portfolio." icon={FileText} />
                <Card className="border-white/10 bg-background/40 text-center py-16">
                    <CardContent>
                        <p className="text-muted-foreground">Unable to load portfolio. Please sign in and solve some challenges first.</p>
                    </CardContent>
                </Card>
            </PageShell>
        );
    }

    const { stats, skills, solvedProblems } = portfolio;

    return (
        <PageShell>
            <div className="flex items-center justify-between mb-6">
                <PageHeader title="Developer Portfolio" description="Your professional coding profile, powered by Ganapathi AI." icon={FileText} />
                <Button onClick={handleExport} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 font-semibold shrink-0">
                    <Download className="h-4 w-4 mr-2" /> Export PDF
                </Button>
            </div>

            <div ref={resumeRef} className="space-y-6">
                {/* Profile Header */}
                <Card className="border-white/10 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/25">
                                {portfolio.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{portfolio.name}</h2>
                                <p className="text-sm text-muted-foreground">{portfolio.email}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">
                                        <Star className="h-3 w-3 mr-1" /> Level {portfolio.level || 1}
                                    </Badge>
                                    <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/30">
                                        <Zap className="h-3 w-3 mr-1" /> {portfolio.xp || 0} XP
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Problems Solved', value: stats.totalSolved, icon: Trophy, gradient: 'from-emerald-500 to-green-600' },
                        { label: 'Day Streak', value: stats.streak, icon: Flame, gradient: 'from-orange-500 to-red-600' },
                        { label: 'Submissions', value: stats.totalSubmissions, icon: Code, gradient: 'from-blue-500 to-indigo-600' },
                        { label: 'Languages', value: stats.languages?.length || 0, icon: Target, gradient: 'from-violet-500 to-purple-600' },
                    ].map((s, i) => (
                        <Card key={i} className="border-white/10 bg-background/40">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center`}>
                                    <s.icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{s.value}</div>
                                    <div className="text-xs text-muted-foreground">{s.label}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Difficulty Breakdown */}
                <Card className="border-white/10 bg-background/40">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Difficulty Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-400">{stats.easySolved}</div>
                                <div className="text-xs text-muted-foreground">Easy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-amber-400">{stats.mediumSolved}</div>
                                <div className="text-xs text-muted-foreground">Medium</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-400">{stats.hardSolved}</div>
                                <div className="text-xs text-muted-foreground">Hard</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Skills */}
                <Card className="border-white/10 bg-background/40">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4" /> Technical Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {skills.map((s: any, i: number) => (
                                <Badge key={i} className={SKILL_COLORS[s.level] || SKILL_COLORS.Beginner}>
                                    {s.name} • {s.level}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-xs text-muted-foreground mr-1">Languages:</span>
                            {(stats.languages || []).map((l: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs border-white/10">{l}</Badge>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs text-muted-foreground mr-1">Tags:</span>
                            {(stats.tags || []).map((t: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-[10px] border-white/10 px-1.5">{t}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Solved Problems */}
                {solvedProblems?.length > 0 && (
                    <Card className="border-white/10 bg-background/40">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4" /> Solved Problems ({solvedProblems.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-2">
                                {solvedProblems.map((p: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg hover:bg-muted/10">
                                        <span className={`text-xs font-bold ${DIFFICULTY_COLORS[p.difficulty]}`}>[{p.difficulty}]</span>
                                        <span className="truncate">{p.title}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageShell>
    );
}
