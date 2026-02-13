"use client"

import { useState, useEffect, useRef, FormEvent, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    X, Send, Minus, Maximize2, Minimize2, Sparkles, Loader2,
    Copy, Check, Mic, MicOff, Volume2, VolumeX, Music, ImageIcon, Code, Youtube
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

// ─── Markdown Renderer (memoized) ───────────────────────────────────────
const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const copyCode = useCallback((code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedIndex(null), 2000);
    }, []);

    const parts: React.ReactElement[] = [];
    let codeBlockIndex = 0;
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    const rawSegments: { type: 'text' | 'code'; content: string; lang?: string }[] = [];

    while ((match = codeBlockRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            rawSegments.push({ type: 'text', content: content.slice(lastIndex, match.index) });
        }
        rawSegments.push({ type: 'code', content: match[2].trim(), lang: match[1] || 'code' });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
        rawSegments.push({ type: 'text', content: content.slice(lastIndex) });
    }

    rawSegments.forEach((segment, segIdx) => {
        if (segment.type === 'code') {
            const idx = codeBlockIndex++;
            parts.push(
                <div key={`code-${segIdx}`} className="relative my-4 rounded-xl overflow-hidden border border-white/15 shadow-lg">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/95 text-zinc-400 text-xs font-mono border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Code className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="uppercase tracking-wider font-bold text-emerald-400">{segment.lang}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg" onClick={() => copyCode(segment.content, idx)}>
                            {copiedIndex === idx ? <Check className="h-3.5 w-3.5 mr-1 text-green-400" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                            {copiedIndex === idx ? 'Copied!' : 'Copy'}
                        </Button>
                    </div>
                    <pre className="p-4 bg-black/90 text-zinc-100 text-sm font-mono overflow-x-auto leading-relaxed"><code>{segment.content}</code></pre>
                </div>
            );
        } else {
            const lines = segment.content.split('\n');
            const inlineElements: React.ReactElement[] = [];
            lines.forEach((line, lineIdx) => {
                if (lineIdx > 0) inlineElements.push(<br key={`br-${segIdx}-${lineIdx}`} />);
                const processed = processInline(line, `${segIdx}-${lineIdx}`);
                inlineElements.push(<span key={`line-${segIdx}-${lineIdx}`}>{processed}</span>);
            });
            parts.push(<span key={`text-${segIdx}`} className="leading-relaxed block">{inlineElements}</span>);
        }
    });

    return <div className="space-y-2">{parts}</div>;
});

