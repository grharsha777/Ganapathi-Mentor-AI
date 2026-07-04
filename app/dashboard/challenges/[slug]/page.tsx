"use client"

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    ArrowLeft, Send, Loader2, CheckCircle, XCircle, Clock,
    Lightbulb, ChevronDown, ChevronUp, BrainCircuit, Sparkles, MessagesSquare, Users, Award, FileWarning
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
import { 
    PanelGroup, 
    Panel, 
    PanelResizeHandle 
} from 'react-resizable-panels';

const DIFFICULTY_COLORS: Record<string, string> = {
    Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Hard: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const LANG_MAP: Record<string, string> = {
    python: 'python',
    javascript: 'javascript',
    cpp: 'cpp',
    java: 'java',
    sql: 'sql'
};

const STATUS_STYLES: Record<string, { color: string; icon: any }> = {
    'Accepted': { color: 'text-emerald-400', icon: CheckCircle },
    'Wrong Answer': { color: 'text-red-400', icon: XCircle },
    'Time Limit Exceeded': { color: 'text-amber-400', icon: Clock },
    'Runtime Error': { color: 'text-red-400', icon: XCircle },
    'Compilation Error': { color: 'text-orange-400', icon: XCircle },
    'Pending': { color: 'text-blue-400', icon: Clock },
};

function RenderMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    return (
        <div className="space-y-2 text-sm leading-relaxed">
            {lines.map((line, i) => {
                if (line.startsWith('## ')) return <h3 key={i} className="text-base font-bold mt-4 mb-1 text-primary">{line.replace('## ', '')}</h3>;
                if (line.startsWith('### ')) return <h4 key={i} className="text-sm font-semibold mt-3 mb-1">{line.replace('### ', '')}</h4>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-muted-foreground">{line.replace('- ', '')}</li>;
                if (line.startsWith('```')) return null;
                if (line.trim() === '') return <div key={i} className="h-1" />;
                const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>');
                const withCode = formatted.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted/30 text-xs font-mono text-primary">$1</code>');
                return <p key={i} className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: withCode }} />;
            })}
        </div>
    );
}

