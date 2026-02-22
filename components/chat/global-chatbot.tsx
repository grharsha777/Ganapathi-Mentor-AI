"use client"

import { useState, useEffect, useRef, FormEvent, useCallback, memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    X, Send, Minus, Maximize2, Minimize2, Sparkles, Loader2,
    Copy, Check, Mic, MicOff, Volume2, VolumeX, Music, ImageIcon, Code, Youtube,
    ExternalLink, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const APP_DOMAIN = 'ganapathi-mentor-ai.vercel.app';

// ─── Markdown Renderer (memoized) ───────────────────────────────────────
// Pre-process content to fix broken markdown links the AI sometimes outputs
function fixBrokenMarkdownLinks(text: string): string {
    // Normalize line endings — strip all \r so we only deal with \n
    let fixed = text.replace(/\r/g, '');
    // Fix links split across lines: [text]\n(url) → [text](url)
    fixed = fixed.replace(/\]\s*\n+\s*\(/g, '](');
    // Fix links with spaces between ] and ( on same line: [text] (url) → [text](url)
    fixed = fixed.replace(/\]\s+\(/g, '](');
    // Fix bare URLs next to bracketed text: [text] https://url → [text](https://url)
    fixed = fixed.replace(/\[([^\]]+)\]\s*\n*\s*\(?(https?:\/\/[^\s)]+)\)?/g, '[$1]($2)');
    return fixed;
}

// Convert plain text (with \n) to React elements, inserting <br> for newlines
function textToElements(text: string, keyPrefix: string): React.ReactElement[] {
    const result: React.ReactElement[] = [];
    const lines = text.split('\n');
    lines.forEach((line, i) => {
        if (i > 0) result.push(<br key={`${keyPrefix}-br-${i}`} />);
        if (line) result.push(<span key={`${keyPrefix}-t-${i}`}>{line}</span>);
    });
    return result;
}

const MarkdownContent = memo(function MarkdownContent({ content, onNavigate }: { content: string; onNavigate: (path: string) => void }) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const copyCode = useCallback((code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedIndex(null), 2000);
    }, []);

    const parts: React.ReactElement[] = [];
    let codeBlockIndex = 0;
    // Pre-process: normalize \r and fix broken markdown links
    const processedContent = fixBrokenMarkdownLinks(content);

    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    const rawSegments: { type: 'text' | 'code'; content: string; lang?: string }[] = [];

    while ((match = codeBlockRegex.exec(processedContent)) !== null) {
        if (match.index > lastIndex) {
            rawSegments.push({ type: 'text', content: processedContent.slice(lastIndex, match.index) });
        }
        rawSegments.push({ type: 'code', content: match[2].trim(), lang: match[1] || 'code' });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < processedContent.length) {
        rawSegments.push({ type: 'text', content: processedContent.slice(lastIndex) });
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
                    <pre className="p-4 bg-black/90 text-zinc-100 text-[13px] font-mono overflow-x-auto leading-relaxed whitespace-pre"><code>{segment.content}</code></pre>
                </div>
            );
        } else {
            // Process the ENTIRE text segment at once (not line-by-line)
            // so that links spanning line boundaries are properly matched
            const inlineElements = processInlineFullText(segment.content, `seg-${segIdx}`, onNavigate);
            parts.push(<span key={`text-${segIdx}`} className="leading-relaxed block break-words">{inlineElements}</span>);
        }
    });

    return <div className="space-y-2 break-words overflow-hidden">{parts}</div>;
});

