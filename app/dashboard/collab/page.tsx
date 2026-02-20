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
    MessageSquare, Code, Check
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANG_MAP: Record<string, string> = { python: 'python', javascript: 'javascript', cpp: 'cpp', java: 'java' };

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

    const syncRef = useRef<any>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

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
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

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
                // Only update code if it differs (to avoid cursor jump)
            } catch { }
        }, 3000);
    };

    // Sync code to server on change (debounced)
    const syncCode = useCallback(async (newCode: string) => {
        if (!room) return;
        try {
            await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sync', roomSlug: room.slug, code: newCode, language }),
            });
        } catch { }
    }, [room, language]);

    const syncTimerRef = useRef<any>(null);
    const handleCodeChange = (val: string | undefined) => {
        const v = val || '';
        setCode(v);
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(() => syncCode(v), 1000);
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
                </div>

                {/* Sidebar: Participants + Chat */}
                <Card className="border-white/10 bg-background/40 flex flex-col overflow-hidden">
                    {/* Participants */}
                    <div className="p-3 border-b border-white/5">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">PARTICIPANTS ({participants.length})</h4>
                        <div className="space-y-1.5">
                            {participants.map((p: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="truncate">{p.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-3 border-b border-white/5">
                            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" /> CHAT
                            </h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {chatMessages.map((m: any, i: number) => (
                                <div key={i} className="text-xs">
                                    <span className="font-bold text-primary">{m.username}: </span>
                                    <span className="text-muted-foreground">{m.message}</span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-2 border-t border-white/5 flex gap-1.5">
                            <Input
                                placeholder="Type a message..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                                className="bg-background/50 border-white/10 text-xs h-8"
                            />
                            <Button size="icon" className="h-8 w-8 shrink-0" onClick={sendChat} disabled={!chatInput.trim()}>
                                <Send className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
