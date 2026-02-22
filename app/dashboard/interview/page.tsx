"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import {
    Mic, Send, Loader2, Timer, Play, FileText,
    BrainCircuit, Trophy, Sparkles, ArrowRight
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANG_MAP: Record<string, string> = { python: 'python', javascript: 'javascript', cpp: 'cpp', java: 'java' };

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Simple markdown renderer
function RenderMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    return (
        <div className="space-y-1.5 text-sm leading-relaxed">
            {lines.map((line, i) => {
                if (line.startsWith('## ')) return <h3 key={i} className="text-base font-bold mt-3 mb-1 text-primary">{line.replace('## ', '')}</h3>;
                if (line.startsWith('### ')) return <h4 key={i} className="text-sm font-semibold mt-2 mb-1">{line.replace('### ', '')}</h4>;
                if (line.startsWith('| ')) {
                    const cells = line.split('|').filter(Boolean).map(c => c.trim());
                    return (
                        <div key={i} className="grid grid-cols-3 gap-2 text-xs font-mono border-b border-white/5 py-1">
                            {cells.map((c, ci) => <span key={ci} className={ci === 0 ? 'font-semibold' : ''}>{c}</span>)}
                        </div>
                    );
                }
                if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-muted-foreground text-sm">{line.replace('- ', '')}</li>;
                if (line.trim() === '') return <div key={i} className="h-1" />;
                const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>');
                const withCode = formatted.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted/30 text-xs font-mono text-primary">$1</code>');
                return <p key={i} className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: withCode }} />;
            })}
        </div>
    );
}

type InterviewState = 'setup' | 'active' | 'report';
type Message = { role: 'user' | 'assistant'; content: string };