// Process the entire text block at once — finds links, bold, code, headings
// across the full content (not line-by-line), so links that span line breaks
// are properly detected. Newlines in unmatched text become <br> elements.
function processInlineFullText(text: string, keyPrefix: string, onNavigate: (path: string) => void): React.ReactElement[] {
    const elements: React.ReactElement[] = [];
    // Match {{youtube:VIDEO_ID|Title}} pattern, plus images, links, bold, code, headings
    const inlineRegex = /\{\{youtube:([\w-]+)\|([^}]+)\}\}|!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*(.+?)\*\*|`([^`]+)`|(?:^|\n)(#{1,3})\s+(.+)/g;
    let lastIdx = 0;
    let m;

    while ((m = inlineRegex.exec(text)) !== null) {
        if (m.index > lastIdx) {
            elements.push(...textToElements(text.slice(lastIdx, m.index), `${keyPrefix}-t-${lastIdx}`));
        }
        if (m[1] && m[2]) {
            // YouTube embed thumbnail — {{youtube:ID|Title}}
            const videoId = m[1];
            const videoTitle = m[2];
            elements.push(
                <a
                    key={`${keyPrefix}-yt-${m.index}`}
                    href={`https://www.youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block my-3 rounded-xl overflow-hidden border border-white/10 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group"
                >
                    <div className="relative">
                        <img
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                            alt={videoTitle}
                            className="w-full h-auto object-cover"
                            loading="lazy"
                        />
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 group-hover:scale-110 transition-transform">
                                <svg className="h-5 w-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="px-3 py-2.5 bg-zinc-900/95 flex items-center gap-2">
                        <Youtube className="h-4 w-4 text-red-500 shrink-0" />
                        <span className="text-sm font-medium text-white truncate">{videoTitle}</span>
                    </div>
                </a>
            );
        } else if (m[3] !== undefined && m[4]) {
            // Image
            elements.push(<img key={`${keyPrefix}-img-${m.index}`} src={m[4]} alt={m[3]} className="max-w-full rounded-xl my-3 max-h-64 shadow-lg border border-white/10" />);
        } else if (m[5] && m[6]) {
            // Link — determine if internal or external
            const url = m[6];
            const linkText = m[5];
            const isInternal = url.includes(APP_DOMAIN) || (url.startsWith('/') && !url.startsWith('//'));
            const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
            const isLinkedIn = url.includes('linkedin.com');
            const isGitHubLink = url.includes('github.com');
            const isEmail = url.startsWith('mailto:');

            if (isInternal) {
                const path = url.includes(APP_DOMAIN) ? url.split(APP_DOMAIN)[1] || '/dashboard' : url;
                elements.push(
                    <button
                        key={`${keyPrefix}-nav-${m.index}`}
                        onClick={() => onNavigate(path)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 hover:bg-violet-500/25 hover:text-violet-200 hover:border-violet-400/50 transition-all duration-200 font-semibold text-sm cursor-pointer group max-w-full"
                    >
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        <span className="truncate">{linkText}</span>
                    </button>
                );
            } else if (isYouTube) {
                // Extract video ID from URL for thumbnail embed
                const ytIdMatch = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
                if (ytIdMatch) {
                    const ytId = ytIdMatch[1];
                    elements.push(
                        <a key={`${keyPrefix}-yt-${m.index}`} href={url} target="_blank" rel="noreferrer"
                            className="block my-3 rounded-xl overflow-hidden border border-white/10 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] group">
                            <div className="relative">
                                <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={linkText} className="w-full h-auto object-cover" loading="lazy" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                    <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 group-hover:scale-110 transition-transform">
                                        <svg className="h-5 w-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="px-3 py-2 bg-zinc-900/95 flex items-center gap-2">
                                <Youtube className="h-4 w-4 text-red-500 shrink-0" />
                                <span className="text-sm font-medium text-white truncate">{linkText}</span>
                            </div>
                        </a>
                    );
                } else {
                    elements.push(
                        <a key={`${keyPrefix}-a-${m.index}`} href={url} target="_blank" rel="noreferrer"
                            className="flex w-full items-center gap-2 px-3 py-2.5 my-2 rounded-xl bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-500/30 text-red-300 hover:from-red-600/30 hover:to-rose-600/30 hover:text-red-200 transition-all duration-300 font-bold text-sm shadow-lg group">
                            <Youtube className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="truncate flex-1 text-left">{linkText}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                        </a>
                    );
                }
            } else if (isLinkedIn) {
                elements.push(
                    <a key={`${keyPrefix}-a-${m.index}`} href={url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200 font-semibold text-sm">
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        <span className="truncate">{linkText}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                    </a>
                );
            } else if (isGitHubLink) {
                elements.push(
                    <a key={`${keyPrefix}-a-${m.index}`} href={url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gray-500/10 border border-gray-500/20 text-gray-300 hover:bg-gray-500/20 hover:text-gray-200 transition-all duration-200 font-semibold text-sm">
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                        <span className="truncate">{linkText}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                    </a>
                );
            } else if (isEmail) {
                elements.push(
                    <a key={`${keyPrefix}-a-${m.index}`} href={url}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all duration-200 font-semibold text-sm">
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                        <span className="truncate">{linkText}</span>
                    </a>
                );
            } else {
                elements.push(
                    <a key={`${keyPrefix}-a-${m.index}`} href={url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 underline underline-offset-4 font-semibold text-primary hover:text-primary/80 transition-colors break-all">
                        <span>{linkText}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                    </a>
                );
            }
        } else if (m[7]) {
            elements.push(<strong key={`${keyPrefix}-b-${m.index}`} className="font-bold text-foreground">{m[7]}</strong>);
        } else if (m[8]) {
            elements.push(<code key={`${keyPrefix}-c-${m.index}`} className="px-1.5 py-0.5 bg-primary/15 text-primary rounded-md text-[0.9em] font-mono border border-primary/20">{m[8]}</code>);
        } else if (m[9] && m[10]) {
            const level = m[9].length;
            const cls = level === 1 ? 'text-2xl font-bold mt-4 mb-2 text-primary' : level === 2 ? 'text-xl font-bold mt-3 mb-1' : 'text-lg font-semibold mt-2';
            elements.push(<span key={`${keyPrefix}-h-${m.index}`} className={`block ${cls}`}>{m[10]}</span>);
        }
        lastIdx = m.index + m[0].length;
    }
    if (lastIdx < text.length) {
        elements.push(...textToElements(text.slice(lastIdx), `${keyPrefix}-t-end`));
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

// ─── Animated FAB Styles ────────────────────────────────────────────────
const fabKeyframes = `
@keyframes fabFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes fabGlowPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.15); }
}
@keyframes fabOrbit1 {
  0% { transform: rotate(0deg) translateX(32px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(32px) rotate(-360deg); }
}
@keyframes fabOrbit2 {
  0% { transform: rotate(120deg) translateX(36px) rotate(-120deg); }
  100% { transform: rotate(480deg) translateX(36px) rotate(-480deg); }
}
@keyframes fabOrbit3 {
  0% { transform: rotate(240deg) translateX(30px) rotate(-240deg); }
  100% { transform: rotate(600deg) translateX(30px) rotate(-600deg); }
}
@keyframes fabRingRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes fabWave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-15deg); }
}
@keyframes fabSparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}
`;

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
    const [fabHovered, setFabHovered] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Mount check
    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

    // Navigate within the app (same tab)
    const handleInternalNavigate = useCallback((path: string) => {
        router.push(path);
        toast.success(`Navigating to ${path}`);
    }, [router]);

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

    // ─── Premium Animated FAB ───────────────────────────────────────────
    if (!isOpen) {
        return (
            <>
                <style>{fabKeyframes}</style>
                <button
                    onClick={() => setIsOpen(true)}
                    onMouseEnter={() => setFabHovered(true)}
                    onMouseLeave={() => setFabHovered(false)}
                    className="fixed bottom-4 sm:bottom-6 lg:bottom-24 right-4 sm:right-6 z-[9999] group cursor-pointer"
                    style={{ animation: 'fabFloat 3s ease-in-out infinite' }}
                    aria-label="Open Ganapathi AI Chat"
                >
                    {/* Glow effect behind the button */}
                    <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 blur-xl"
                        style={{ animation: 'fabGlowPulse 2.5s ease-in-out infinite' }}
                    />

                    {/* Rotating gradient ring */}
                    <div
                        className="absolute -inset-1.5 rounded-[22px] opacity-70"
                        style={{
                            background: 'conic-gradient(from 0deg, #8b5cf6, #6366f1, #a78bfa, #818cf8, #7c3aed, #8b5cf6)',
                            animation: 'fabRingRotate 4s linear infinite',
                        }}
                    />

                    {/* Orbiting particles */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                            className="absolute h-2 w-2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50"
                            style={{ animation: 'fabOrbit1 3s linear infinite' }}
                        />
                        <div
                            className="absolute h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-lg shadow-indigo-300/50"
                            style={{ animation: 'fabOrbit2 4s linear infinite' }}
                        />
                        <div
                            className="absolute h-1 w-1 rounded-full bg-purple-300 shadow-lg shadow-purple-300/50"
                            style={{ animation: 'fabOrbit3 3.5s linear infinite' }}
                        />
                    </div>

                    {/* Main button body */}
                    <div className={cn(
                        "relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-violet-500/40 border border-white/20 overflow-hidden transition-all duration-300",
                        fabHovered && "scale-110 shadow-violet-500/60"
                    )}>
                        {/* Glossy top overlay */}
                        <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl" />

                        {/* Inner shimmer effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>

                        {/* AI Mascot Icon */}
                        <div className="relative z-10 flex flex-col items-center gap-0.5">
                            <div style={{ animation: fabHovered ? 'fabWave 0.5s ease-in-out infinite' : 'none' }}>
                                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="drop-shadow-lg">
                                    {/* Robot head */}
                                    <rect x="6" y="8" width="20" height="16" rx="4" fill="white" fillOpacity="0.95" />
                                    {/* Eyes */}
                                    <circle cx="12" cy="16" r="2.5" fill="#7c3aed">
                                        <animate attributeName="r" values="2.5;2;2.5" dur="2s" repeatCount="indefinite" />
                                    </circle>
                                    <circle cx="20" cy="16" r="2.5" fill="#6366f1">
                                        <animate attributeName="r" values="2.5;2;2.5" dur="2s" repeatCount="indefinite" begin="0.3s" />
                                    </circle>
                                    {/* Eye sparkle */}
                                    <circle cx="13" cy="15" r="0.8" fill="white" />
                                    <circle cx="21" cy="15" r="0.8" fill="white" />
                                    {/* Smile */}
                                    <path d="M12 20 Q16 23 20 20" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                    {/* Antenna */}
                                    <line x1="16" y1="8" x2="16" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    <circle cx="16" cy="3" r="2" fill="#a78bfa">
                                        <animate attributeName="fill" values="#a78bfa;#c4b5fd;#a78bfa" dur="1.5s" repeatCount="indefinite" />
                                    </circle>
                                    {/* Side decoration */}
                                    <rect x="3" y="14" width="3" height="4" rx="1.5" fill="white" fillOpacity="0.7" />
                                    <rect x="26" y="14" width="3" height="4" rx="1.5" fill="white" fillOpacity="0.7" />
                                </svg>
                            </div>
                        </div>

                        {/* Sparkle particles on hover */}
                        {fabHovered && (
                            <>
                                <div className="absolute top-1 right-1" style={{ animation: 'fabSparkle 0.8s ease-in-out infinite' }}>
                                    <Sparkles className="h-3 w-3 text-yellow-300" />
                                </div>
                                <div className="absolute bottom-2 left-1" style={{ animation: 'fabSparkle 0.8s ease-in-out infinite 0.4s' }}>
                                    <Sparkles className="h-2.5 w-2.5 text-cyan-300" />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Tooltip on hover */}
                    <AnimatePresence>
                        {fabHovered && (
                            <motion.div
                                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                                className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
                            >
                                <div className="px-3 py-2 rounded-xl bg-background/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/30">
                                    <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                                        ✨ Chat with Ganapathi AI
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Notification dot */}
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                        <span className="h-2 w-2 rounded-full bg-green-300 animate-ping" />
                    </span>
                </button>
            </>
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
                        ? "inset-0 p-2 sm:p-4 md:p-8 bg-background/80 backdrop-blur-sm"
                        : "bottom-2 sm:bottom-4 lg:bottom-24 right-2 sm:right-4 md:right-6 left-2 sm:left-auto"
                )}
            >
                <Card className={cn(
                    "shadow-2xl transition-all duration-200 flex flex-col overflow-hidden border-white/10",
                    "bg-background/95 backdrop-blur-xl",
                    isFullScreen ? "w-full h-full rounded-2xl sm:rounded-3xl" : "w-full sm:w-[420px] md:w-[560px] lg:w-[620px] max-w-full",
                    !isFullScreen && (isMinimized ? "h-16" : "h-[70vh] sm:h-[650px] md:h-[720px] max-h-[calc(100vh-140px)]")
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
                                                    Your personal coding mentor built by G R Harsha. I can help with code, generate images, find videos, navigate the app &amp; more!
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
                                                <div className={cn("p-4 rounded-2xl text-sm shadow-md min-w-0",
                                                    m.role === 'user'
                                                        ? "max-w-[80%] bg-gradient-to-r from-primary to-violet-600 text-primary-foreground rounded-tr-sm"
                                                        : "max-w-[92%] bg-card/80 border border-white/8 rounded-tl-sm overflow-hidden break-words"
                                                )}>
                                                    {m.role === 'assistant' ? (
                                                        <div className="space-y-1">
                                                            <MarkdownContent content={m.content} onNavigate={handleInternalNavigate} />
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
