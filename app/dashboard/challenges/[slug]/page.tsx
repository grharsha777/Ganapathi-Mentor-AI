"use client"

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft, Send, Loader2, CheckCircle, XCircle, Clock,
    Lightbulb, ChevronDown, ChevronUp, BrainCircuit, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

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
};

const STATUS_STYLES: Record<string, { color: string; icon: any }> = {
    'Accepted': { color: 'text-emerald-400', icon: CheckCircle },
    'Wrong Answer': { color: 'text-red-400', icon: XCircle },
    'Time Limit Exceeded': { color: 'text-amber-400', icon: Clock },
    'Runtime Error': { color: 'text-red-400', icon: XCircle },
    'Compilation Error': { color: 'text-orange-400', icon: XCircle },
    'Pending': { color: 'text-blue-400', icon: Clock },
};

// Simple markdown renderer for AI review output
function RenderMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    return (
        <div className="space-y-2 text-sm leading-relaxed">
            {lines.map((line, i) => {
                if (line.startsWith('## ')) {
                    return <h3 key={i} className="text-base font-bold mt-4 mb-1 text-primary">{line.replace('## ', '')}</h3>;
                }
                if (line.startsWith('### ')) {
                    return <h4 key={i} className="text-sm font-semibold mt-3 mb-1">{line.replace('### ', '')}</h4>;
                }
                if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 list-disc text-muted-foreground">{line.replace('- ', '')}</li>;
                }
                if (line.startsWith('```')) {
                    return null; // Skip code fences for simplicity
                }
                if (line.trim() === '') {
                    return <div key={i} className="h-1" />;
                }
                // Bold text
                const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>');
                // Inline code
                const withCode = formatted.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted/30 text-xs font-mono text-primary">$1</code>');
                return <p key={i} className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: withCode }} />;
            })}
        </div>
    );
}

export default function ChallengeWorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const [challenge, setChallenge] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showHints, setShowHints] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [review, setReview] = useState<string | null>(null);
    const [bottomTab, setBottomTab] = useState('results');

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const res = await fetch(`/api/challenges/${resolvedParams.slug}`);
                const data = await res.json();
                if (data.challenge) {
                    setChallenge(data.challenge);
                    setCode(data.challenge.starterCode?.python || '# Write your solution here\n');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
        <div className="min-h-screen p-4 md:p-6">
            {/* Top bar */}
            <div className="flex items-center gap-4 mb-4">
                <Link href="/dashboard/challenges">
                    <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                </Link>
                <h1 className="text-xl md:text-2xl font-bold flex-1 truncate">{challenge.title}</h1>
                <Badge className={DIFFICULTY_COLORS[challenge.difficulty]}>{challenge.difficulty}</Badge>
            </div>

            {/* Split Pane */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Left: Problem Description */}
                <Card className="border-white/10 bg-background/40 overflow-y-auto max-h-[calc(100vh-180px)]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="border-white/10">{challenge.category}</Badge>
                            <Badge variant="outline" className="border-white/10">{challenge.source}</Badge>
                            {(challenge.tags || []).map((t: string) => (
                                <Badge key={t} variant="outline" className="border-white/10 text-xs">{t}</Badge>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="prose prose-invert prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{challenge.description}</div>
                        </div>

                        {challenge.examples?.map((ex: any, i: number) => (
                            <div key={i} className="bg-muted/20 rounded-lg p-4 border border-white/5">
                                <h4 className="font-semibold text-sm mb-2">Example {i + 1}</h4>
                                <div className="font-mono text-xs space-y-1">
                                    <div><span className="text-muted-foreground">Input:</span> {ex.input}</div>
                                    <div><span className="text-muted-foreground">Output:</span> {ex.output}</div>
                                    {ex.explanation && <div><span className="text-muted-foreground">Explanation:</span> {ex.explanation}</div>}
                                </div>
                            </div>
                        ))}

                        {challenge.constraints && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Constraints</h4>
                                <div className="font-mono text-xs whitespace-pre-wrap text-muted-foreground">{challenge.constraints}</div>
                            </div>
                        )}

                        {challenge.hints?.length > 0 && (
                            <div>
                                <Button variant="ghost" size="sm" onClick={() => setShowHints(!showHints)} className="gap-2 text-amber-400 hover:text-amber-300">
                                    <Lightbulb className="h-4 w-4" />
                                    {showHints ? 'Hide Hints' : 'Show Hints'}
                                    {showHints ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </Button>
                                {showHints && (
                                    <div className="mt-2 space-y-2">
                                        {challenge.hints.map((h: string, i: number) => (
                                            <div key={i} className="text-sm text-amber-300/80 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">💡 {h}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right: Code Editor + Results/Review */}
                <div className="flex flex-col gap-3 min-h-0">
                    {/* Editor Toolbar */}
                    <div className="flex items-center justify-between gap-2">
                        <Select value={language} onValueChange={handleLanguageChange}>
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
                        <div className="flex gap-2">
                            <Button
                                onClick={handleAIReview}
                                disabled={reviewing || !code}
                                variant="outline"
                                className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:text-violet-200"
                            >
                                {reviewing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BrainCircuit className="h-4 w-4 mr-2" />}
                                AI Review
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 font-semibold"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                Submit
                            </Button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <Card className="border-white/10 overflow-hidden min-h-[280px] flex-1">
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
                                roundedSelection: true,
                                automaticLayout: true,
                            }}
                        />
                    </Card>

                    {/* Bottom Panel: Results + AI Review Tabs */}
                    <Card className="border-white/10 bg-background/40 max-h-[300px] overflow-hidden">
                        <Tabs value={bottomTab} onValueChange={setBottomTab}>
                            <div className="px-4 pt-3 pb-0">
                                <TabsList className="bg-black/20 border border-white/10">
                                    <TabsTrigger value="results" className="data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1.5" /> Test Results
                                    </TabsTrigger>
                                    <TabsTrigger value="review" className="data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-400 text-xs">
                                        <BrainCircuit className="h-3 w-3 mr-1.5" /> AI Review
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="results" className="px-4 pb-4 pt-2 overflow-y-auto max-h-[230px]">
                                {result && statusInfo ? (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`flex items-center gap-2 font-bold text-lg ${statusInfo.color}`}>
                                                <statusInfo.icon className="h-5 w-5" />
                                                {result.status}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                {result.passed_tests !== undefined && <span>Tests: {result.passed_tests}/{result.total_tests}</span>}
                                                {result.runtime_ms > 0 && <span>⏱ {result.runtime_ms}ms</span>}
                                                {result.memory_kb > 0 && <span>💾 {Math.round(result.memory_kb / 1024 * 100) / 100}MB</span>}
                                            </div>
                                        </div>
                                        {result.output && (
                                            <pre className="text-xs font-mono bg-muted/20 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap border border-white/5">{result.output}</pre>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground text-center py-8">
                                        <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        Submit your code to see test results here.
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="review" className="px-4 pb-4 pt-2 overflow-y-auto max-h-[230px]">
                                {reviewing ? (
                                    <div className="flex items-center justify-center py-10 gap-3">
                                        <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                                        <span className="text-sm text-muted-foreground">Ganapathi AI is analyzing your code...</span>
                                    </div>
                                ) : review ? (
                                    <RenderMarkdown content={review} />
                                ) : (
                                    <div className="text-sm text-muted-foreground text-center py-8">
                                        <BrainCircuit className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        Click <strong>AI Review</strong> to get expert feedback on your code.
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </Card>
                </div>
            </div>
        </div>
    );
}
