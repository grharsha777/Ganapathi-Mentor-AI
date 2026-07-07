'use client';

import { useMemo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import {
    Activity, Brain, ChevronRight, Copy, Eye, FileCode2, FolderTree, Loader2,
    Plug, RefreshCw, Search, Terminal, Unplug, Wifi, WifiOff, Zap, GitBranch,
    GitCommitHorizontal, Save, Play, Send, ArrowUpFromLine, ArrowDownFromLine,
    FileText, AlertCircle, X, BarChart3, Sparkles, Bug, Filter, Key, Github,
    Settings, MessageSquare, CheckCircle2, XCircle, Info, ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    TreeView, ScoreBar, CommandPalette, EXT_LANG, EXT_ICON, GIT_COLOR,
    AI_PROVIDERS, flattenTree, MarkdownContent,
} from './_components';
import { useHiveIDE } from './_hooks';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function HiveMindPage() {
    const h = useHiveIDE();

    const allFiles = useMemo(() => h.tree ? flattenTree(h.tree) : [], [h.tree]);

    const filteredDebugLogs = h.debugFilter === 'all' ? h.debugLogs : h.debugLogs.filter(l => l.level === h.debugFilter);

    /* ═══════════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════════ */
    return (
        <div className="fixed inset-0 z-[100] w-full flex flex-col overflow-hidden bg-[#0c0c14]">

            {/* ═══════ CONNECT OVERLAY ═══════ */}
            <AnimatePresence>
                {h.conn !== 'connected' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center rounded-xl p-4 md:p-8">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-[#0e0e16] border border-white/[0.08] rounded-2xl flex flex-col md:flex-row overflow-hidden max-w-4xl w-full shadow-2xl">
                            {/* Left Side: Documentation */}
                            <div className="flex-1 p-8 bg-white/[0.02] border-r border-white/[0.04] space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
                                        <h2 className="text-xl font-black text-white">Hive Mind Setup</h2>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed">
                                        Connect your local project terminal to the Hive Mind IDE. Follow the steps below to establish a secure WebSocket bridge.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">1</span>
                                            <p className="text-xs font-semibold text-white/80">Install CLI Package</p>
                                        </div>
                                        <div className="flex items-center bg-black/50 border border-white/[0.06] rounded-xl p-2 pl-3">
                                            <code className="text-[11px] text-amber-200/70 font-mono flex-1">pip install ganapathi-mentor-ai</code>
                                            <button onClick={() => { navigator.clipboard.writeText('pip install ganapathi-mentor-ai'); toast.success('Copied!'); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group">
                                                <Copy className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">2</span>
                                            <p className="text-xs font-semibold text-white/80">Login to Ganapathi</p>
                                        </div>
                                        <p className="text-[10px] text-white/40 mb-2 ml-7">This opens your browser to get your auth token.</p>
                                        <div className="flex items-center bg-black/50 border border-white/[0.06] rounded-xl p-2 pl-3">
                                            <code className="text-[11px] text-amber-200/70 font-mono flex-1">python -m ganapathi login</code>
                                            <button onClick={() => { navigator.clipboard.writeText('python -m ganapathi login'); toast.success('Copied!'); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group">
                                                <Copy className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-white/40 ml-7 mt-2">It will open <code className="text-amber-400/60">ganapathi-mentor-ai.vercel.app/auth/cli</code> — copy the token shown and paste it back in the terminal.</p>
                                    </div>

                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">3</span>
                                            <p className="text-xs font-semibold text-white/80">Start the Hive Mind Bridge</p>
                                        </div>
                                        <p className="text-[10px] text-white/40 mb-2 ml-7">Navigate to your project folder in a terminal and run:</p>
                                        <div className="flex items-center bg-black/50 border border-white/[0.06] rounded-xl p-2 pl-3">
                                            <code className="text-[11px] text-amber-200/70 font-mono flex-1">python -m ganapathi hive-mind start --path ./</code>
                                            <button onClick={() => { navigator.clipboard.writeText('python -m ganapathi hive-mind start --path ./'); toast.success('Copied!'); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group">
                                                <Copy className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">4</span>
                                            <p className="text-xs font-semibold text-white/80">Connect Here</p>
                                        </div>
                                        <p className="text-[10px] text-white/40 ml-7">Copy the <strong className="text-white/60">Connection Key</strong> and <strong className="text-white/60">WebSocket URL</strong> from the terminal output and paste them on the right, then click Connect.</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Side: Connection Form */}
                            <div className="flex-1 p-8 flex flex-col justify-center">
                                <h3 className="text-sm font-bold text-white mb-6">Connect Bridge</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-white/25 uppercase tracking-widest">WebSocket URL</label>
                                        <Input value={h.wsUrl} onChange={e => h.setWsUrl(e.target.value)} className="bg-black/40 border-white/[0.06] font-mono text-xs h-11 rounded-xl" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[9px] font-bold text-white/25 uppercase tracking-widest">Connection Key</label>
                                        </div>
                                        <Input value={h.token} onChange={e => h.setToken(e.target.value.trim())} type="password" placeholder="Paste 64-character Connection Key..." className="bg-black/40 border-white/[0.06] font-mono text-xs h-11 rounded-xl" />
                                        {h.token.startsWith('eyJ') && (
                                            <p className="text-[10px] text-rose-400 mt-1.5 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                                                ⚠️ This looks like a Login JWT. You need to paste the 64-character <strong>Connection Key</strong> printed by the <code>ganapathi hive-mind start</code> command.
                                            </p>
                                        )}
                                    </div>
                                    <Button onClick={h.connect} disabled={h.conn === 'connecting'}
                                        className="w-full mt-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold h-12 rounded-xl shadow-lg shadow-amber-500/10">
                                        {h.conn === 'connecting' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plug className="w-4 h-4 mr-2" />}
                                        {h.conn === 'connecting' ? 'Connecting...' : h.conn === 'error' ? 'Retry Connection' : 'Connect to IDE'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════ COMMAND PALETTE ═══════ */}
            <CommandPalette open={h.showCmdPalette} onClose={() => h.setShowCmdPalette(false)} files={allFiles} onSelect={h.openFile} />

            {/* ═══════ TOP BAR (Enterprise Branded) ═══════ */}
            <div className="h-16 flex items-center px-6 border-b border-white/[0.08] bg-[#0c0c16] shrink-0 gap-6 shadow-2xl relative z-20">
                {/* Branding Left */}
                <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow-lg shadow-violet-500/20 flex-shrink-0">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-black text-lg tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300">
                            GANAPATHI MENTOR AI
                        </h1>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-amber-500/30 text-amber-500 gap-1 text-[8px] h-4 leading-none bg-amber-500/5 px-1.5 font-black uppercase tracking-widest">
                                <Activity className="w-2 h-2 animate-pulse" /> HIVE MIND IDE
                            </Badge>
                            {h.conn === 'connected' && (
                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                    {h.project}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Center Actions (Search, etc) */}
                <div className="flex-1 flex justify-center max-w-xl mx-auto">
                    <button 
                        onClick={() => h.setShowCmdPalette(true)} 
                        className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/10 text-xs text-white/40 transition-all w-full max-w-md shadow-inner"
                    >
                        <Search className="w-3.5 h-3.5 group-hover:text-violet-400 transition-colors" /> 
                        <span className="flex-1 text-left">Search symbols or files...</span>
                        <div className="flex gap-1 items-center bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-white/30 uppercase">
                            <span className="text-[10px]">⌘</span>P
                        </div>
                    </button>
                </div>

                {/* Right Actions & User Profile */}
                <div className="flex items-center gap-3">
                    {h.conn === 'connected' && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[10px] font-bold h-9 border border-red-500/10 gap-2" 
                            onClick={h.disconnect}
                        >
                            <Unplug className="w-3.5 h-3.5" /> Disconnect
                        </Button>
                    )}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] font-bold" 
                        onClick={() => window.location.href = '/dashboard'}
                    >
                        <X className="w-3.5 h-3.5 mr-2" /> Exit Session
                    </Button>
                    
                    {/* Visual Divider */}
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    
                    {/* Mock User Node (Matches Dashboard Styling) */}
                    <div className="flex items-center gap-3 pl-2">
                        <div className="hidden xl:flex flex-col items-end">
                            <span className="text-[11px] font-bold text-white/90 leading-none mb-1">Developer Admin</span>
                            <span className="text-[9px] text-white/30 font-medium tracking-tight">Active IDE Session</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center border border-white/20 shadow-lg shadow-violet-500/20">
                            <span className="text-xs font-black text-white">HI</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ MAIN IDE LAYOUT ═══════ */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* ── Activity Bar ── */}
                <div className="w-11 bg-[#09091280] flex flex-col items-center py-2 gap-0.5 border-r border-white/[0.04] shrink-0">
                    {([
                        { id: 'explorer' as const, icon: FolderTree, label: 'Explorer', color: 'text-amber-400' },
                        { id: 'search' as const, icon: Search, label: 'Search', color: 'text-blue-400' },
                        { id: 'git' as const, icon: GitBranch, label: 'Git', color: 'text-orange-400' },
                        { id: 'github' as const, icon: Github, label: 'GitHub', color: 'text-white' },
                        { id: 'settings' as const, icon: Key, label: 'AI Keys', color: 'text-violet-400' },
                    ]).map(item => (
                        <button key={item.id} onClick={() => h.setSidebarView(item.id)} title={item.label}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${h.sidebarView === item.id ? 'bg-white/[0.06] ' + item.color : 'text-white/20 hover:text-white/40 hover:bg-white/[0.03]'}`}>
                            <item.icon className="w-4 h-4" />
                        </button>
                    ))}
                    {h.gitStatus && !h.gitStatus.clean && h.sidebarView !== 'git' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse -mt-3 ml-5" />
                    )}
                </div>

                <PanelGroup direction="horizontal">
                    {/* ═══════ SIDEBAR PANEL ═══════ */}
                    <Panel defaultSize={18} minSize={14} maxSize={35}>
                        <div className="h-full flex flex-col bg-[#0e0e17] border-r border-white/[0.04]">
                            <div className="px-3 py-2 border-b border-white/[0.04] shrink-0">
                                <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest">
                                    {h.sidebarView === 'explorer' ? 'Explorer' : h.sidebarView === 'search' ? 'Search' : h.sidebarView === 'git' ? 'Source Control' : h.sidebarView === 'github' ? 'GitHub Push' : 'AI Settings'}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar">
                                {/* EXPLORER */}
                                {h.sidebarView === 'explorer' && (<>
                                    <div className="px-1.5 mb-2 flex gap-1">
                                        <Input value={h.searchQ} onChange={e => h.setSearchQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && h.handleSearch()} placeholder="Search files..." className="bg-black/30 border-white/[0.06] text-[10px] h-6" />
                                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={h.handleSearch}><Search className="w-2.5 h-2.5 text-white/30" /></Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => h.send({ action: 'tree' })}><RefreshCw className="w-2.5 h-2.5 text-white/20" /></Button>
                                    </div>
                                    <AnimatePresence>
                                        {h.searchResults.length > 0 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[9px] text-primary font-bold">{h.searchResults.length} results</span>
                                                    <button onClick={() => h.setSearchResults([])}><X className="w-2.5 h-2.5 text-white/20 hover:text-white" /></button>
                                                </div>
                                                {h.searchResults.slice(0, 20).map((r: any, i: number) => (
                                                    <button key={i} onClick={() => { h.openFile(r.path); h.setSearchResults([]); }}
                                                        className="w-full text-left text-[10px] py-0.5 px-1.5 rounded hover:bg-white/5 text-white/50 truncate block">{r.path}</button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {h.tree ? h.tree.children?.map((c, i) => <TreeView key={i} node={c} depth={0} onSelect={h.openFile} selected={h.selectedFile} />) : (
                                        <div className="text-center py-8"><Loader2 className="w-3 h-3 animate-spin mx-auto text-white/15" /></div>
                                    )}
                                    {h.changes.length > 0 && (
                                        <div className="mt-3 p-2 border-t border-white/[0.04]">
                                            <div className="flex items-center gap-1 mb-1"><Activity className="w-2.5 h-2.5 text-amber-400/60" /><span className="text-[8px] font-bold text-white/20 uppercase">Live Changes</span></div>
                                            {h.changes.slice(-4).reverse().map((c: any, i: number) => (
                                                <div key={i} className="flex items-center gap-1.5 py-0.5 text-[9px] text-white/30 truncate">
                                                    <span className={c.action === 'created' ? 'text-emerald-400/60' : c.action === 'deleted' ? 'text-red-400/60' : 'text-blue-400/60'}>●</span>
                                                    <span className="truncate">{c.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>)}

                                {/* SEARCH */}
                                {h.sidebarView === 'search' && (
                                    <div className="px-1.5 space-y-2">
                                        <Input value={h.searchQ} onChange={e => h.setSearchQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && h.handleSearch()} placeholder="Search in project..." className="bg-black/30 border-white/[0.06] text-[10px] h-7" autoFocus />
                                        <Button variant="ghost" size="sm" className="w-full text-[10px] h-7 gap-1" onClick={h.handleSearch}><Search className="w-3 h-3" /> Search</Button>
                                        {h.searchResults.map((r: any, i: number) => (
                                            <button key={i} onClick={() => h.openFile(r.path)} className="w-full text-left text-[10px] py-1 px-2 rounded hover:bg-white/5 text-white/50 truncate block">{r.path}</button>
                                        ))}
                                    </div>
                                )}

                                {/* GIT */}
                                {h.sidebarView === 'git' && (
                                    <div className="px-1.5 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <GitBranch className="w-4 h-4 text-orange-400" />
                                            <span className="text-xs font-bold text-white">{h.gitStatus?.branch || '...'}</span>
                                            {h.gitStatus?.clean ? <Badge className="text-[7px] bg-emerald-500/8 text-emerald-400/80 border-emerald-500/15 h-4">Clean</Badge>
                                                : <Badge className="text-[7px] bg-amber-500/8 text-amber-400/80 border-amber-500/15 h-4">{h.gitStatus?.files.length} changed</Badge>}
                                            <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => h.gitAction('status')}><RefreshCw className={`w-2.5 h-2.5 ${h.gitLoading === 'status' ? 'animate-spin' : ''} text-white/20`} /></Button>
                                        </div>
                                        {h.gitStatus && h.gitStatus.files.length > 0 && (
                                            <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
                                                {h.gitStatus.files.map((f, i) => (
                                                    <button key={i} onClick={() => h.openFile(f.file)} className="flex items-center gap-2 w-full text-left p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                                                        <Badge className={`text-[7px] w-4 h-4 flex items-center justify-center p-0 rounded ${GIT_COLOR[f.status] || 'bg-white/5'}`}>{f.status}</Badge>
                                                        <span className="text-[10px] text-white/50 truncate">{f.file}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <div className="space-y-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                            <Input value={h.commitMsg} onChange={e => h.setCommitMsg(e.target.value)} placeholder="Commit message..." className="bg-black/30 border-white/[0.06] text-[10px] h-7"
                                                onKeyDown={e => { if (e.key === 'Enter') { h.gitAction('commit', { message: h.commitMsg || 'Update from Hive' }); h.setCommitMsg(''); } }} />
                                            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold h-7 gap-1"
                                                onClick={() => { h.gitAction('commit', { message: h.commitMsg || 'Update from Hive' }); h.setCommitMsg(''); }} disabled={!!h.gitLoading}>
                                                {h.gitLoading === 'commit' ? <Loader2 className="w-3 h-3 animate-spin" /> : <GitCommitHorizontal className="w-3 h-3" />} Commit
                                            </Button>
                                            <div className="grid grid-cols-2 gap-1">
                                                <Button variant="outline" size="sm" className="text-[9px] h-6 gap-1 border-white/[0.06]" onClick={() => h.gitAction('push')} disabled={!!h.gitLoading}>
                                                    <ArrowUpFromLine className="w-3 h-3" /> Push
                                                </Button>
                                                <Button variant="outline" size="sm" className="text-[9px] h-6 gap-1 border-white/[0.06]" onClick={() => h.gitAction('pull')} disabled={!!h.gitLoading}>
                                                    <ArrowDownFromLine className="w-3 h-3" /> Pull
                                                </Button>
                                            </div>
                                        </div>
                                        {h.gitLog.length > 0 && (
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-bold text-white/20 uppercase">Recent Commits</span>
                                                {h.gitLog.slice(0, 8).map((c: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg border border-white/[0.03] text-[9px]">
                                                        <code className="text-primary/70 font-mono shrink-0">{c.hash}</code>
                                                        <span className="text-white/40 truncate flex-1">{c.message}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* GITHUB PUSH */}
                                {h.sidebarView === 'github' && (
                                    <div className="px-1.5 space-y-3">
                                        <div className="flex items-center gap-2 mb-1"><Github className="w-4 h-4 text-white" /><span className="text-xs font-bold text-white">GitHub Push</span></div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-bold text-white/20 uppercase">Personal Access Token</label>
                                            <div className="flex gap-1">
                                                <Input value={h.ghToken} onChange={e => h.setGhToken(e.target.value)} type="password" placeholder="ghp_..." className="bg-black/30 border-white/[0.06] text-[10px] h-7" />
                                                <Button variant="ghost" size="sm" className="h-7 text-[9px] px-2 shrink-0" onClick={h.checkGhUser} disabled={h.ghLoading === 'user'}>
                                                    {h.ghLoading === 'user' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Verify'}
                                                </Button>
                                            </div>
                                        </div>
                                        {h.ghUser && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-[10px] text-emerald-400 font-semibold">{h.ghUser.login}</span>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-bold text-white/20 uppercase">Repository (owner/name)</label>
                                            <div className="flex gap-1">
                                                <Input value={h.ghRepoName} onChange={e => h.setGhRepoName(e.target.value)} placeholder="user/repo" className="bg-black/30 border-white/[0.06] text-[10px] h-7" />
                                                <Button variant="ghost" size="sm" className="h-7 text-[9px] px-2 shrink-0" onClick={h.checkGhRepo} disabled={h.ghLoading === 'repo'}>Check</Button>
                                            </div>
                                        </div>
                                        {h.ghRepoInfo ? (
                                            <div className="p-2 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15">
                                                <div className="text-[10px] text-emerald-400 font-semibold">{h.ghRepoInfo.full_name || h.ghRepoInfo.name}</div>
                                                <div className="text-[9px] text-white/30 mt-0.5">{h.ghRepoInfo.html_url || h.ghRepoInfo.url}</div>
                                            </div>
                                        ) : h.ghRepoName && h.ghUser && (
                                            <Button size="sm" className="w-full text-[10px] h-7 bg-violet-600 hover:bg-violet-500" onClick={h.createGhRepo} disabled={h.ghLoading === 'create'}>
                                                {h.ghLoading === 'create' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Create Repository
                                            </Button>
                                        )}
                                        <Button size="sm" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-[10px] font-bold h-8 gap-1"
                                            onClick={h.pushToGh} disabled={!h.ghRepoInfo && !h.ghRepoName}>
                                            <ArrowUpFromLine className="w-3 h-3" /> Push to GitHub
                                        </Button>
                                        <p className="text-[8px] text-white/15 leading-relaxed">🔒 Your token is stored locally in your browser only. Never sent to our servers.</p>
                                    </div>
                                )}

                                {/* AI SETTINGS */}
                                {h.sidebarView === 'settings' && (
                                    <div className="px-1.5 space-y-3">
                                        <div className="flex items-center gap-2 mb-1"><Key className="w-4 h-4 text-violet-400" /><span className="text-xs font-bold text-white">AI Configuration</span></div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-bold text-white/20 uppercase">Provider</label>
                                            <select value={h.aiProvider} onChange={e => { h.setAiProvider(e.target.value); h.setAiModel(''); }}
                                                className="w-full bg-black/40 border border-white/[0.06] rounded-md text-[10px] text-white/70 h-7 px-2 outline-none">
                                                {AI_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-bold text-white/20 uppercase">API Key</label>
                                            <Input value={h.aiApiKey} onChange={e => h.setAiApiKey(e.target.value)} type="password" placeholder="Paste API key..." className="bg-black/30 border-white/[0.06] text-[10px] h-7" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-bold text-white/20 uppercase">Model</label>
                                            <select value={h.aiModel} onChange={e => h.setAiModel(e.target.value)}
                                                className="w-full bg-black/40 border border-white/[0.06] rounded-md text-[10px] text-white/70 h-7 px-2 outline-none">
                                                <option value="">Default</option>
                                                {AI_PROVIDERS.find(p => p.id === h.aiProvider)?.models.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <p className="text-[8px] text-white/15 leading-relaxed">🔒 Keys stored in browser localStorage only. Sent per-request via HTTPS, never persisted on server.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-[2px] bg-white/[0.03] hover:bg-primary/40 active:bg-primary/60 transition-colors cursor-col-resize" />

                    {/* ═══════ EDITOR + BOTTOM ═══════ */}
                    <Panel>
                        <PanelGroup direction="vertical">
                            {/* ── Editor Area ── */}
                            <Panel defaultSize={65} minSize={25}>
                                <div className="h-full flex flex-col bg-[#0d0d16] overflow-hidden">
                                    {/* Tab Bar */}
                                    <div className="flex items-center gap-0.5 px-2 h-8 border-b border-white/[0.04] bg-[#0b0b14] shrink-0 overflow-x-auto scrollbar-none">
                                        {h.openTabs.map(tab => (
                                            <button key={tab.path} onClick={() => h.setActiveTabPath(tab.path)}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-t-md text-[10px] font-medium shrink-0 transition-all ${h.activeTabPath === tab.path ? 'bg-[#0d0d16] text-white border-t border-x border-white/[0.06]' : 'text-white/30 hover:text-white/50'}`}>
                                                <span className="text-[9px]">{EXT_ICON[tab.extension] || '📄'}</span>
                                                {tab.name}
                                                {tab.content !== tab.originalContent && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                                                <button onClick={e => { e.stopPropagation(); h.closeTab(tab.path); }} className="ml-1 hover:text-red-400"><X className="w-2.5 h-2.5" /></button>
                                            </button>
                                        ))}
                                        <div className="ml-auto flex items-center gap-1.5 shrink-0 px-2">
                                            {h.isDirty && <Badge className="text-[7px] bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse h-4">Unsaved</Badge>}
                                            {h.activeTab && (
                                                <Button variant="ghost" size="sm" className="text-[9px] h-5 gap-1 text-emerald-400 hover:bg-emerald-500/10" onClick={h.saveFile} disabled={!h.isDirty || h.saving}>
                                                    {h.saving ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Save className="w-2.5 h-2.5" />} Save
                                                </Button>
                                            )}
                                            {h.selectedFile && (
                                                <Button variant="ghost" size="sm" className="text-[9px] h-5 gap-1 text-violet-400 hover:bg-violet-500/10" onClick={h.handlePredict} disabled={h.predicting}>
                                                    {h.predicting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Brain className="w-2.5 h-2.5" />} ML
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Breadcrumbs */}
                                    {h.activeTab && (
                                        <div className="px-3 py-1 text-[9px] text-white/20 border-b border-white/[0.02] bg-[#0c0c15] shrink-0 truncate">
                                            {h.activeTab.path.split('/').map((p, i, a) => (
                                                <span key={i}>{p}{i < a.length - 1 && <ChevronRight className="w-2.5 h-2.5 inline mx-0.5 text-white/10" />}</span>
                                            ))}
                                        </div>
                                    )}
                                    {/* Monaco Editor */}
                                    <div className="flex-1 min-h-0">
                                        {h.activeTab ? (
                                            <MonacoEditor height="100%" language={h.activeTab.language} theme="vs-dark" value={h.activeTab.content}
                                                onChange={val => h.updateTabContent(h.activeTabPath, val || '')}
                                                options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12, bottom: 12 }, lineNumbers: 'on', automaticLayout: true, wordWrap: 'on', bracketPairColorization: { enabled: true }, smoothScrolling: true, cursorBlinking: 'smooth', cursorSmoothCaretAnimation: 'on', renderWhitespace: 'selection', guides: { indentation: true, bracketPairs: true } }} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center space-y-3">
                                                    <FileText className="w-10 h-10 mx-auto text-white/[0.06]" />
                                                    <p className="text-sm font-medium text-white/20">Select a file from Explorer</p>
                                                    <p className="text-[10px] text-white/10">Or press <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/30 font-mono">Ctrl+P</kbd> to search</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Panel>

                            <PanelResizeHandle className="h-[2px] bg-white/[0.03] hover:bg-primary/40 active:bg-primary/60 transition-colors cursor-row-resize" />

                            {/* ── Bottom Panel ── */}
                            <Panel defaultSize={35} minSize={15} maxSize={70}>
                                <div className="h-full flex flex-col bg-[#0b0b14] overflow-hidden">
                                    {/* Bottom Tabs */}
                                    <div className="flex items-center gap-0.5 px-2 h-7 border-b border-white/[0.04] shrink-0">
                                        {([
                                            { id: 'terminal' as const, label: 'Terminal', icon: Terminal, color: 'text-emerald-400' },
                                            { id: 'debug' as const, label: 'Debug Console', icon: Bug, color: 'text-red-400' },
                                            { id: 'predict' as const, label: 'ML Predict', icon: BarChart3, color: 'text-cyan-400' },
                                        ]).map(tab => (
                                            <button key={tab.id} onClick={() => h.setBottomPanel(tab.id as any)}
                                                className={`flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold transition-all ${h.bottomPanel === tab.id ? 'text-white border-b border-white/20' : 'text-white/25 hover:text-white/40'}`}>
                                                <tab.icon className={`w-3 h-3 ${h.bottomPanel === tab.id ? tab.color : ''}`} /> {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        {/* TERMINAL */}
                                        {h.bottomPanel === 'terminal' && (
                                            <div className="h-full flex flex-col">
                                                <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-5 space-y-2 custom-scrollbar">
                                                    {h.termHistory.length === 0 && <div className="text-white/[0.08] text-center py-8"><Terminal className="w-6 h-6 mx-auto mb-2" /><p className="text-xs">Remote shell • ↑↓ history • Enter to run</p></div>}
                                                    {h.termHistory.map((entry, i) => (
                                                        <div key={i} className="group">
                                                            <div className="flex items-center gap-2"><span className="text-emerald-400/70 select-none">❯</span><span className="text-white/80">{entry.cmd}</span><span className="text-white/[0.08] text-[9px] ml-auto opacity-0 group-hover:opacity-100">{entry.ts}</span></div>
                                                            {entry.stdout && <pre className="text-white/50 whitespace-pre-wrap mt-0.5 ml-4 pl-2 border-l border-white/[0.04] text-[10px]">{entry.stdout}</pre>}
                                                            {entry.stderr && <pre className="text-red-400/60 whitespace-pre-wrap mt-0.5 ml-4 pl-2 border-l border-red-500/15 text-[10px]">{entry.stderr}</pre>}
                                                        </div>
                                                    ))}
                                                    {h.termRunning && <div className="flex items-center gap-2 text-white/20"><Loader2 className="w-3 h-3 animate-spin" /><span className="animate-pulse">Running...</span></div>}
                                                    <div ref={h.termEndRef} />
                                                </div>
                                                <div className="px-3 py-2 border-t border-white/[0.04] flex items-center gap-2 shrink-0">
                                                    <span className="text-emerald-400/70 font-mono text-sm select-none">❯</span>
                                                    <input value={h.termInput} onChange={e => h.setTermInput(e.target.value)} onKeyDown={h.handleTermKeyDown} placeholder="Enter command..."
                                                        className="flex-1 bg-transparent text-[11px] font-mono text-white/80 outline-none placeholder:text-white/[0.08]" disabled={h.termRunning} />
                                                    <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 text-emerald-400/40 hover:text-emerald-400" onClick={h.runCmd} disabled={h.termRunning}><Play className="w-3 h-3" /></Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* DEBUG CONSOLE */}
                                        {h.bottomPanel === 'debug' && (
                                            <div className="h-full flex flex-col">
                                                <div className="flex items-center gap-1 px-3 py-1 border-b border-white/[0.03] shrink-0">
                                                    {(['all', 'info', 'warn', 'error'] as const).map(f => (
                                                        <button key={f} onClick={() => h.setDebugFilter(f)}
                                                            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${h.debugFilter === f ? 'bg-white/[0.06] text-white' : 'text-white/20'}`}>{f}</button>
                                                    ))}
                                                    <button onClick={() => h.addDebugLog('info', 'Console cleared', 'system')} className="ml-auto text-[8px] text-white/20 hover:text-white/40">Clear</button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-[10px] custom-scrollbar">
                                                    {filteredDebugLogs.map((log, i) => (
                                                        <div key={i} className={`flex items-start gap-2 px-2 py-1 rounded ${log.level === 'error' ? 'bg-red-500/[0.04] text-red-400/80' : log.level === 'warn' ? 'bg-amber-500/[0.04] text-amber-400/80' : 'text-blue-400/60'}`}>
                                                            {log.level === 'error' ? <XCircle className="w-3 h-3 shrink-0 mt-0.5" /> : log.level === 'warn' ? <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" /> : <Info className="w-3 h-3 shrink-0 mt-0.5" />}
                                                            <span className="flex-1">{log.message}</span>
                                                            <span className="text-[8px] text-white/15 shrink-0">{log.timestamp}</span>
                                                        </div>
                                                    ))}
                                                    {filteredDebugLogs.length === 0 && <div className="text-center py-8 text-white/10 text-xs">No logs</div>}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI AGENT REMOVED FROM BOTTOM PANEL */}

                                        {/* ML PREDICT */}
                                        {h.bottomPanel === 'predict' && (
                                            <div className="h-full overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                                {h.prediction?.scores ? (<>
                                                    <div className="grid md:grid-cols-2 gap-3">
                                                        <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                                            <h4 className="text-[8px] font-bold text-white/25 uppercase flex items-center gap-1"><BarChart3 className="w-3 h-3 text-primary/50" /> Quality</h4>
                                                            {Object.entries(h.prediction.scores).filter(([k]) => !k.includes('bug') && !k.includes('risk')).map(([k, v]) => <ScoreBar key={k} label={k} value={v} />)}
                                                        </div>
                                                        <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                                            <h4 className="text-[8px] font-bold text-white/25 uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3 text-red-400/50" /> Risks</h4>
                                                            {Object.entries(h.prediction.scores).filter(([k]) => k.includes('bug') || k.includes('risk')).map(([k, v]) => <ScoreBar key={k} label={k} value={v} inverse />)}
                                                        </div>
                                                    </div>
                                                    {h.prediction.interpretation && (
                                                        <div className="p-3 rounded-xl bg-violet-500/[0.04] border border-violet-500/10">
                                                            <h4 className="text-[8px] font-bold text-violet-400/60 uppercase mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Interpretation</h4>
                                                            <MarkdownContent content={h.prediction.interpretation} />
                                                        </div>
                                                    )}
                                                </>) : (
                                                    <div className="text-center py-12"><Brain className="w-8 h-8 mx-auto text-white/[0.06] mb-2" /><p className="text-xs text-white/20">Select a file and click <strong className="text-violet-400/60">ML</strong> to analyze</p></div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Panel>
                        </PanelGroup>
                    </Panel>

                    <PanelResizeHandle className="w-[2px] bg-white/[0.03] hover:bg-violet-500/40 active:bg-violet-500/60 transition-colors cursor-col-resize" />

                    {/* ═══════ RIGHT SIDEBAR (AI AGENT) ═══════ */}
                    <Panel defaultSize={20} minSize={15} maxSize={35}>
                        <div className="h-full flex flex-col bg-[#0e0e17] border-l border-white/[0.04]">
                            <div className="px-3 py-2 border-b border-white/[0.04] shrink-0 bg-violet-500/5 flex items-center gap-2">
                                <Brain className="w-4 h-4 text-violet-400" />
                                <span className="text-[10px] font-bold text-violet-300/80 uppercase tracking-widest">Ganapathi AI</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                                {h.aiMessages.length === 0 && (
                                    <div className="text-center py-12 space-y-3">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto border border-violet-500/20">
                                            <Brain className="w-6 h-6 text-violet-400" />
                                        </div>
                                        <p className="text-sm font-bold text-white/80">How can I help?</p>
                                        <p className="text-xs text-white/40 max-w-[200px] mx-auto leading-relaxed">
                                            I am synced with your active file. Ask me to explain code, refactor, or find bugs.
                                        </p>
                                        {!h.aiApiKey && (
                                            <Button variant="outline" size="sm" className="mt-4 border-violet-500/30 text-violet-300 text-[10px]" onClick={() => h.setSidebarView('settings')}>
                                                <Key className="w-3 h-3 mr-1" /> Configure API Key
                                            </Button>
                                        )}
                                    </div>
                                )}
                                {h.aiMessages.map((msg, i) => (
                                    <div key={i} className={`flex gap-2 flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[9px] font-bold text-white/30 uppercase pl-1">{msg.role === 'user' ? 'You' : 'Ganapathi'}</span>
                                        <div className={`w-full rounded-xl px-3 py-2.5 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-violet-600/20 text-violet-100 border border-violet-500/20 rounded-tr-sm' : 'bg-white/[0.03] text-white/80 rounded-tl-sm border border-white/[0.06] shadow-md shadow-black/20'}`}>
                                            <MarkdownContent content={msg.content} />
                                            {msg.ts && <span className="text-[9px] text-white/20 block mt-2">{msg.ts}</span>}
                                        </div>
                                    </div>
                                ))}
                                {h.aiLoading && (
                                    <div className="flex gap-2 flex-col items-start">
                                        <span className="text-[9px] font-bold text-white/30 uppercase pl-1">Ganapathi</span>
                                        <div className="bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.04]">
                                            <Loader2 className="w-4 h-4 animate-spin text-violet-400/50" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border-t border-white/[0.04] shrink-0 bg-black/20">
                                <div className="relative flex items-center bg-black/40 border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
                                    <textarea 
                                        value={h.aiInput} 
                                        onChange={e => h.setAiInput(e.target.value)} 
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); h.sendAiMessage(); } }}
                                        placeholder={h.aiApiKey ? 'Message Ganapathi...' : 'Setup API Key in settings first...'} 
                                        className="w-full bg-transparent text-xs text-white/90 p-3 outline-none placeholder:text-white/20 min-h-[44px] max-h-[120px] resize-none" 
                                        rows={1}
                                        disabled={h.aiLoading} 
                                    />
                                    <div className="absolute right-2 bottom-2">
                                        <Button size="icon" className={`h-7 w-7 rounded-lg ${h.aiInput.trim() ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20' : 'bg-transparent text-white/20'}`} onClick={h.sendAiMessage} disabled={h.aiLoading || !h.aiInput.trim()}>
                                            <Send className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-2 px-1">
                                    <div className="text-[9px] text-white/20 font-bold flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-violet-500/50" /> {h.aiModel || h.aiProvider}
                                    </div>
                                    <div className="text-[9px] text-white/20">Return to send</div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </PanelGroup>
            </div>

            {/* ═══════ STATUS BAR ═══════ */}
            <div className="h-6 flex items-center px-3 border-t border-white/[0.04] bg-[#09091280] shrink-0 gap-4">
                {h.conn === 'connected' ? (
                    <div className="flex items-center gap-1.5 text-[9px] text-emerald-400/60"><Wifi className="w-3 h-3" /> Connected</div>
                ) : (
                    <div className="flex items-center gap-1.5 text-[9px] text-red-400/40"><WifiOff className="w-3 h-3" /> Offline</div>
                )}
                {h.gitStatus && <div className="flex items-center gap-1 text-[9px] text-orange-400/50"><GitBranch className="w-3 h-3" /> {h.gitStatus.branch}</div>}
                {h.activeTab && <>
                    <span className="text-[9px] text-white/20">{h.activeTab.name}</span>
                    <span className="text-[9px] text-white/15">{h.activeTab.lines}L • {(h.activeTab.size / 1024).toFixed(1)}KB</span>
                    <span className="text-[9px] text-white/15">{h.activeTab.language}</span>
                </>}
                <div className="ml-auto flex items-center gap-3">
                    {h.aiApiKey && <span className="text-[9px] text-violet-400/40 flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> {h.aiProvider}</span>}
                    <span className="text-[9px] text-white/10">{Math.floor(h.uptime / 60)}m up</span>
                </div>
            </div>
        </div>
    );
}
