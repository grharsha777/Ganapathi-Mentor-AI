"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Share2, Users, Lightbulb, AlertTriangle, BookOpen } from 'lucide-react';

export default function TeamCollaboration() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollab = async () => {
            try {
                const res = await fetch('/api/collaboration');
                if (res.ok) {
                    const json = await res.json();
                    if (!json.error) setData(json);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchCollab();
    }, []);

    if (loading) {
        return <div className="animate-pulse text-muted-foreground text-center py-12">Analyzing team knowledge graphs...</div>;
    }

    if (!data) return <div className="text-muted-foreground text-center py-12">Failed to load collaboration data.</div>;

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="h-5 w-5 text-yellow-500" /> Knowledge Silo Detection
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.silo ? (
                        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="font-semibold tracking-tight">
                                Critical Risk: Only 1 person knows &quot;{data.silo.riskTopic}&quot;
                            </AlertTitle>
                            <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <span className="text-sm opacity-90">{data.silo.message}</span>
                                <Button size="sm" variant="destructive" className="shrink-0 shadow-sm">Propose Shadowing</Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert className="bg-muted/50 border-muted">
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>No critical silos detected.</AlertTitle>
                            <AlertDescription>Knowledge is well distributed across the active team.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Skill Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.recommendations?.map((rec: any, i: number) => (
                            <div key={i} className="flex flex-col gap-3 p-4 border rounded-xl bg-card hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border shadow-sm">
                                            <AvatarImage src={rec.user.avatar} />
                                            <AvatarFallback>{rec.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-semibold">{rec.user.name}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <BookOpen className="h-3 w-3" /> Should learn: <span className="font-medium text-foreground">{rec.topic}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={rec.impact === 'High Impact' ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider">
                                        {rec.impact}
                                    </Badge>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                        <span>Readiness</span>
                                        <span>{rec.progress || 0}%</span>
                                    </div>
                                    <Progress value={rec.progress || 0} className="h-1.5" />
                                </div>
                            </div>
                        ))}
                        {(!data.recommendations || data.recommendations.length === 0) && (
                            <div className="text-sm text-muted-foreground text-center py-4">No recommendations available yet.</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Resource Sharing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            Recommended resources based on team activity:
                        </div>
                        <div className="space-y-3">
                            {data.resources?.map((res: any, i: number) => (
                                <div key={i} className="p-3 bg-muted/50 rounded-xl text-sm flex flex-col gap-1 cursor-pointer hover:bg-muted transition-colors border border-transparent hover:border-border">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{res.title}</span>
                                        <Badge variant="outline" className="text-[10px] capitalize">{res.type}</Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        Shared by <span className="font-medium text-foreground">@{res.sharedBy}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