function processInline(text: string, keyPrefix: string): React.ReactElement[] {
    const elements: React.ReactElement[] = [];
    const inlineRegex = /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|`([^`]+)`|^(#{1,3})\s+(.+)/g;
    let lastIdx = 0;
    let m;

    while ((m = inlineRegex.exec(text)) !== null) {
        if (m.index > lastIdx) {
            elements.push(<span key={`${keyPrefix}-t-${lastIdx}`}>{text.slice(lastIdx, m.index)}</span>);
        }
        if (m[1] !== undefined && m[2]) {
            elements.push(<img key={`${keyPrefix}-img-${m.index}`} src={m[2]} alt={m[1]} className="max-w-full rounded-xl my-3 max-h-64 shadow-lg border border-white/10" />);
        } else if (m[3] && m[4]) {
            const isYouTube = m[4].includes('youtube.com') || m[4].includes('youtu.be');
            elements.push(
                <a key={`${keyPrefix}-a-${m.index}`} href={m[4]} target="_blank" rel="noreferrer"
                    className={cn("inline-flex items-center gap-1 underline underline-offset-4 font-semibold transition-colors", isYouTube ? "text-red-400 hover:text-red-300" : "text-primary hover:text-primary/80")}>
                    {isYouTube && <Youtube className="h-3.5 w-3.5 inline" />}
                    {m[3]}
                </a>
            );
        } else if (m[5]) {
            elements.push(<strong key={`${keyPrefix}-b-${m.index}`} className="font-bold text-foreground">{m[5]}</strong>);
        } else if (m[6]) {
            elements.push(<code key={`${keyPrefix}-c-${m.index}`} className="px-1.5 py-0.5 bg-primary/15 text-primary rounded-md text-[0.9em] font-mono border border-primary/20">{m[6]}</code>);
        } else if (m[7] && m[8]) {
            const level = m[7].length;
            const cls = level === 1 ? 'text-2xl font-bold mt-4 mb-2 text-primary' : level === 2 ? 'text-xl font-bold mt-3 mb-1' : 'text-lg font-semibold mt-2';
            elements.push(<span key={`${keyPrefix}-h-${m.index}`} className={`block ${cls}`}>{m[8]}</span>);
        }
        lastIdx = m.index + m[0].length;
    }
    if (lastIdx < text.length) {
        elements.push(<span key={`${keyPrefix}-t-end`}>{text.slice(lastIdx)}</span>);
    }
    return elements;
}

// ─── Suggestions ────────────────────────────────────────────────────────
const suggestions = [
    { text: "Explain React Hooks", icon: Code, color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400" },
    { text: "Find YouTube tutorials", icon: Youtube, color: "from-red-500/20 to-rose-500/20 border-red-500/30 hover:border-red-400" },
    { text: "Generate an image", icon: ImageIcon, color: "from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 hover:border-purple-400" },
    { text: "Generate a song", icon: Music, color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30 hover:border-emerald-400" },
];

// ─── Main Component ─────────────────────────────────────────────────────
export default function GlobalChatbot() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const pathname = usePathname();
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Mount check
    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isFullScreen]);

    // Speech Recognition setup
    useEffect(() => {
        if (!mounted) return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => prev + transcript);
                setIsListening(false);
            };
            recognition.onerror = () => { setIsListening(false); toast.error("Voice input failed."); };
            recognition.onend = () => { setIsListening(false); };
            recognitionRef.current = recognition;
        }
    }, [mounted]);

    const toggleListening = useCallback(() => {
        if (!recognitionRef.current) { toast.error("Voice input not supported."); return; }
        if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
        else { recognitionRef.current.start(); setIsListening(true); }
    }, [isListening]);

    const speakText = useCallback((text: string) => {
        if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
        const cleanText = text
            .replace(/```[\s\S]*?```/g, 'Code block omitted.')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/!\[[^\]]*\]\([^)]+\)/g, 'Image shown.')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/#{1,3}\s+/g, '')
            .trim();
        if (!cleanText) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 500));
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    }, [voiceEnabled]);

    const stopSpeaking = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ messages: [...messages, userMessage], context: pathname })
            });

            if (response.status === 401) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I'd love to help! Please **[Sign In](/auth/login)** to continue chatting with Ganapathi AI."
                }]);
                return;
            }
            if (!response.ok) throw new Error('Failed to get response');

            const text = await response.text();
            const assistantContent = text || 'No response.';
            setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
            if (voiceEnabled) speakText(assistantContent);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFullScreen = () => { setIsFullScreen(!isFullScreen); setIsMinimized(false); };

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) return null;

    // ─── FAB (Floating Action Button) ───────────────────────────────────
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 z-[9999] h-16 w-16 rounded-2xl shadow-2xl shadow-violet-500/40 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 hover:scale-110 active:scale-95 transition-all duration-200 border border-white/20 flex items-center justify-center overflow-hidden group cursor-pointer"
                aria-label="Open Ganapathi AI Chat"
            >
                {/* Glossy overlay */}
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl" />
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <Sparkles className="h-6 w-6 text-white drop-shadow-md" />
                    <span className="text-[8px] font-bold text-white/90 tracking-wide uppercase">AI</span>
                </div>
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-2xl ring-2 ring-violet-400/50 animate-ping opacity-20 pointer-events-none" />
            </button>
        );
    }

    // ─── Chat Panel ─────────────────────────────────────────────────────
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={cn(
                    "fixed z-[9999]",
                    isFullScreen
                        ? "inset-0 p-4 md:p-8 bg-background/80 backdrop-blur-sm"
                        : "bottom-24 right-4 md:right-6"
                )}
            >
                <Card className={cn(
                    "shadow-2xl transition-all duration-200 flex flex-col overflow-hidden border-white/10",
                    "bg-background/95 backdrop-blur-xl",
                    isFullScreen ? "w-full h-full rounded-3xl" : "w-[360px] md:w-[420px]",
                    !isFullScreen && (isMinimized ? "h-16" : "h-[580px]")
                )}>
                    {/* Header */}
                    <CardHeader className={cn(
                        "p-4 border-b border-white/10 flex flex-row items-center justify-between select-none",
                        "bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-indigo-900/40"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/30 overflow-hidden">
                                    <img src="/logo.png" alt="Ganapathi AI" className="w-full h-full object-cover" onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }} />
                                    <Sparkles className="h-6 w-6 text-white hidden" />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    Ganapathi AI
                                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/20">
                                        Pro
                                    </span>
                                </CardTitle>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-muted-foreground font-medium">Built by G R Harsha</span>
                                    <span className="h-1 w-1 rounded-full bg-zinc-500" />
                                    <span className="text-xs text-green-400 font-medium">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Button variant="ghost" size="icon"
                                className={cn("h-8 w-8 transition-colors rounded-lg", voiceEnabled ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-white/5")}
                                onClick={() => { setVoiceEnabled(!voiceEnabled); if (isSpeaking) stopSpeaking(); }}
                                title={voiceEnabled ? "Voice On" : "Voice Off"}>
                                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                                onClick={toggleFullScreen} title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
                                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                            {!isFullScreen && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                                    onClick={() => setIsMinimized(!isMinimized)}>
                                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
                                onClick={() => { setIsOpen(false); stopSpeaking(); }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    {!isMinimized && (
                        <>
                            <CardContent className="p-0 flex-1 overflow-hidden bg-black/10">
                                <ScrollArea className="h-full p-4 md:p-6">
                                    <div className="space-y-6 pb-4">
                                        {messages.length === 0 && (
                                            <div className="text-center py-8 flex flex-col items-center justify-center min-h-[300px]">
                                                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-500/20 via-purple-600/20 to-indigo-600/20 flex items-center justify-center mb-6 shadow-lg border border-white/10 relative overflow-hidden">
                                                    <img src="/logo.png" alt="Ganapathi AI" className="w-16 h-16 object-contain relative z-10" />
                                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                                                </div>
                                                <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                                                    Hi! I&apos;m Ganapathi AI 👋
                                                </h3>
                                                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8">
                                                    Your personal coding mentor built by G R Harsha. I can help with code, generate images, find videos, create songs & more!
                                                </p>
                                                <div className="grid grid-cols-2 gap-2.5 max-w-md w-full">
                                                    {suggestions.map((s, i) => (
                                                        <button key={i} onClick={() => { setInput(s.text); }}
                                                            className={cn("flex items-center gap-2 text-sm px-3 py-3 rounded-xl border bg-gradient-to-r transition-all text-left shadow-sm hover:shadow-md group", s.color)}>
                                                            <s.icon className="h-4 w-4 flex-shrink-0 text-foreground/70 group-hover:text-foreground transition-colors" />
                                                            <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors truncate text-xs">{s.text}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {messages.map((m, i) => (
                                            <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                                <Avatar className={cn("h-9 w-9 flex-shrink-0 shadow-md border border-white/10", m.role === 'user' ? "ring-2 ring-primary/20" : "ring-2 ring-violet-500/20")}>
                                                    <AvatarFallback className={cn("font-bold text-xs", m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white")}>
                                                        {m.role === 'user' ? "ME" : "GA"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className={cn("max-w-[85%] p-4 rounded-2xl text-sm shadow-md overflow-hidden min-w-0",
                                                    m.role === 'user'
                                                        ? "bg-gradient-to-r from-primary to-violet-600 text-primary-foreground rounded-tr-sm"
                                                        : "bg-card/80 border border-white/8 rounded-tl-sm"
                                                )}>
                                                    {m.role === 'assistant' ? (
                                                        <div className="space-y-1">
                                                            <MarkdownContent content={m.content} />
                                                            <button onClick={() => isSpeaking ? stopSpeaking() : speakText(m.content)}
                                                                className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                                                {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                                                                {isSpeaking ? 'Stop' : 'Listen'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="whitespace-pre-wrap font-medium">{m.content}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                            <div className="flex gap-3">
                                                <Avatar className="h-9 w-9 flex-shrink-0 border border-white/10 shadow-md">
                                                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-xs">GA</AvatarFallback>
                                                </Avatar>
                                                <div className="bg-card/50 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-3">
                                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                    <span className="text-sm font-medium text-muted-foreground">Thinking...</span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={scrollRef} className="h-4" />
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="p-3 border-t border-white/8 bg-background/50">
                                <form onSubmit={handleSubmit} className="flex w-full items-center gap-2 relative">
                                    <Button type="button" size="icon" variant="ghost"
                                        className={cn("h-10 w-10 rounded-xl flex-shrink-0 transition-all",
                                            isListening ? "bg-red-500/20 text-red-400 ring-2 ring-red-500/30 animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                                        )}
                                        onClick={toggleListening} title={isListening ? "Stop listening" : "Voice input"}>
                                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </Button>
                                    <Input
                                        placeholder={isListening ? "Listening..." : "Ask Ganapathi AI anything..."}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="h-11 pl-4 pr-12 rounded-xl bg-black/20 border-white/8 focus-visible:ring-primary/50 text-sm shadow-inner"
                                        autoFocus
                                        autoComplete="off"
                                        disabled={isLoading}
                                    />
                                    <Button type="submit" size="icon"
                                        className="absolute right-1.5 h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-primary/25 hover:scale-105 transition-all"
                                        disabled={isLoading || !input.trim()}>
                                        <Send className="h-3.5 w-3.5" />
                                    </Button>
                                </form>
                            </CardFooter>
                        </>
                    )}
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
