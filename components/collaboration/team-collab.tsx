"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Users, Lightbulb } from 'lucide-react';

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
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" /> Knowledge Silo Detection
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                {data.silo ? `Critical Risk: Only 1 person knows "${data.silo.riskTopic}"` : "No critical silos detected."}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {data.silo?.message || "Knowledge is well distributed across the active team."}
                            </p>
                        </div>
                        {data.silo && <Button size="sm" variant="secondary">Propose Shadowing</Button>}
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Skill Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.recommendations?.map((rec: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded bg-card">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={rec.user.avatar} />
                                        <AvatarFallback>{rec.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-sm font-medium">{rec.user.name}</div>
                                        <div className="text-xs text-muted-foreground">Should learn: {rec.topic}</div>
                                    </div>
                                </div>
                                <Badge variant="outline">{rec.impact}</Badge>
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
                        <div className="space-y-2">
                            {data.resources?.map((res: any, i: number) => (
                                <div key={i} className="p-2 bg-muted rounded text-sm flex justify-between cursor-pointer hover:bg-muted/80">
                                    <span>{res.title}</span>
                                    <span className="text-xs opacity-70">Shared by @{res.sharedBy}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
