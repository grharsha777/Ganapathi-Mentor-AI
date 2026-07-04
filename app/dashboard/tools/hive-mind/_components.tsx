'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Folder, FolderOpen, X, Loader2, Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
export interface TreeNode { name: string; path: string; type: 'file' | 'directory'; children?: TreeNode[]; size?: number; extension?: string; }
export interface FileData { path: string; name: string; content: string; size: number; extension: string; modified: string; lines: number; }
export interface GitStatus { branch: string; files: { status: string; file: string }[]; recent_commits: string[]; clean: boolean; }
export interface PredictionResult { scores?: Record<string, number>; interpretation?: string; top_factors?: { feature: string; importance: number }[]; }
export interface OpenTab { path: string; name: string; content: string; originalContent: string; language: string; extension: string; lines: number; size: number; }
export interface AIMessage { role: 'user' | 'assistant' | 'system'; content: string; ts?: string; }
export interface DebugLog { level: 'info' | 'warn' | 'error'; message: string; timestamp: string; source?: string; }
export interface TermEntry { cmd: string; stdout: string; stderr: string; success: boolean; ts: string; }
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export type SidebarView = 'explorer' | 'search' | 'git' | 'github' | 'settings';
export type BottomPanel = 'terminal' | 'debug' | 'agent' | 'predict';

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */
export const EXT_LANG: Record<string, string> = {
    '.py': 'python', '.js': 'javascript', '.ts': 'typescript', '.tsx': 'typescript',
    '.jsx': 'javascript', '.json': 'json', '.html': 'html', '.css': 'css',
    '.md': 'markdown', '.yml': 'yaml', '.yaml': 'yaml', '.java': 'java',
    '.cpp': 'cpp', '.c': 'c', '.go': 'go', '.rs': 'rust', '.rb': 'ruby',
    '.php': 'php', '.sql': 'sql', '.sh': 'shell', '.xml': 'xml',
};
export const EXT_ICON: Record<string, string> = {
    '.py': '🐍', '.js': '🟨', '.ts': '🔷', '.tsx': '⚛️', '.jsx': '⚛️',
    '.json': '📋', '.md': '📝', '.css': '🎨', '.html': '🌐', '.yml': '⚙️',
    '.yaml': '⚙️', '.java': '☕', '.cpp': '⚡', '.go': '🔵', '.rs': '🦀',
    '.rb': '💎', '.sql': '🗄️', '.sh': '🔧',
};
export const GIT_COLOR: Record<string, string> = {
    'M': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'A': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    '?': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    'D': 'bg-red-500/15 text-red-400 border-red-500/20',
    'R': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};
export const AI_PROVIDERS = [
    { id: 'groq', name: 'Groq', models: ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'], color: 'text-orange-400' },
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'], color: 'text-emerald-400' },
    { id: 'anthropic', name: 'Claude', models: ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022'], color: 'text-amber-400' },
    { id: 'mistral', name: 'Mistral', models: ['mistral-small-latest', 'mistral-large-latest'], color: 'text-blue-400' },
    { id: 'grok', name: 'Grok (xAI)', models: ['grok-beta'], color: 'text-cyan-400' },
    { id: 'gemini', name: 'Gemini', models: ['gemini-1.5-flash', 'gemini-1.5-pro'], color: 'text-violet-400' },
];

/* ═══════════════════════════════════════════════════════════════
   Utility Functions
   ═══════════════════════════════════════════════════════════════ */
export function flattenTree(node: TreeNode, result: { name: string; path: string }[] = []): { name: string; path: string }[] {
    if (node.type === 'file') result.push({ name: node.name, path: node.path });
    node.children?.forEach(c => flattenTree(c, result));
    return result;
}

export function fuzzyMatch(query: string, text: string): number {
    if (!query) return 1;
    const q = query.toLowerCase(), t = text.toLowerCase();
    let qi = 0, score = 0;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] === q[qi]) { score++; qi++; }
    }
    return qi === q.length ? score / q.length : 0;
}

/* ═══════════════════════════════════════════════════════════════
   Tree View Component
   ═══════════════════════════════════════════════════════════════ */