export default function ChallengeWorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const [challenge, setChallenge] = useState<any>(null);
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Editor State
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    
    // AI Review State
    const [reviewing, setReviewing] = useState(false);
    const [review, setReview] = useState<string | null>(null);
    
    // UI Tabs State
    const [bottomTab, setBottomTab] = useState('results');
    const [leftPaneTab, setLeftPaneTab] = useState('problem');
    const [showHints, setShowHints] = useState(false);

    // Discussion Input State
    const [newComment, setNewComment] = useState('');
    const [postLoading, setPostLoading] = useState(false);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const res = await fetch(`/api/challenges/${resolvedParams.slug}`);
                const data = await res.json();
                if (data.challenge) {
                    setChallenge(data.challenge);
                    // Determine default language based on category/hints (e.g. SQL category defaults to sql if code exists)
                    let defLang = 'python';
                    if (data.challenge.category === 'SQL' && data.challenge.starterCode?.sql) defLang = 'sql';
                    setLanguage(defLang);
                    setCode(data.challenge.starterCode?.[defLang] || '# Write your solution here\n');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        const fetchDiscussions = async () => {
            try {
                const res = await fetch(`/api/challenges/${resolvedParams.slug}/discussions`);
                const data = await res.json();
                if (data.discussions) setDiscussions(data.discussions);
            } catch(e) {
               console.error(e); 
            }
        };

        fetchChallenge();
        fetchDiscussions();
    }, [resolvedParams.slug]);

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        if (challenge?.starterCode?.[lang]) {
            setCode(challenge.starterCode[lang]);
        }
    };

    const handleSubmit = async () => {
        if (!challenge) return;
        setSubmitting(true);
        setResult(null);
        setBottomTab('results');
        
        // Mock checking for SQL/Pandas to simulate backend since this is UI first
        if (challenge.category === 'SQL' || challenge.category === 'Pandas') {
             setTimeout(() => {
                 setResult({ status: 'Accepted', passed_tests: 3, total_tests: 3, runtime_ms: 12, memory_kb: 4096, output: 'Success: Simulated Database/Pandas execution.' });
                 setSubmitting(false);
             }, 1500);
             return;
        }

        try {
            const res = await fetch('/api/challenges/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengeId: challenge._id, language, code }),
            });
            const data = await res.json();
            setResult(data.submission || data);
        } catch (e: any) {
            setResult({ status: 'Runtime Error', output: e.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleAIReview = async () => {
        if (!challenge || !code) return;
        setReviewing(true);
        setReview(null);
        setBottomTab('review');
        try {
            const res = await fetch('/api/challenges/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    problemTitle: challenge.title,
                    problemDescription: challenge.description,
                }),
            });
            const data = await res.json();
            setReview(data.review || data.error || 'No review generated.');
        } catch (e: any) {
            setReview(`Error: ${e.message}`);
        } finally {
            setReviewing(false);
        }
    };

    const handlePostDiscussion = async () => {
        if (!newComment.trim()) return;
        setPostLoading(true);
        try {
            const res = await fetch(`/api/challenges/${resolvedParams.slug}/discussions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment, isMentor: false })
            });
            const data = await res.json();
            if (data.discussion) {
                setDiscussions([data.discussion, ...discussions]);
                setNewComment('');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setPostLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <h2 className="text-xl font-bold">Challenge not found</h2>
                <Link href="/dashboard/challenges">
                    <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Challenges</Button>
                </Link>
            </div>
        );
    }

    const statusInfo = result ? STATUS_STYLES[result.status] || STATUS_STYLES['Pending'] : null;

    return (
        <div className="min-h-screen p-4 md:p-6 bg-black text-white">
            {/* Top bar */}
            <div className="flex items-center gap-4 mb-4">
                <Link href="/dashboard/challenges">
                    <Button variant="ghost" size="sm" className="hover:bg-white/10"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                </Link>
                <h1 className="text-xl md:text-2xl font-bold flex-1 truncate">{challenge.title}</h1>
                
                {challenge.bonusLinks && challenge.bonusLinks.length > 0 && (
                    <div className="hidden md:flex gap-2 mr-2">
                        {challenge.bonusLinks.map((link: any, i: number) => (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">
                                <Badge variant="outline" className="border-violet-500/40 text-violet-300 hover:bg-violet-500/10 cursor-pointer transition-colors px-3 py-1">
                                    <Sparkles className="h-3 w-3 mr-1" /> {link.label}
                                </Badge>
                            </a>
                        ))}
                    </div>
                )}
                
                <Badge className={DIFFICULTY_COLORS[challenge.difficulty]}>{challenge.difficulty}</Badge>
            </div>

            {/* Pro-Grade Resizable Layout */}
            <div className="h-[calc(100vh-120px)] w-full overflow-hidden">
                <PanelGroup direction="horizontal" className="h-full">
                    
                    {/* Left Pane: Information */}
                    <Panel defaultSize={40} minSize={25} className="h-full">
                        <Card className="border-white/10 bg-black/40 overflow-hidden flex flex-col h-full shadow-2xl">
                            <Tabs value={leftPaneTab} onValueChange={setLeftPaneTab} className="flex flex-col h-full">
                                <div className="border-b border-white/10 px-4 pt-4 pb-0 bg-white/[0.02]">
                                    <TabsList className="bg-transparent border-0 w-full justify-start gap-4">
                                        <TabsTrigger value="problem" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground rounded-b-none pb-3 border-b-2 border-transparent data-[state=active]:border-violet-500 px-1">
                                            Problem
                                        </TabsTrigger>
                                        {challenge.mentorInsights && (
                                            <TabsTrigger value="mentor" className="data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-300 text-muted-foreground rounded-b-none pb-3 border-b-2 border-transparent data-[state=active]:border-violet-500 px-1 gap-1.5">
                                                <Award className="h-4 w-4" /> Mentor Notes
                                            </TabsTrigger>
                                        )}
                                        <TabsTrigger value="community" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-300 text-muted-foreground rounded-b-none pb-3 border-b-2 border-transparent data-[state=active]:border-blue-500 px-1 gap-1.5">
                                            <Users className="h-4 w-4" /> Community
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* Problem Tab Content */}
                                <TabsContent value="problem" className="flex-1 overflow-y-auto p-6 m-0 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="border-white/10 bg-white/5">{challenge.category}</Badge>
                                            <Badge variant="outline" className="border-white/10 bg-white/5">{challenge.source}</Badge>
                                            {(challenge.tags || []).map((t: string) => (
                                                <Badge key={t} variant="outline" className="border-white/10 text-xs bg-white/5">#{t}</Badge>
                                            ))}
                                        </div>
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-300">
                                                <RenderMarkdown content={challenge.description} />
                                            </div>
                                        </div>

                                        {challenge.examples?.map((ex: any, i: number) => (
                                            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 shadow-inner">
                                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-violet-300">Example {i + 1}</h4>
                                                <div className="font-mono text-xs space-y-2 text-gray-300">
                                                    <div><span className="text-white/50 inline-block w-16">Input:</span> <span className="font-bold">{ex.input}</span></div>
                                                    <div><span className="text-white/50 inline-block w-16">Output:</span> <span className="font-bold">{ex.output}</span></div>
                                                    {ex.explanation && <div className="pt-2 mt-2 border-t border-white/10"><span className="text-white/50">Explanation:</span> {ex.explanation}</div>}
                                                </div>
                                            </div>
                                        ))}

                                        {challenge.hints?.length > 0 && (
                                            <div className="pt-4 mt-4 border-t border-white/10">
                                                <Button variant="ghost" size="sm" onClick={() => setShowHints(!showHints)} className="gap-2 text-amber-500 max-w-min hover:bg-amber-500/10 hover:text-amber-400">
                                                    <Lightbulb className="h-4 w-4" />
                                                    {showHints ? 'Hide Hints' : 'Show Hints'}
                                                    {showHints ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                </Button>
                                                {showHints && (
                                                    <div className="mt-4 space-y-3">
                                                        {challenge.hints.map((h: string, i: number) => (
                                                            <div key={i} className="text-sm text-amber-200/90 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex gap-3">
                                                                <span className="text-lg leading-none">💡</span> 
                                                                <span>{h}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="mentor" className="flex-1 overflow-y-auto p-6 m-0 bg-gradient-to-b from-violet-950/20 to-black/40">
                                    {/* Mentor content same as before but inside panel */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                            <div className="p-3 bg-violet-500/20 text-violet-400 rounded-xl border border-violet-500/30">
                                                <Award className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-lg font-bold">Expert Notes</h3>
                                        </div>
                                        <p className="text-sm text-gray-400 italic">"{challenge.mentorInsights?.recruiterNotes}"</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="community" className="flex-1 overflow-hidden m-0">
                                    {/* Community feed inside panel */}
                                    <div className="p-4 h-full flex flex-col">
                                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                            {discussions.map((d: any) => (
                                                <div key={d._id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                    <p className="text-xs font-bold text-violet-300 mb-1">{d.author}</p>
                                                    <p className="text-sm text-gray-300">{d.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </Card>
                    </Panel>

                    <PanelResizeHandle className="w-1.5 bg-black hover:bg-violet-500/40 transition-colors cursor-col-resize flex items-center justify-center">
                        <div className="h-8 w-px bg-white/20" />
                    </PanelResizeHandle>

                    {/* Right Pane: Code + Console */}
                    <Panel defaultSize={60} minSize={30}>
                        <PanelGroup direction="vertical">
                            <Panel defaultSize={70} minSize={30}>
                                <div className="flex flex-col h-full gap-2 pl-1">
                                    <div className="flex items-center justify-between bg-white/[0.04] p-2 rounded-xl border border-white/10">
                                        <Select value={language} onValueChange={handleLanguageChange}>
                                            <SelectTrigger className="w-32 bg-black/40 h-8 text-xs border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="python">Python</SelectItem>
                                                <SelectItem value="javascript">JavaScript</SelectItem>
                                                <SelectItem value="sql">SQL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={handleAIReview} className="text-violet-400 h-8 text-xs gap-1.5">
                                                <BrainCircuit className="h-3.5 w-3.5" /> AI Review
                                            </Button>
                                            <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 h-8 text-xs px-4 font-bold shadow-lg shadow-emerald-500/20">
                                                <Send className="h-3.5 w-3.5 mr-2" /> Run Arena
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 rounded-xl overflow-hidden border border-white/10 shadow-inner bg-[#1e1e1e]">
                                        <MonacoEditor
                                            height="100%"
                                            language={LANG_MAP[language]}
                                            theme="vs-dark"
                                            value={code}
                                            onChange={(v: string | undefined) => setCode(v || '')}
                                            options={{
                                                fontSize: 14,
                                                minimap: { enabled: false },
                                                padding: { top: 16 },
                                                smoothScrolling: true,
                                                cursorBlinking: 'smooth',
                                                fontFamily: "'JetBrains Mono', monospace",
                                            }}
                                        />
                                    </div>
                                </div>
                            </Panel>

                            <PanelResizeHandle className="h-1.5 bg-black hover:bg-emerald-500/40 transition-colors cursor-row-resize flex items-center justify-center">
                                <div className="w-8 h-px bg-white/20" />
                            </PanelResizeHandle>

                            <Panel defaultSize={30} minSize={10}>
                                <Card className="h-full border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden flex flex-col ml-1">
                                    <Tabs value={bottomTab} onValueChange={setBottomTab} className="flex flex-col h-full">
                                        <TabsList className="bg-white/5 border-b border-white/10 w-full justify-start rounded-none h-10 px-4">
                                            <TabsTrigger value="results" className="text-xs h-7 gap-2">Terminal</TabsTrigger>
                                            <TabsTrigger value="review" className="text-xs h-7 gap-2">AI Insights</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="results" className="flex-1 overflow-y-auto p-4 m-0 font-mono text-sm">
                                            {submitting ? (
                                                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-60">
                                                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                                                    <p className="text-xs animate-pulse">Running Neural Arena Tests...</p>
                                                </div>
                                            ) : result ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between border-l-4 border-emerald-500 pl-4 bg-emerald-500/5 py-2">
                                                        <span className="font-black text-emerald-400">STATUS: {result.status}</span>
                                                        <span className="text-xs text-gray-500">{result.runtime_ms}ms</span>
                                                    </div>
                                                    <pre className="text-gray-400 whitespace-pre-wrap">{result.output}</pre>
                                                </div>
                                            ) : (
                                                <p className="text-gray-600 text-xs italic">Ready for execution. Awaiting input...</p>
                                            )}
                                        </TabsContent>
                                        <TabsContent value="review" className="flex-1 overflow-y-auto p-4 m-0">
                                            {reviewing ? <Loader2 className="animate-spin mx-auto mt-10" /> : <RenderMarkdown content={review || "Deploy AI for code analysis."} />}
                                        </TabsContent>
                                    </Tabs>
                                </Card>
                            </Panel>
                        </PanelGroup>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}
