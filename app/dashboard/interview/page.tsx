"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
import {
    Mic, Send, Loader2, Timer, Play, FileText,
    BrainCircuit, Trophy, Sparkles, ArrowRight, Search,
    Code2, BookOpen, Calculator, Globe, Cpu, Database,
    Cloud, Shield, Layers, Zap, Star, Target,
    ChevronRight, RotateCcw, CheckCircle2, XCircle, TrendingUp,
    Building2, GraduationCap
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANG_MAP: Record<string, string> = { python: 'python', javascript: 'javascript', cpp: 'cpp', java: 'java' };

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ─── COMPANY PRESETS ────────────────────────────────────────────────────────
const COMPANY_PRESETS = [
    { name: 'Google', icon: '🔍', color: 'from-blue-500 to-green-500', focus: 'Algorithms & System Design', style: 'google' },
    { name: 'Microsoft', icon: '🪟', color: 'from-blue-600 to-cyan-500', focus: 'Problem Solving & OOP', style: 'microsoft' },
    { name: 'Meta', icon: '🌐', color: 'from-blue-500 to-indigo-600', focus: 'Frontend & Scalability', style: 'meta' },
    { name: 'Amazon', icon: '📦', color: 'from-orange-500 to-yellow-500', focus: 'Leadership & System Design', style: 'amazon' },
    { name: 'Apple', icon: '🍎', color: 'from-gray-400 to-gray-600', focus: 'Design & Performance', style: 'apple' },
    { name: 'Netflix', icon: '🎬', color: 'from-red-600 to-red-800', focus: 'Microservices & Data', style: 'netflix' },
];

// ─── INTERVIEW CATEGORIES ───────────────────────────────────────────────────
const INTERVIEW_CATEGORIES = [
    { label: 'React', icon: '⚛️', color: 'from-cyan-500 to-blue-500', group: 'tech' },
    { label: 'Python', icon: '🐍', color: 'from-yellow-400 to-green-500', group: 'tech' },
    { label: 'JavaScript', icon: '🟨', color: 'from-yellow-400 to-yellow-600', group: 'tech' },
    { label: 'Java', icon: '☕', color: 'from-red-500 to-orange-500', group: 'tech' },
    { label: 'C++', icon: '⚡', color: 'from-blue-600 to-indigo-700', group: 'tech' },
    { label: 'TypeScript', icon: '🔷', color: 'from-blue-500 to-indigo-600', group: 'tech' },
    { label: 'System Design', icon: '🏗️', color: 'from-purple-500 to-pink-500', group: 'tech' },
    { label: 'Data Structures', icon: '🌲', color: 'from-emerald-500 to-teal-600', group: 'tech' },
    { label: 'Algorithms', icon: '🧮', color: 'from-rose-500 to-red-600', group: 'tech' },
    { label: 'SQL & Databases', icon: '🗄️', color: 'from-blue-600 to-indigo-700', group: 'tech' },
    { label: 'Machine Learning', icon: '🤖', color: 'from-violet-500 to-purple-600', group: 'tech' },
    { label: 'Cloud & DevOps', icon: '☁️', color: 'from-sky-400 to-blue-600', group: 'tech' },
    { label: 'Cybersecurity', icon: '🛡️', color: 'from-green-600 to-emerald-700', group: 'tech' },
    { label: 'Node.js', icon: '🟢', color: 'from-green-500 to-emerald-600', group: 'tech' },
    { label: 'Aptitude', icon: '🧠', color: 'from-amber-500 to-orange-600', group: 'general' },
    { label: 'English', icon: '📝', color: 'from-teal-400 to-cyan-600', group: 'general' },
    { label: 'Mathematics', icon: '📐', color: 'from-indigo-500 to-violet-600', group: 'general' },
    { label: 'Physics', icon: '⚛️', color: 'from-blue-400 to-purple-500', group: 'general' },
    { label: 'Logical Reasoning', icon: '🔎', color: 'from-pink-500 to-rose-600', group: 'general' },
    { label: 'General Knowledge', icon: '🌍', color: 'from-green-400 to-teal-500', group: 'general' },
];

// ─── QUESTION COUNTS ────────────────────────────────────────────────────────
const QUESTION_COUNTS = [
    { value: 10, label: '10 Qs', time: '~20 min', icon: '⚡' },
    { value: 15, label: '15 Qs', time: '~30 min', icon: '🎯' },
    { value: 20, label: '20 Qs', time: '~40 min', icon: '🔥' },
    { value: 25, label: '25 Qs', time: '~50 min', icon: '💎' },
];

const DIFFICULTY_LEVELS = [
    { label: 'Easy', value: 'Easy', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: '🌱' },
    { label: 'Medium', value: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '⚡' },
    { label: 'Hard', value: 'Hard', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: '🔥' },
    { label: 'Mixed', value: 'Mixed', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', icon: '🎲' },
];

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
    // Setup state
    const [state, setState] = useState<InterviewState>('setup');
    const [difficulty, setDifficulty] = useState('Medium');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [questionCount, setQuestionCount] = useState(15);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryGroup, setCategoryGroup] = useState<'all' | 'tech' | 'general'>('all');

    // Active interview state
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [report, setReport] = useState<string | null>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer
    useEffect(() => {
        if (timerActive) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [timerActive]);

    // Auto-scroll chat
    const prevMessageCountRef = useRef(0);
    useEffect(() => {
        if (messages.length > prevMessageCountRef.current) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            prevMessageCountRef.current = messages.length;
        }
    }, [messages]);

    // Filter categories
    const filteredCategories = INTERVIEW_CATEGORIES.filter(c => {
        const matchesSearch = c.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = categoryGroup === 'all' || c.group === categoryGroup;
        return matchesSearch && matchesGroup;
    });

    // Start interview with AI-generated questions
    const startInterview = async () => {
        if (!selectedCategory && !selectedCompany) return;
        setLoading(true);
        try {
            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_questions',
                    category: selectedCategory,
                    difficulty,
                    questionCount,
                    companyStyle: selectedCompany,
                }),
            });
            const data = await res.json();
            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
                setCurrentQIndex(0);
                setAnsweredQuestions([]);
                setMessages([{
                    role: 'assistant',
                    content: `🎯 **Welcome to your ${selectedCompany ? selectedCompany + '-style ' : ''}${selectedCategory || 'Technical'} Interview!**\n\n` +
                        `You'll be answering **${data.questions.length} questions** at **${difficulty}** difficulty.\n\n` +
                        `**Question 1/${data.questions.length}:**\n\n${data.questions[0].question}\n\n` +
                        (data.questions[0].category ? `📂 *Category: ${data.questions[0].category}*` : '')
                }]);
                setState('active');
                setTimerActive(true);
                setTimer(0);
                setCode('');
            } else {
                throw new Error(data.error || 'Failed to generate questions');
            }
        } catch (e: any) {
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
            const currentQ = questions[currentQIndex];
            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'chat',
                    messages: newMessages,
                    currentQuestion: currentQ,
                }),
            });
            const data = await res.json();
            setMessages([...newMessages, { role: 'assistant', content: data.interviewerMessage }]);

            // Mark current question as answered
            if (!answeredQuestions.includes(currentQIndex)) {
                setAnsweredQuestions(prev => [...prev, currentQIndex]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const nextQuestion = () => {
        if (currentQIndex >= questions.length - 1) {
            generateReport();
            return;
        }
        const nextIdx = currentQIndex + 1;
        setCurrentQIndex(nextIdx);
        const q = questions[nextIdx];
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: `**Question ${nextIdx + 1}/${questions.length}:**\n\n${q.question}\n\n` +
                (q.category ? `📂 *Category: ${q.category}*` : '') +
                (q.difficulty ? ` · 📊 *${q.difficulty}*` : '')
        }]);
        setCode('');
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
            if (!answeredQuestions.includes(currentQIndex)) {
                setAnsweredQuestions(prev => [...prev, currentQIndex]);
            }
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
                body: JSON.stringify({
                    action: 'report',
                    messages,
                    totalQuestions: questions.length,
                    answeredCount: answeredQuestions.length,
                    timeSpent: timer,
                    category: selectedCategory,
                    company: selectedCompany,
                }),
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
                <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-700">
                    {/* Hero Header */}
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-950/50 via-background to-indigo-950/30 p-8 sm:p-12">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-violet-500/5 to-transparent rounded-full" />

                        <div className="relative z-10 flex flex-col items-center text-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 animate-breathe">
                                <BrainCircuit className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
                                Elite Interview Arena
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                                Practice with FAANG-level questions across <strong className="text-foreground">20+ categories</strong>.
                                Real-time AI evaluation, company-specific patterns, and unlimited practice sessions.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                <Badge variant="outline" className="border-violet-500/30 text-violet-300 gap-1.5"><Code2 className="w-3 h-3" /> Coding</Badge>
                                <Badge variant="outline" className="border-violet-500/30 text-violet-300 gap-1.5"><Calculator className="w-3 h-3" /> Aptitude</Badge>
                                <Badge variant="outline" className="border-violet-500/30 text-violet-300 gap-1.5"><BookOpen className="w-3 h-3" /> General</Badge>
                                <Badge variant="outline" className="border-violet-500/30 text-violet-300 gap-1.5"><Building2 className="w-3 h-3" /> FAANG Style</Badge>
                                <Badge variant="outline" className="border-violet-500/30 text-violet-300 gap-1.5"><Zap className="w-3 h-3" /> Unlimited</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Company Presets */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-violet-400" />
                            Company Interview Style <span className="text-xs font-normal text-muted-foreground/60">(optional)</span>
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {COMPANY_PRESETS.map((company) => (
                                <button
                                    key={company.name}
                                    onClick={() => setSelectedCompany(selectedCompany === company.style ? '' : company.style)}
                                    className={cn(
                                        "group relative overflow-hidden rounded-xl border p-4 text-center transition-all duration-300 hover:scale-[1.03]",
                                        selectedCompany === company.style
                                            ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                                            : "border-white/[0.06] bg-card/30 hover:border-white/[0.12] hover:bg-card/50"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                                        company.color,
                                        selectedCompany === company.style ? "opacity-[0.08]" : "group-hover:opacity-[0.04]"
                                    )} />
                                    <div className="relative z-10">
                                        <div className="text-3xl mb-2">{company.icon}</div>
                                        <div className="text-sm font-bold">{company.name}</div>
                                        <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{company.focus}</div>
                                    </div>
                                    {selectedCompany === company.style && (
                                        <div className="absolute top-2 right-2"><CheckCircle2 className="w-4 h-4 text-violet-400" /></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Target className="w-4 h-4 text-violet-400" />
                                Select Category
                            </h3>
                            <div className="flex gap-1 bg-card/40 border border-white/[0.06] rounded-lg p-0.5">
                                {(['all', 'tech', 'general'] as const).map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setCategoryGroup(g)}
                                        className={cn(
                                            "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                            categoryGroup === g
                                                ? "bg-violet-500/20 text-violet-300"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {g === 'all' ? 'All' : g === 'tech' ? '💻 Technical' : '📚 General'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
                                <div className="relative flex items-center bg-card/50 border border-white/[0.08] rounded-xl overflow-hidden backdrop-blur-sm">
                                    <Search className="w-4 h-4 text-muted-foreground ml-4" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search categories..."
                                        className="w-full bg-transparent border-0 px-3 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/50"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="mr-3 text-muted-foreground hover:text-foreground">
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filteredCategories.map((cat) => (
                                <button
                                    key={cat.label}
                                    onClick={() => setSelectedCategory(selectedCategory === cat.label ? '' : cat.label)}
                                    className={cn(
                                        "group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-300 hover:scale-[1.02]",
                                        selectedCategory === cat.label
                                            ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                                            : "border-white/[0.06] bg-card/30 hover:border-white/[0.12] hover:bg-card/50"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                                        cat.color,
                                        selectedCategory === cat.label ? "opacity-[0.08]" : "group-hover:opacity-[0.04]"
                                    )} />
                                    <div className="relative z-10">
                                        <div className="text-xl mb-1">{cat.icon}</div>
                                        <div className="text-xs font-semibold">{cat.label}</div>
                                    </div>
                                    {selectedCategory === cat.label && (
                                        <div className="absolute top-2 right-2"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Configuration Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Difficulty */}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-violet-400" />
                                Difficulty Level
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {DIFFICULTY_LEVELS.map((d) => (
                                    <button
                                        key={d.value}
                                        onClick={() => setDifficulty(d.value)}
                                        className={cn(
                                            "rounded-xl border p-3 text-center transition-all duration-300",
                                            difficulty === d.value
                                                ? cn(d.color, "border-current shadow-lg")
                                                : "border-white/[0.06] bg-card/30 hover:border-white/[0.12]"
                                        )}
                                    >
                                        <div className="text-lg mb-0.5">{d.icon}</div>
                                        <div className="text-xs font-semibold">{d.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Count */}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4 text-violet-400" />
                                Number of Questions
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {QUESTION_COUNTS.map((qc) => (
                                    <button
                                        key={qc.value}
                                        onClick={() => setQuestionCount(qc.value)}
                                        className={cn(
                                            "rounded-xl border p-3 text-center transition-all duration-300",
                                            questionCount === qc.value
                                                ? "border-violet-500/50 bg-violet-500/15 text-violet-300 shadow-lg shadow-violet-500/10"
                                                : "border-white/[0.06] bg-card/30 hover:border-white/[0.12]"
                                        )}
                                    >
                                        <div className="text-lg mb-0.5">{qc.icon}</div>
                                        <div className="text-xs font-bold">{qc.label}</div>
                                        <div className="text-[10px] text-muted-foreground mt-0.5">{qc.time}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl p-5 text-sm">
                        <p className="font-semibold mb-2 text-violet-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> How Elite Interview Arena Works:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                            <div className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" /> AI generates {questionCount} unique real-time questions based on your selection</div>
                            <div className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" /> Questions change every session — unlimited practice</div>
                            <div className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" /> Discuss your approach, submit code, get real-time feedback</div>
                            <div className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" /> Get a detailed interview report card with scores & recommendations</div>
                            <div className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" /> Simulates real interviews at Google, Microsoft, Meta, Amazon & more</div>
                            <div className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" /> Covers coding, aptitude, English, maths, physics & beyond</div>
                        </div>
                    </div>

                    {/* Start Button */}
                    <Button
                        onClick={startInterview}
                        disabled={loading || (!selectedCategory && !selectedCompany)}
                        className="w-full h-16 text-lg font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 rounded-xl shadow-2xl shadow-violet-500/20 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating Your Interview...</>
                        ) : (
                            <><Play className="w-5 h-5 mr-2" /> Launch Interview Arena</>
                        )}
                    </Button>
                </div>
            </PageShell>
        );
    }

    // ─── Report Screen ───────────────────────────────────────────────
    if (state === 'report' && report) {
        return (
            <PageShell>
                <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Hero Score */}
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-950/50 via-card/50 to-purple-950/30 p-8 text-center">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
                            <p className="text-muted-foreground mb-4">
                                {selectedCompany && `${selectedCompany.charAt(0).toUpperCase() + selectedCompany.slice(1)}-style `}
                                {selectedCategory} · {questions.length} Questions · {formatTime(timer)}
                            </p>
                            <div className="flex justify-center gap-6 text-sm">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-violet-400">{questions.length}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                </div>
                                <div className="w-px bg-white/10" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-400">{answeredQuestions.length}</div>
                                    <div className="text-xs text-muted-foreground">Answered</div>
                                </div>
                                <div className="w-px bg-white/10" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-amber-400">{formatTime(timer)}</div>
                                    <div className="text-xs text-muted-foreground">Duration</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report */}
                    <Card className="border-white/10 bg-background/40">
                        <CardContent className="p-6">
                            <RenderMarkdown content={report} />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" className="h-12 px-6 rounded-xl" onClick={() => { setState('setup'); setMessages([]); setReport(null); setQuestions([]); setAnsweredQuestions([]); }}>
                            <RotateCcw className="w-4 h-4 mr-2" /> New Interview
                        </Button>
                        <Button onClick={() => setState('active')} variant="outline" className="h-12 px-6 rounded-xl">
                            Review Conversation
                        </Button>
                    </div>
                </div>
            </PageShell>
        );
    }

    // ─── Active Interview ────────────────────────────────────────────
    const currentQ = questions[currentQIndex];
    return (
        <div className="min-h-screen p-4 md:p-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4 bg-card/50 border border-white/[0.06] rounded-xl px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-semibold text-red-400">LIVE</span>
                    </div>
                    <div className="w-px h-5 bg-white/10" />
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Timer className="w-3.5 h-3.5" />
                        <span className="font-mono">{formatTime(timer)}</span>
                    </div>
                    <div className="w-px h-5 bg-white/10" />
                    <Badge variant="outline" className="text-xs">
                        Q{currentQIndex + 1}/{questions.length}
                    </Badge>
                    {selectedCategory && (
                        <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/30 text-xs">{selectedCategory}</Badge>
                    )}
                    {currentQ?.difficulty && (
                        <Badge variant={currentQ.difficulty === 'Hard' ? 'destructive' : currentQ.difficulty === 'Easy' ? 'secondary' : 'default'} className="text-xs">
                            {currentQ.difficulty}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {currentQIndex < questions.length - 1 && (
                        <Button onClick={nextQuestion} variant="outline" size="sm" className="text-xs border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                            <ChevronRight className="w-3 h-3 mr-1" /> Next Q
                        </Button>
                    )}
                    <Button
                        onClick={generateReport}
                        disabled={reportLoading}
                        variant="outline"
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        size="sm"
                    >
                        {reportLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <FileText className="h-3.5 w-3.5 mr-1.5" />}
                        End & Report
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 flex gap-1">
                {questions.map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-300",
                            answeredQuestions.includes(i) ? "bg-emerald-500"
                                : i === currentQIndex ? "bg-violet-500 animate-pulse"
                                    : "bg-white/10"
                        )}
                    />
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
                {/* Left: Chat */}
                <Card className="border-white/10 bg-background/40 flex flex-col overflow-hidden">
                    <CardHeader className="pb-2 border-b border-white/5">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4 text-violet-400" />
                            Interview Conversation
                            {currentQ?.category && (
                                <Badge variant="outline" className="text-[10px] ml-auto">{currentQ.category}</Badge>
                            )}
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
                        <Select value={language} onValueChange={(v) => setLanguage(v)}>
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
                            Submit Code
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
