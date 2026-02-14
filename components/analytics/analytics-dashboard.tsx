"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SKILL_DATA = [
    { subject: 'React', A: 120, B: 110, fullMark: 150 },
    { subject: 'TypeScript', A: 98, B: 130, fullMark: 150 },
    { subject: 'Node.js', A: 86, B: 130, fullMark: 150 },
    { subject: 'Docker', A: 99, B: 100, fullMark: 150 },
    { subject: 'SQL', A: 85, B: 90, fullMark: 150 },
    { subject: 'System Design', A: 65, B: 85, fullMark: 150 },
];

const ROI_DATA = [
    { name: 'Week 1', trainingHours: 10, prReviewTime: 45 },
    { name: 'Week 2', trainingHours: 12, prReviewTime: 38 },
    { name: 'Week 3', trainingHours: 8, prReviewTime: 30 },
    { name: 'Week 4', trainingHours: 15, prReviewTime: 25 },
];

export default function AnalyticsDashboard() {
    const [skillData, setSkillData] = useState(SKILL_DATA);
    const [roiData, setRoiData] = useState(ROI_DATA);
    const [useMock, setUseMock] = useState(false);

    useEffect(() => {
        fetch('/api/analytics/performance')
            .then((r) => r.ok ? r.json() : null)
            .then((d) => {
                if (d) {
                    if (d.skillData?.length) setSkillData(d.skillData);
                    if (d.roiData?.length) setRoiData(d.roiData);
                    setUseMock(d.useMockData ?? false);
                }
            })
            .catch(() => { });
    }, []);

    const [categoryStats, setCategoryStats] = useState<{ name: string, width: string, experts: number }[]>([]);

    useEffect(() => {
        setTimeout(() => {
            setCategoryStats(['Frontend', 'Backend', 'DevOps', 'Mobile', 'AI/ML', 'Security', 'Cloud', 'Data'].map((cat) => ({
                name: cat,
                width: `${Math.floor(Math.random() * 60) + 30}%`,
                experts: Math.floor(Math.random() * 20) + 1
            })));
        }, 0);
    }, []);

    return (
        <div className="space-y-6">
            {useMock && (
                <div className="text-xs p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
                    Using mock analytics data; configure MONGODB_URI for persistence.
                </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Individual Skill Matrix</CardTitle>
                        <CardDescription>Your current proficiency vs Team Avg</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis />
                                <Radar name="You" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Radar name="Team Avg" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>ROI Calculator: Impact of Learning</CardTitle>
                        <CardDescription>Training Hours vs PR Review Time (efficiency gain)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={roiData}>
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Training (hrs)', angle: -90, position: 'insideLeft' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'PR Review (min)', angle: 90, position: 'insideRight' }} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="trainingHours" fill="#8884d8" />
                                <Bar yAxisId="right" dataKey="prReviewTime" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Team Technology Heatmap</CardTitle>
                    <CardDescription>Distribution of skills across the organization</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categoryStats.map((stat) => (
                            <div key={stat.name} className="p-4 border rounded bg-muted/20">
                                <div className="font-semibold mb-2">{stat.name}</div>
                                <div className="h-2 bg-secondary rounded overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: stat.width }} />
                                </div>
                                <div className="text-xs text-right mt-1 text-muted-foreground">{stat.experts} Experts</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
