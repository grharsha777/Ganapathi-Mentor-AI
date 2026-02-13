"use client"

import { useState, useEffect } from 'react';
import { useContentStore } from '@/lib/content-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, ListTodo, CalendarClock, TrendingUp, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductivityHub() {
    const [tasksInput, setTasksInput] = useState('');
    const [agendaInput, setAgendaInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [prioritizedTasks, setPrioritizedTasks] = useState<any[] | null>(null);
    const [agenda, setAgenda] = useState<any | null>(null);
    const store = useContentStore('productivity');

    // Auto-load on mount
    useEffect(() => {
        store.load<any>('last_productivity').then(data => {
            if (data) {
                if (data.tasksInput) setTasksInput(data.tasksInput);
                if (data.agendaInput) setAgendaInput(data.agendaInput);
                if (data.prioritizedTasks) setPrioritizedTasks(data.prioritizedTasks);
                if (data.agenda) setAgenda(data.agenda);
            }
        }).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const str = (i: number) => i.toString();

    const handlePrioritize = async () => {
        if (!tasksInput.trim()) return toast.error("Enter tasks first");
        setLoading(true);
        try {
            const tasks = tasksInput.split('\n').filter(t => t.trim()).map((t, i) => ({ id: str(i), title: t }));
            const res = await fetch('/api/productivity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'prioritize', inputData: tasks })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to prioritize');
            const result = data.result?.prioritizedTasks || [];
            setPrioritizedTasks(result);
            toast.success("Tasks prioritized!");
            // Auto-save
            store.save('last_productivity', { tasksInput, agendaInput, prioritizedTasks: result, agenda }, 'tasks').catch(() => { });
        } catch (e: any) {
            toast.error(e.message || "Failed to prioritize tasks");
        }
        setLoading(false);
    };

    const handleAgenda = async () => {
        if (!agendaInput.trim()) return toast.error("Enter context first");
        setLoading(true);
        try {
            const res = await fetch('/api/productivity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'agenda', inputData: agendaInput })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to build agenda');
            const result = data.result;
            setAgenda(result);
            toast.success("Agenda created!");
            // Auto-save
            store.save('last_productivity', { tasksInput, agendaInput, prioritizedTasks, agenda: result }, 'agenda').catch(() => { });
        } catch (e: any) {
            toast.error(e.message || "Failed to build agenda");
        }
        setLoading(false);
    };

    return (
        <div className="grid gap-6">
            <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-sm">
                    <TabsTrigger value="tasks">Smart Prioritization</TabsTrigger>
                    <TabsTrigger value="agenda">Agenda Builder</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="mt-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Input Tasks</CardTitle><CardDescription>One per line</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    value={tasksInput}
                                    onChange={e => setTasksInput(e.target.value)}
                                    placeholder="Fix login bug&#10;Update documentation&#10;Deploy to prod"
                                    className="min-h-[200px]"
                                />
                                <Button onClick={handlePrioritize} disabled={loading} className="w-full">
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : <ListTodo className="mr-2" />} Prioritize
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>AI Schedule</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {prioritizedTasks ? (
                                    <div className="space-y-3">
                                        {prioritizedTasks.map((t: any, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:shadow-sm transition-all">
                                                <Badge className={t.priority === 'High' ? 'bg-red-500' : t.priority === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'}>
                                                    {t.priority}
                                                </Badge>
                                                <div>
                                                    <div className="font-medium">{t.title}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">{t.reasoning}</div>
                                                </div>
                                                <div className="ml-auto text-xs font-bold text-muted-foreground">{t.score}pts</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed rounded-lg">
                                        <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
                                        Priority Matrix Empty
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="agenda" className="mt-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Context / Discussions</CardTitle><CardDescription>Paste threads or ticket summaries</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    value={agendaInput}
                                    onChange={e => setAgendaInput(e.target.value)}
                                    placeholder="Team is discussing the new API migration. John thinks we should use GraphQL but Sarah prefers REST..."
                                    className="min-h-[200px]"
                                />
                                <Button onClick={handleAgenda} disabled={loading} className="w-full">
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : <CalendarClock className="mr-2" />} Build Agenda
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Meeting Plan</CardTitle></CardHeader>
                            <CardContent>
                                {agenda ? (
                                    <div className="space-y-4">
                                        <div className="font-medium text-lg">{agenda.summary}</div>
                                        <div className="space-y-2">
                                            {agenda.agendaItems.map((item: any, i: number) => (
                                                <div key={i} className="flex gap-4 p-3 border-b last:border-0">
                                                    <div className="font-mono text-sm text-muted-foreground min-w-[3rem]">{item.durationMinutes}m</div>
                                                    <div>
                                                        <div className="font-semibold">{item.topic}</div>
                                                        <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                                                            {item.talkingPoints.map((tp: string, j: number) => <li key={j}>{tp}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-right text-sm font-bold text-primary">Total: {agenda.totalDuration} min</div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed rounded-lg">
                                        <CalendarClock className="h-8 w-8 mb-2 opacity-20" />
                                        Ready to Plan
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
