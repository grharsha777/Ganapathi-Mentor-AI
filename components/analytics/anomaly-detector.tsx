"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, TrendingUp, Users, Activity, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AnomalyDetector() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnomalies = async () => {
        try {
            const res = await fetch('/api/analytics/anomalies');
            if (!res.ok) throw new Error('Failed');
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error(e);
            setData({
                teamVelocity: { current: 0, previous: 0 },
                anomalies: [],
                predictions: [],
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnomalies();
        // Simulate real-time polling
        const interval = setInterval(fetchAnomalies, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-muted-foreground">Loading Intelligence...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>Failed to load data.</p>
            </div>
        );
    }

    const { teamVelocity = { current: 0, previous: 0 }, anomalies = [], predictions = [], useMockData } = data;

    return (
        <div className="space-y-4">
            {useMockData && (
                <div className="text-xs p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
                    Using mock analytics data; configure MONGODB_URI for persistence.
                </div>
            )}
        <div className="grid gap-6 md:grid-cols-2">
            {/* Velocity Card */}
            <Card className="md:col-span-1 border-t-4 border-t-blue-500">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Team Pulse
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription>Learning velocity tracking</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <div className="text-4xl font-bold">{teamVelocity.current}h</div>
                            <div className="text-xs text-muted-foreground">Logged this week</div>
                        </div>
                        <div className="flex items-center text-red-500 text-sm font-medium">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            35% vs Last Week
                        </div>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[60%]" />
                    </div>
                </CardContent>
            </Card>

            {/* Anomalies List */}
            <div className="space-y-4 md:col-span-1">
                {anomalies.map((alert: any, i: number) => (
                    <Alert key={i} variant={alert.severity === 'high' ? 'destructive' : 'default'} className="bg-background border-l-4 border-l-red-500">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="ml-2 font-bold">{alert.severity.toUpperCase()} ALERT</AlertTitle>
                        <AlertDescription className="ml-2 mt-2">
                            <p>{alert.message}</p>
                            <div className="mt-2 text-xs bg-muted/50 p-2 rounded flex items-center justify-between">
                                <span>💡 {alert.recommendation}</span>
                                <Button variant="link" size="sm" className="h-auto p-0"><ExternalLink className="h-3 w-3" /></Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                ))}
            </div>

            {/* Predictions */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg">AI Performance Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {predictions.map((p: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-4 border rounded-lg bg-orange-500/5 border-orange-200 dark:border-orange-900">
                                <TrendingUp className="h-5 w-5 text-orange-500 mt-1" />
                                <div>
                                    <div className="font-semibold text-orange-700 dark:text-orange-400">{p.prediction}</div>
                                    <div className="text-sm font-medium mt-1">{p.topic}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{p.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
        </div>
    );
}
