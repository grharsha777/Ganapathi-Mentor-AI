"use client"

import { useState, useEffect } from 'react';
import { useContentStore } from '@/lib/content-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Zap, AlertTriangle, Book, FileText, CheckCircle2, Code, Search as SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { StackExchangeSearch } from '@/components/dev/stack-exchange-search';

interface AnalysisResult {
    summary: string;
    patterns: { name: string; explanation: string; alternatives: string }[];
    complexConcepts: { concept: string; explanation: string; resourceLink: string }[];
    suggestions: string[];
    documentation: string;
}

const LANGUAGES = ['typescript', 'javascript', 'python', 'go', 'rust', 'java', 'csharp', 'php', 'ruby'];

export default function CodeReviewPanel() {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('typescript');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [activeTab, setActiveTab] = useState("analysis");
    const store = useContentStore('code_reviews');

    // Auto-load last review on mount
    useEffect(() => {
        store.load<any>('last_review').then(data => {
            if (data) {
                if (data.code) setCode(data.code);
                if (data.language) setLanguage(data.language);
                if (data.analysis) setAnalysis(data.analysis);
            }
        }).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const analyzeCode = async () => {
        if (!code.trim()) return toast.error("Please enter some code");

        setLoading(true);
        setActiveTab("analysis");
        try {
            const res = await fetch('/api/code-review/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setAnalysis(data.analysis);
            if (data.analysis?.aiDisabled) toast.info('Using rule-based analysis. Configure an LLM API key for AI-powered review.');
            toast.success("Analysis Complete");
            // Auto-save
            store.save('last_review', { code, language, analysis: data.analysis }, `${language} review`).catch(() => { });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[600px]">
            <div className="space-y-4 flex flex-col">
                <Card className="flex-1 flex flex-col border-muted-foreground/20">
                    <CardHeader>
                        <CardTitle>Code Input</CardTitle>
                        <CardDescription>Paste snippet or drag file</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label className="text-sm shrink-0">Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((lang) => (
                                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Textarea
                            placeholder="// Paste your complex code here..."
                            className="flex-1 font-mono text-sm resize-none min-h-[400px]"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <Button onClick={analyzeCode} disabled={loading} className="w-full">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                            {loading ? "Analyzing Logic..." : "Analyze Code"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
                        <TabsTrigger value="stackoverflow">Stack Overflow Search</TabsTrigger>
                    </TabsList>

                    <TabsContent value="analysis" className="flex-1 overflow-hidden data-[state=inactive]:hidden mt-4">
                        {analysis ? (
                            <ScrollArea className="h-full max-h-[800px] w-full pr-4">
                                <div className="space-y-6">

                                    {/* Summary */}
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-blue-500" /> Executive Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
                                        </CardContent>
                                    </Card>

                                    {/* Complex Concepts */}
                                    {analysis.complexConcepts.length > 0 && (
                                        <Card className="border-orange-500/20 bg-orange-500/5">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                                    <AlertTriangle className="h-5 w-5" /> Complex Concepts Detected
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {analysis.complexConcepts.map((c, i) => (
                                                    <div key={i} className="bg-background/80 p-3 rounded-md border text-sm">
                                                        <div className="font-semibold mb-1">{c.concept}</div>
                                                        <div className="text-muted-foreground mb-2">{c.explanation}</div>
                                                        <a href={`https://www.google.com/search?q=${encodeURIComponent(c.resourceLink)}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                            <Book className="h-3 w-3" /> Learn more (3 min read)
                                                        </a>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Patterns */}
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-green-500" /> Best Practices & Patterns
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {analysis.patterns.map((p, i) => (
                                                <div key={i} className="text-sm border-b last:border-0 pb-3 last:pb-0">
                                                    <div className="font-medium flex items-center justify-between">
                                                        {p.name}
                                                        <Badge variant="outline">Pattern</Badge>
                                                    </div>
                                                    <p className="text-muted-foreground mt-1">{p.explanation}</p>
                                                    {p.alternatives !== 'None' && (
                                                        <p className="text-xs text-muted-foreground mt-2 italic">Alternative: {p.alternatives}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    {/* Generated Docs */}
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">Auto-Docs</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
                                                {analysis.documentation}
                                            </pre>
                                        </CardContent>
                                    </Card>

                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[400px] border-2 border-dashed rounded-lg">
                                <Code className="h-12 w-12 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Ready to review</p>
                                <p className="text-sm">Paste your code on the left to get started</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="stackoverflow" className="flex-1 mt-4 h-full">
                        <StackExchangeSearch />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