export function TreeView({ node, depth, onSelect, selected }: {
    node: TreeNode; depth: number; onSelect: (p: string) => void; selected: string;
}) {
    const [open, setOpen] = useState(depth < 2);
    if (node.type === 'directory') {
        return (
            <div>
                <button onClick={() => setOpen(!open)}
                    className="flex items-center gap-1.5 w-full text-left py-[5px] px-2 hover:bg-white/[0.04] rounded-md transition-colors"
                    style={{ paddingLeft: `${depth * 14 + 6}px` }}>
                    <ChevronRight className={`w-3 h-3 text-white/25 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
                    {open ? <FolderOpen className="w-3.5 h-3.5 text-amber-400/80" /> : <Folder className="w-3.5 h-3.5 text-amber-400/50" />}
                    <span className="text-[11px] text-white/60 truncate">{node.name}</span>
                    {node.children && <span className="text-[8px] text-white/20 ml-auto">{node.children.length}</span>}
                </button>
                <AnimatePresence>
                    {open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
                        {node.children?.map((c, i) => <TreeView key={i} node={c} depth={depth + 1} onSelect={onSelect} selected={selected} />)}
                    </motion.div>}
                </AnimatePresence>
            </div>
        );
    }
    const active = node.path === selected;
    return (
        <button onClick={() => onSelect(node.path)}
            className={`flex items-center gap-1.5 w-full text-left py-[5px] px-2 rounded-md transition-all ${active ? 'bg-primary/10 text-primary border border-primary/15' : 'hover:bg-white/[0.03] text-white/50'}`}
            style={{ paddingLeft: `${depth * 14 + 6}px` }}>
            <span className="text-[10px]">{EXT_ICON[node.extension || ''] || '📄'}</span>
            <span className={`text-[11px] truncate ${active ? 'font-semibold' : ''}`}>{node.name}</span>
            {node.size && <span className="text-[8px] text-white/15 ml-auto">{(node.size / 1024).toFixed(0)}K</span>}
        </button>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Score Bar (ML Prediction)
   ═══════════════════════════════════════════════════════════════ */
export function ScoreBar({ label, value, inverse }: { label: string; value: number; inverse?: boolean }) {
    const pct = value * 100;
    const color = inverse
        ? (pct < 30 ? 'from-emerald-500 to-emerald-400' : pct < 60 ? 'from-amber-500 to-amber-400' : 'from-red-500 to-red-400')
        : (pct > 70 ? 'from-emerald-500 to-emerald-400' : pct > 40 ? 'from-amber-500 to-amber-400' : 'from-red-500 to-red-400');
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 capitalize">{label.replace(/_/g, ' ')}</span>
                <span className="font-bold text-white">{pct.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${color}`} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Command Palette
   ═══════════════════════════════════════════════════════════════ */
export function CommandPalette({ open, onClose, files, onSelect }: {
    open: boolean; onClose: () => void; files: { name: string; path: string }[]; onSelect: (path: string) => void;
}) {
    const [q, setQ] = useState('');
    const filtered = q ? files.filter(f => fuzzyMatch(q, f.path) > 0).slice(0, 20) : files.slice(0, 20);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="relative w-full max-w-lg bg-[#1a1a24] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                    <Search className="w-4 h-4 text-white/30" />
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search files by name..."
                        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20" autoFocus
                        onKeyDown={e => { if (e.key === 'Escape') onClose(); }} />
                    <Badge variant="outline" className="text-[8px] text-white/20 border-white/10">ESC</Badge>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {filtered.map((f, i) => (
                        <button key={i} onClick={() => { onSelect(f.path); onClose(); setQ(''); }}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                            <span className="text-[10px]">{EXT_ICON[f.name.substring(f.name.lastIndexOf('.'))] || '📄'}</span>
                            <span className="text-xs text-white/70 truncate">{f.name}</span>
                            <span className="text-[9px] text-white/20 ml-auto truncate max-w-[200px]">{f.path}</span>
                        </button>
                    ))}
                    {filtered.length === 0 && <div className="text-center py-6 text-xs text-white/10">No files found</div>}
                </div>
            </motion.div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Markdown & Code Block
   ═══════════════════════════════════════════════════════════════ */
export function CodeBlock({ code, language }: { code: string; language?: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="relative group my-2 rounded-lg overflow-hidden border border-white/5 bg-black/40">
            <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.03]">
                <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{language || 'code'}</span>
                <button onClick={copy} className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/5 transition-colors">
                    {copied ? (
                        <>
                            <span className="text-[9px] text-emerald-400 font-bold uppercase">Copied!</span>
                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Check className="w-2 h-2 text-emerald-400" />
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-[9px] text-white/30 font-bold uppercase group-hover:text-white/50">Copy</span>
                            <Search className="w-3 h-3 text-white/20 group-hover:text-white/40" />
                        </>
                    )}
                </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-white/80 overflow-x-auto custom-scrollbar leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
}

export function MarkdownContent({ content }: { content: string }) {
    if (!content) return null;
    const parts = content.split(/(```[\s\S]*?```)/g);
    return (
        <div className="space-y-1.5 text-[11px] leading-relaxed">
            {parts.map((p, i) => {
                if (p.startsWith('```')) {
                    const match = p.match(/```(\w*)\n?([\s\S]*?)```/);
                    const lang = match?.[1] || 'code';
                    const code = match?.[2] || '';
                    return <CodeBlock key={i} code={code.trim()} language={lang} />;
                }
                return <p key={i} className="whitespace-pre-wrap">{p}</p>;
            })}
        </div>
    );
}
