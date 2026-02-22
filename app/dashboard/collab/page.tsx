"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import {
    Users2, Plus, Copy, LogIn, LogOut, Send, Loader2,
    MessageSquare, Code, Check, Play, Bot, TerminalSquare, X
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANG_MAP: Record<string, string> = { python: 'python', javascript: 'javascript', cpp: 'cpp', java: 'java' };
const JUDGE0_LANG_MAP: Record<string, number> = { python: 71, javascript: 63, cpp: 54, java: 62 };

type RoomState = 'lobby' | 'active';

export default function CollabPage() {
    const [state, setState] = useState<RoomState>('lobby');
    const [rooms, setRooms] = useState<any[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [roomName, setRoomName] = useState('');
    const [joinSlug, setJoinSlug] = useState('');
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);

    // Active room state
    const [room, setRoom] = useState<any>(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [participants, setParticipants] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);

    // Execution state
    const [executing, setExecuting] = useState(false);
    const [execOutput, setExecOutput] = useState<{ stdout: string; stderr: string; status: string } | null>(null);
    const [showOutput, setShowOutput] = useState(true);

    // AI Chat state
    const [activeTab, setActiveTab] = useState<'chat' | 'ai'>('chat');
    const [aiInput, setAiInput] = useState('');
    const [aiMessages, setAiMessages] = useState<any[]>([{ role: 'system', content: 'Hi there! I am Ganapathi AI. How can I help you with this code?' }]);
    const [aiLoading, setAiLoading] = useState(false);
    const aiChatEndRef = useRef<HTMLDivElement>(null);

    const syncRef = useRef<any>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const lastTypedRef = useRef<number>(0);

    // Fetch rooms for lobby
    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/rooms');
            const data = await res.json();
            setRooms(data.rooms || []);
        } catch (e) { console.error(e); }
        finally { setLoadingRooms(false); }
    };

    useEffect(() => { fetchRooms(); }, []);

    // Auto-scroll chat
    const prevMessageCountRef = useRef(0);
    useEffect(() => {
        if (chatMessages.length > prevMessageCountRef.current) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            prevMessageCountRef.current = chatMessages.length;
        }
    }, [chatMessages]);

    useEffect(() => {
        if (activeTab === 'ai') {
            aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [aiMessages, activeTab]);

    // Create room
    const createRoom = async () => {
        setCreating(true);
        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', name: roomName || 'Coding Room', language }),
            });
            const data = await res.json();
            if (data.room) {
                await joinRoom(data.room.slug);
            }
        } catch (e) { console.error(e); }
        finally { setCreating(false); }
    };

    // Join room
    const joinRoom = async (slug: string) => {
        setJoining(true);
        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'join', roomSlug: slug }),
            });
            const data = await res.json();
            if (data.room) {
                setRoom(data.room);
                setCode(data.room.code || '');
                setLanguage(data.room.language || 'python');
                setParticipants(data.room.participants || []);
                setChatMessages(data.room.chat_messages || []);
                setState('active');
                startSync(data.room.slug);
            }
        } catch (e) { console.error(e); }
        finally { setJoining(false); }
    };

    // Start polling for sync
    const startSync = (slug: string) => {
        if (syncRef.current) clearInterval(syncRef.current);
        syncRef.current = setInterval(async () => {
            try {
                const res = await fetch('/api/rooms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'sync', roomSlug: slug }),
                });
                const data = await res.json();
                if (data.participants) setParticipants(data.participants);
                if (data.chat_messages) setChatMessages(data.chat_messages);

                if (data.code !== undefined) {
                    setCode(prevCode => {
                        if (Date.now() - lastTypedRef.current > 1500 && data.code !== prevCode) {
                            return data.code;
                        }
                        return prevCode;
                    });
                }
                if (data.language) {
                    setLanguage(prevLang => {
                        if (Date.now() - lastTypedRef.current > 1500 && data.language !== prevLang) {
                            return data.language;
                        }
                        return prevLang;
                    });
                }
            } catch { }
        }, 1000);
    };

    // Sync code to server on change (debounced)
    const syncCode = useCallback(async (newCode: string, forceLanguage?: string) => {
        if (!room) return;
        try {
            await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sync', roomSlug: room.slug, code: newCode, language: forceLanguage || language }),
            });
        } catch { }
    }, [room, language]);

    const syncTimerRef = useRef<any>(null);
    const handleCodeChange = (val: string | undefined) => {
        const v = val || '';
        setCode(v);
        lastTypedRef.current = Date.now();
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(() => syncCode(v), 400);
    };

    const handleLanguageChange = (val: string) => {
        setLanguage(val);
        lastTypedRef.current = Date.now();
        syncCode(code, val);
    };

    // Send chat
    const sendChat = async () => {
        if (!chatInput.trim() || !room) return;
        try {
            await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'chat', roomSlug: room.slug, message: chatInput }),
            });
            setChatInput('');
        } catch { }
    };

    // Execute Code
    const runCode = async () => {
        if (!code.trim()) return;
        setExecuting(true);
        setShowOutput(true);
        setExecOutput(null);
        try {
            const langId = JUDGE0_LANG_MAP[language] || 71;
            const res = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, lang: langId }),
            });
            const data = await res.json();
            setExecOutput({
                stdout: data.stdout || '',
                stderr: data.stderr || '',
                status: data.status || (data.success ? 'Accepted' : 'Error')
            });
        } catch (e) {
            setExecOutput({ stdout: '', stderr: 'Execution failed.', status: 'Error' });
        } finally {
            setExecuting(false);
        }
    };

    // Send AI Chat
    const sendAiChat = async () => {
        if (!aiInput.trim()) return;
        const msg = aiInput;
        setAiInput('');
        setAiMessages(prev => [...prev, { role: 'user', content: msg }]);
        setAiLoading(true);

        try {
            const contextMsg = msg + `\n\n[Context: The user is currently looking at this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`]`;
            const formattedMessages = [
                ...aiMessages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: contextMsg }
            ];

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: formattedMessages,
                    context: 'Collab Code Editor'
                }),
            });

            const text = await res.text();
            setAiMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } catch (e) {
            setAiMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't reach the AI server right now." }]);
        } finally {
            setAiLoading(false);
        }
    };

    // Leave room
    const leaveRoom = async () => {
        if (room) {
            if (syncRef.current) clearInterval(syncRef.current);
            try {
                await fetch('/api/rooms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'leave', roomSlug: room.slug }),
                });
            } catch { }
        }
        setRoom(null);
        setState('lobby');
        fetchRooms();
    };

    const copyLink = () => {
        if (!room) return;
        navigator.clipboard.writeText(room.slug);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ─── Lobby ────────────────────────────────────────────────────────
    if (state === 'lobby') {
        return (
            <PageShell>
                <PageHeader title="Collab Coding" description="Create or join live coding rooms. Code together in real-time." icon={Users2} />

                {/* Create Room */}
                <Card className="border-white/10 bg-background/40 mb-8">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Plus className="h-4 w-4 text-emerald-400" /> Create a Room
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-3">
                        <Input
                            placeholder="Room name (e.g. DSA Practice)"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="bg-background/50 border-white/10 flex-1"
                        />
                        <Select value={language} onValueChange={setLanguage}>
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
                        <Button onClick={createRoom} disabled={creating} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 font-semibold">
                            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Create
                        </Button>
                    </CardContent>
                </Card>

                {/* Join by Code */}
                <Card className="border-white/10 bg-background/40 mb-8">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <LogIn className="h-4 w-4 text-blue-400" /> Join with Room Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-3">
                        <Input
                            placeholder="Paste room code..."
                            value={joinSlug}
                            onChange={(e) => setJoinSlug(e.target.value)}
                            className="bg-background/50 border-white/10 flex-1 font-mono"
                        />
                        <Button onClick={() => joinRoom(joinSlug)} disabled={joining || !joinSlug.trim()} variant="outline">
                            {joining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                            Join
                        </Button>
                    </CardContent>
                </Card>

                {/* Active Rooms */}
                <h3 className="text-lg font-bold mb-4">🟢 Active Rooms</h3>
                {loadingRooms ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : rooms.length === 0 ? (
                    <Card className="border-dashed border-white/10 bg-background/30 text-center py-12">
                        <CardContent>
                            <Users2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                            <p className="text-muted-foreground">No active rooms. Create one to get started!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {rooms.map((r: any) => (
                            <Card key={r.slug} className="border-white/10 bg-background/40 hover:bg-background/60 transition-all cursor-pointer group"
                                onClick={() => joinRoom(r.slug)}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-bold group-hover:text-primary transition-colors">{r.name}</h4>
                                        <Badge variant="outline" className="text-[10px] border-white/10">{r.language}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>by {r.host_name || 'Unknown'}</span>
                                        <span className="flex items-center gap-1">
                                            <Users2 className="h-3 w-3" /> {r.participant_count}/{r.max_participants}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </PageShell>
        );
    }

    // ─── Active Room ──────────────────────────────────────────────────
    return (
        <div className="min-h-screen p-4 md:p-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Code className="h-5 w-5 text-emerald-400" />
                    <h1 className="text-lg font-bold truncate">{room?.name || 'Room'}</h1>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users2 className="h-3 w-3" /> {participants.length}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={copyLink} className="text-xs border-white/10">
                        {copied ? <Check className="h-3 w-3 mr-1 text-emerald-400" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copied ? 'Copied!' : room?.slug}
                    </Button>
                    <Button variant="outline" size="sm" onClick={leaveRoom} className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10">
                        <LogOut className="h-3 w-3 mr-1" /> Leave
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px] gap-4 h-[calc(100vh-160px)]">
                {/* Editor */}
                <div className="flex flex-col gap-3 min-h-0">
                    <div className="flex items-center gap-2">
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
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9"
                            onClick={runCode}
                            disabled={executing}
                        >
                            {executing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                            Run Code
                        </Button>
                        <div className="flex-1" />
                        <div className="flex -space-x-2">
                            {participants.slice(0, 5).map((p: any, i: number) => (
                                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-background" title={p.username}>
                                    {p.username?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            ))}
                        </div>
                    </div>
                    <Card className="flex-1 border-white/10 overflow-hidden min-h-[300px]">
                        <MonacoEditor
                            height="100%"
                            language={LANG_MAP[language] || 'python'}
                            theme="vs-dark"
                            value={code}
                            onChange={handleCodeChange}
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

                    {/* Output Panel */}
                    {execOutput && showOutput && (
                        <Card className="border-white/10 bg-black/60 overflow-hidden h-48 shrink-0 flex flex-col">
                            <div className="flex items-center justify-between p-2 border-b border-white/10 bg-white/5">
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                    <TerminalSquare className="h-4 w-4 text-emerald-400" />
                                    Execution Output
                                    <Badge variant="outline" className={`ml-2 text-[10px] ${execOutput.status === 'Accepted' ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'}`}>
                                        {execOutput.status}
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowOutput(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="p-3 overflow-y-auto text-xs font-mono flex-1">
                                {execOutput.stdout && (
                                    <div className="mb-3">
                                        <div className="text-white/50 mb-1">STDOUT:</div>
                                        <div className="text-emerald-300 whitespace-pre-wrap">{execOutput.stdout}</div>
                                    </div>
                                )}
                                {execOutput.stderr && (
                                    <div>
                                        <div className="text-white/50 mb-1">STDERR:</div>
                                        <div className="text-red-400 whitespace-pre-wrap">{execOutput.stderr}</div>
                                    </div>
                                )}
                                {!execOutput.stdout && !execOutput.stderr && (
                                    <div className="text-muted-foreground italic">No output</div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar: AI + Room Chat */}
                <Card className="border-white/10 bg-background/40 flex flex-col overflow-hidden">
                    {/* Header Tabs */}
                    <div className="flex border-b border-white/5">
                        <button
                            className={`flex-1 p-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'bg-white/5 text-emerald-400 border-b-2 border-emerald-400' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            <MessageSquare className="h-3 w-3" /> ROOM
                        </button>
                        <button
                            className={`flex-1 p-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'ai' ? 'bg-white/5 text-purple-400 border-b-2 border-purple-400' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
                            onClick={() => setActiveTab('ai')}
                        >
                            <Bot className="h-3 w-3" /> AI ASSIST
                        </button>
                    </div>

                    {activeTab === 'chat' ? (
                        <>
                            {/* Participants */}
                            <div className="p-3 border-b border-white/5 bg-black/20">
                                <h4 className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">PARTICIPANTS ({participants.length})</h4>
                                <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                                    {participants.map((p: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                                            <span className="truncate">{p.username}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chat */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {chatMessages.map((m: any, i: number) => (
                                        <div key={i} className="text-sm bg-black/20 p-2.5 rounded-lg border border-white/5">
                                            <span className="font-bold text-emerald-400 mr-2">{m.username}:</span>
                                            <span className="text-white/90">{m.message}</span>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                                <div className="p-3 border-t border-white/5 flex gap-2 bg-black/20">
                                    <Input
                                        placeholder="Message room..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                                        className="bg-background/50 border-white/10 text-sm h-9"
                                    />
                                    <Button size="icon" className="h-9 w-9 shrink-0 bg-emerald-600 hover:bg-emerald-700" onClick={sendChat} disabled={!chatInput.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-purple-900/10 to-background/40">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {aiMessages.map((m: any, i: number) => (
                                    <div key={i} className={`text-sm p-3.5 rounded-xl shadow-lg border ${m.role === 'user' ? 'bg-white/5 border-white/10 ml-6 rounded-tr-sm' : 'bg-purple-500/10 border-purple-500/20 mr-6 rounded-tl-sm'}`}>
                                        <div className={`font-bold mb-1.5 text-[10px] uppercase tracking-wider flex items-center gap-1.5 ${m.role === 'user' ? 'text-muted-foreground' : 'text-purple-400'}`}>
                                            {m.role === 'user' ? 'You' : <><Bot className="h-3 w-3" /> Ganapathi AI</>}
                                        </div>
                                        <div className="whitespace-pre-wrap text-white/90 leading-relaxed font-medium">
                                            {m.role === 'system' ? m.content : m.content}
                                        </div>
                                    </div>
                                ))}
                                {aiLoading && (
                                    <div className="text-sm p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 mr-6 flex items-center gap-3 w-fit rounded-tl-sm">
                                        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                                        <span className="text-purple-200/70 font-medium animate-pulse">Analyzing code...</span>
                                    </div>
                                )}
                                <div ref={aiChatEndRef} />
                            </div>
                            <div className="p-3 border-t border-purple-500/20 flex gap-2 bg-black/40 backdrop-blur-md">
                                <Input
                                    placeholder="Ask AI to explain or debug this code..."
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendAiChat()}
                                    className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500/50 text-sm h-9"
                                    disabled={aiLoading}
                                />
                                <Button size="icon" className="h-9 w-9 shrink-0 bg-purple-600 hover:bg-purple-700 shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all" onClick={sendAiChat} disabled={!aiInput.trim() || aiLoading}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
