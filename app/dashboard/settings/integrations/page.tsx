"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Github, Slack, Calendar, MessageSquare, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function IntegrationsPage() {
    const [githubToken, setGithubToken] = useState('');

    const saveGithub = async () => {
        // In a real app we'd save to /api/integrations
        toast.success("GitHub Token Encrypted & Saved");
    };

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Integrations Hub</h1>
                <p className="text-muted-foreground">Connect your tools to supercharge the AI mentor.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* GitHub */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Github className="h-5 w-5" /> GitHub</CardTitle>
                        <CardDescription>Required for Repo Analysis & Code Review</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Personal Access Token</Label>
                            <Input
                                type="password"
                                placeholder="ghp_xxxxxxxxxxxx"
                                value={githubToken}
                                onChange={e => setGithubToken(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">We encrypt this with AES-256 before storing.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="gh-auto" />
                            <Label htmlFor="gh-auto">Auto-scan new PRs</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={saveGithub}>Connect GitHub</Button>
                    </CardFooter>
                </Card>

                {/* Slack */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Slack className="h-5 w-5" /> Slack</CardTitle>
                        <CardDescription>Get learning nudges in your daily workflow</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded bg-muted/20">
                            <div className="space-y-1">
                                <div className="font-medium">Bot Status</div>
                                <div className="text-xs text-muted-foreground">Not Connected</div>
                            </div>
                            <Button variant="outline" size="sm">Add to Slack</Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="slack-nudge" disabled />
                            <Label htmlFor="slack-nudge">Daily &quot;Micro-Learning&quot; Nudges</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Calendar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Google Calendar</CardTitle>
                        <CardDescription>Auto-schedule learning sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">Sign in with Google</Button>
                    </CardContent>
                </Card>

                {/* Jira */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Jira</CardTitle>
                        <CardDescription>Link learning to sprint tickets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input placeholder="Jira Site URL" className="mb-2" />
                        <Button variant="outline" className="w-full">Connect Jira</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