export default function InterviewPage() {
    const [state, setState] = useState<InterviewState>('setup');
    const [difficulty, setDifficulty] = useState('Medium');
    const [challenge, setChallenge] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(1800); // 30 minutes
    const [timerActive, setTimerActive] = useState(false);
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [report, setReport] = useState<string | null>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Timer countdown
    useEffect(() => {
        if (!timerActive || timer <= 0) return;
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timerActive, timer]);

    // Auto-scroll chat
    const prevMessageCountRef = useRef(0);
    useEffect(() => {
        if (messages.length > prevMessageCountRef.current) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            prevMessageCountRef.current = messages.length;
        }
    }, [messages]);

    const startInterview = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start', difficulty }),
            });
            const data = await res.json();
            if (data.challenge) {
                setChallenge(data.challenge);
                setCode(data.challenge.starterCode?.python || '');
                setMessages([{ role: 'assistant', content: data.interviewerMessage }]);
                setState('active');
                setTimerActive(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessages: Message[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        try {
            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'chat', messages: newMessages }),
            });
            const data = await res.json();
            setMessages([...newMessages, { role: 'assistant', content: data.interviewerMessage }]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const submitCode = async () => {
        setLoading(true);
        const submitMsg: Message = { role: 'user', content: `[Submitted ${language} code]\n\`\`\`${language}\n${code}\n\`\`\`` };
        const newMessages: Message[] = [...messages, submitMsg];
        setMessages(newMessages);
        try {
            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'submit_code', messages: newMessages, code, language }),
            });
            const data = await res.json();
            setMessages([...newMessages, { role: 'assistant', content: data.interviewerMessage }]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        setReportLoading(true);
        setTimerActive(false);
        try {
            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'report', messages }),
            });
            const data = await res.json();
            setReport(data.report);
            setState('report');
        } catch (e) {
            console.error(e);
        } finally {
            setReportLoading(false);
        }
    };

    // ─── Setup Screen ────────────────────────────────────────────────
    if (state === 'setup') {
        return (
            <PageShell>
                <PageHeader title="Mock Interview" description="Simulate a real FAANG-level technical interview with Ganapathi AI." icon={Mic} />
                <div className="max-w-lg mx-auto mt-8">
                    <Card className="border-white/10 bg-background/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5 text-violet-400" />
                                Configure Interview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger className="bg-background/50 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy (20 min)</SelectItem>
                                        <SelectItem value="Medium">Medium (30 min)</SelectItem>
                                        <SelectItem value="Hard">Hard (45 min)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4 text-sm text-violet-300">
                                <p className="font-semibold mb-1">🎯 How it works:</p>
                                <ul className="space-y-1 text-xs text-muted-foreground">
                                    <li>• AI selects a random problem and presents it like a real interviewer</li>
                                    <li>• Discuss your approach before coding</li>
                                    <li>• Write and submit your solution in the editor</li>
                                    <li>• AI asks follow-up questions on complexity and optimization</li>
                                    <li>• Get a detailed Interview Report Card with scores</li>
                                </ul>
                            </div>
                            <Button
                                onClick={() => {
                                    setTimer(difficulty === 'Easy' ? 1200 : difficulty === 'Hard' ? 2700 : 1800);
                                    startInterview();
                                }}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 font-bold text-base py-6"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                                Start Interview
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </PageShell>
        );
    }

    // ─── Report Screen ───────────────────────────────────────────────
    if (state === 'report' && report) {
        return (
            <PageShell>
                <PageHeader title="Interview Complete" description="Here's your performance breakdown." icon={Trophy} />
                <div className="max-w-2xl mx-auto mt-6">
                    <Card className="border-white/10 bg-background/40">
                        <CardContent className="p-6">
                            <RenderMarkdown content={report} />
                        </CardContent>
                    </Card>
                    <div className="flex gap-4 mt-6 justify-center">
                        <Button variant="outline" onClick={() => { setState('setup'); setMessages([]); setReport(null); setChallenge(null); }}>
                            New Interview
                        </Button>
                        <Button onClick={() => setState('active')} variant="outline">
                            Review Conversation
                        </Button>
                    </div>
                </div>
            </PageShell>
        );
    }

    // ─── Active Interview ────────────────────────────────────────────
    return (
        <div className="min-h-screen p-4 md:p-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Mic className="h-5 w-5 text-violet-400" />
                    <h1 className="text-lg font-bold truncate">{challenge?.title || 'Mock Interview'}</h1>
                    <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/30">{challenge?.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${timer < 300 ? 'bg-red-500/15 text-red-400 animate-pulse' : 'bg-muted/20 text-muted-foreground'}`}>
                        <Timer className="h-4 w-4" />
                        {formatTime(timer)}
                    </div>
                    <Button
                        onClick={generateReport}
                        disabled={reportLoading}
                        variant="outline"
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                        {reportLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                        End & Get Report
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-160px)]">
                {/* Left: Chat */}
                <Card className="border-white/10 bg-background/40 flex flex-col overflow-hidden">
                    <CardHeader className="pb-2 border-b border-white/5">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4 text-violet-400" />
                            Interview Conversation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${m.role === 'user'
                                    ? 'bg-primary/15 border border-primary/20 text-foreground'
                                    : 'bg-violet-500/10 border border-violet-500/20 text-foreground'
                                    }`}>
                                    {m.role === 'assistant' ? <RenderMarkdown content={m.content} /> : (
                                        <pre className="whitespace-pre-wrap font-sans text-sm">{m.content}</pre>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-violet-500/10 border border-violet-500/20 p-3 rounded-xl">
                                    <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </CardContent>
                    <div className="p-3 border-t border-white/5 flex gap-2">
                        <Input
                            placeholder="Discuss your approach..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
                            className="bg-background/50 border-white/10"
                        />
                        <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon" className="shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>

                {/* Right: Code Editor */}
                <div className="flex flex-col gap-3 min-h-0">
                    <div className="flex items-center justify-between gap-2">
                        <Select value={language} onValueChange={(v) => {
                            setLanguage(v);
                            if (challenge?.starterCode?.[v]) setCode(challenge.starterCode[v]);
                        }}>
                            <SelectTrigger className="w-[140px] bg-background/50 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={submitCode}
                            disabled={loading || !code}
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 font-semibold"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Submit to Interviewer
                        </Button>
                    </div>
                    <Card className="flex-1 border-white/10 overflow-hidden min-h-[300px]">
                        <MonacoEditor
                            height="100%"
                            language={LANG_MAP[language] || 'python'}
                            theme="vs-dark"
                            value={code}
                            onChange={(v) => setCode(v || '')}
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                padding: { top: 16, bottom: 16 },
                                lineNumbers: 'on',
                                automaticLayout: true,
                            }}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}
