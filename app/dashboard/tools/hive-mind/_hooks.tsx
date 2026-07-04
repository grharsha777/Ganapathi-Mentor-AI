'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { TreeNode, FileData, GitStatus, PredictionResult, OpenTab, AIMessage, DebugLog, TermEntry, ConnectionState, SidebarView, BottomPanel } from './_components';
import { EXT_LANG } from './_components';

export function useHiveIDE() {
    const [conn, setConn] = useState<ConnectionState>('disconnected');
    const [wsUrl, setWsUrl] = useState('ws://localhost:8765');
    const [token, setToken] = useState('');
    const wsRef = useRef<WebSocket | null>(null);
    const [project, setProject] = useState('');
    const [uptime, setUptime] = useState(0);
    const [watching, setWatching] = useState(false);
    const [tree, setTree] = useState<TreeNode | null>(null);
    const [selectedFile, setSelectedFile] = useState('');
    const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
    const [activeTabPath, setActiveTabPath] = useState('');
    const [saving, setSaving] = useState(false);
    const [searchQ, setSearchQ] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [changes, setChanges] = useState<any[]>([]);
    const [termInput, setTermInput] = useState('');
    const [termHistory, setTermHistory] = useState<TermEntry[]>([]);
    const [termRunning, setTermRunning] = useState(false);
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [cmdHistIdx, setCmdHistIdx] = useState(-1);
    const termEndRef = useRef<HTMLDivElement>(null);
    const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
    const [commitMsg, setCommitMsg] = useState('');
    const [gitLoading, setGitLoading] = useState('');
    const [gitLog, setGitLog] = useState<any[]>([]);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [predicting, setPredicting] = useState(false);
    const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
    const [debugFilter, setDebugFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
    const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiProvider, setAiProvider] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('hive_ai_provider') || 'groq' : 'groq');
    const [aiApiKey, setAiApiKey] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('hive_ai_key') || '' : '');
    const [aiModel, setAiModel] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('hive_ai_model') || '' : '');
    const [ghToken, setGhToken] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('hive_gh_token') || '' : '');
    const [ghRepoName, setGhRepoName] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('hive_gh_repo') || '' : '');
    const [ghUser, setGhUser] = useState<any>(null);
    const [ghRepoInfo, setGhRepoInfo] = useState<any>(null);
    const [ghLoading, setGhLoading] = useState('');
    const [sidebarView, setSidebarView] = useState<SidebarView>('explorer');
    const [bottomPanel, setBottomPanel] = useState<BottomPanel>('terminal');
    const [showCmdPalette, setShowCmdPalette] = useState(false);

    // Persist AI/GH settings
    useEffect(() => { localStorage.setItem('hive_ai_provider', aiProvider); }, [aiProvider]);
    useEffect(() => { localStorage.setItem('hive_ai_key', aiApiKey); }, [aiApiKey]);
    useEffect(() => { localStorage.setItem('hive_ai_model', aiModel); }, [aiModel]);
    useEffect(() => { localStorage.setItem('hive_gh_token', ghToken); }, [ghToken]);
    useEffect(() => { localStorage.setItem('hive_gh_repo', ghRepoName); }, [ghRepoName]);

    const addDebugLog = useCallback((level: DebugLog['level'], message: string, source?: string) => {
        setDebugLogs(prev => [...prev.slice(-200), { level, message, timestamp: new Date().toLocaleTimeString(), source }]);
    }, []);

    const send = useCallback((msg: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(msg));
    }, []);

    const activeTab = openTabs.find(t => t.path === activeTabPath);
    const isDirty = activeTab ? activeTab.content !== activeTab.originalContent : false;

    const updateTabContent = useCallback((path: string, content: string) => {
        setOpenTabs(prev => prev.map(t => t.path === path ? { ...t, content } : t));
    }, []);

    const connect = useCallback(() => {
        if (!token) { toast.error('Enter auth token from CLI'); return; }
        setConn('connecting');
        addDebugLog('info', 'Connecting to WebSocket...', 'system');
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => ws.send(JSON.stringify({ action: 'auth', token }));
        ws.onmessage = (event) => {
            try {
                const d = JSON.parse(event.data);
                if (d.error) {
                    if (d.code === 401) { setConn('error'); toast.error('Auth failed'); addDebugLog('error', 'Authentication failed', 'ws'); }
                    else { toast.error(d.error); addDebugLog('error', d.error, 'ws'); }
                    return;
                }
                switch (d.action) {
                    case 'auth_ok':
                        setConn('connected'); setProject(d.project);
                        toast.success(`🐝 Connected to ${d.project}`);
                        addDebugLog('info', `Connected to ${d.project}`, 'system');
                        ws.send(JSON.stringify({ action: 'tree' }));
                        ws.send(JSON.stringify({ action: 'status' }));
                        break;
                    case 'status': setUptime(d.uptime || 0); setWatching(d.watching || false); break;
                    case 'tree': setTree(d.tree); break;
                    case 'read':
                        if (!d.error) {
                            const ext = d.extension || '';
                            const lang = EXT_LANG[ext] || 'plaintext';
                            setOpenTabs(prev => {
                                const exists = prev.find(t => t.path === d.path);
                                if (exists) return prev.map(t => t.path === d.path ? { ...t, content: d.content, originalContent: d.content, lines: d.lines, size: d.size } : t);
                                return [...prev, { path: d.path, name: d.name, content: d.content, originalContent: d.content, language: lang, extension: ext, lines: d.lines, size: d.size }];
                            });
                            setActiveTabPath(d.path);
                        } else toast.error(d.error);
                        break;
                    case 'write':
                        setSaving(false);
                        if (d.success) {
                            setOpenTabs(prev => prev.map(t => t.path === d.path ? { ...t, originalContent: t.content } : t));
                            toast.success(`Saved ${d.path}`);
                        } else toast.error(d.error || 'Save failed');
                        break;
                    case 'exec':
                        setTermRunning(false);
                        setTermHistory(prev => [...prev, { cmd: d.command || '', stdout: d.stdout || '', stderr: d.stderr || d.error || '', success: d.success ?? false, ts: new Date().toLocaleTimeString() }]);
                        if (d.stderr) addDebugLog('error', d.stderr, 'exec');
                        break;
                    case 'changes': setChanges(d.changes || []); break;
                    case 'search': setSearchResults(d.results || []); break;
                    case 'predict':
                        setPredicting(false);
                        if (d.prediction) { setPrediction(d.prediction); setBottomPanel('predict'); toast.success('ML Prediction complete'); }
                        else toast.error(d.error || 'Prediction failed');
                        break;
                    case 'git':
                        setGitLoading('');
                        if (d.sub === 'status') setGitStatus(d);
                        else if (d.sub === 'log') setGitLog(d.commits || []);
                        else if (d.sub === 'commit') { toast[d.success ? 'success' : 'error'](d.success ? '✅ Committed!' : d.output || 'Commit failed'); send({ action: 'git', sub: 'status' }); }
                        else if (d.sub === 'push') toast[d.success ? 'success' : 'error'](d.success ? '🚀 Pushed!' : d.output || 'Push failed');
                        else if (d.sub === 'pull') { toast[d.success ? 'success' : 'error'](d.success ? '⬇️ Pulled!' : d.output || 'Pull failed'); send({ action: 'git', sub: 'status' }); }
                        break;
                }
            } catch { }
        };
        ws.onerror = () => { setConn('error'); toast.error('Connection failed'); addDebugLog('error', 'WebSocket error', 'ws'); };
        ws.onclose = () => { setConn('disconnected'); addDebugLog('warn', 'Disconnected', 'ws'); };
    }, [wsUrl, token, send, addDebugLog]);

    const disconnect = useCallback(() => { wsRef.current?.close(); wsRef.current = null; setConn('disconnected'); setTree(null); setPrediction(null); setGitStatus(null); }, []);

    useEffect(() => {
        if (conn !== 'connected') return;
        const iv = setInterval(() => { send({ action: 'changes' }); send({ action: 'status' }); }, 12000);
        return () => clearInterval(iv);
    }, [conn, send]);

    useEffect(() => { termEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [termHistory]);

    const openFile = useCallback((path: string) => {
        setSelectedFile(path);
        const existing = openTabs.find(t => t.path === path);
        if (existing) { setActiveTabPath(path); return; }
        send({ action: 'read', path });
    }, [send, openTabs]);

    const closeTab = useCallback((path: string) => {
        setOpenTabs(prev => {
            const next = prev.filter(t => t.path !== path);
            if (activeTabPath === path) setActiveTabPath(next.length > 0 ? next[next.length - 1].path : '');
            return next;
        });
    }, [activeTabPath]);

    const saveFile = useCallback(() => {
        if (!activeTabPath || !isDirty) return;
        setSaving(true);
        send({ action: 'write', path: activeTabPath, content: activeTab?.content || '' });
    }, [activeTabPath, isDirty, activeTab, send]);

    const runCmd = useCallback(() => {
        if (!termInput.trim()) return;
        if (conn !== 'connected') { toast.error('Connect to Hive Mind first'); return; }
        setTermRunning(true);
        setCmdHistory(prev => [termInput, ...prev.slice(0, 50)]);
        setCmdHistIdx(-1);
        send({ action: 'exec', command: termInput });
        setTermInput('');
    }, [termInput, send, conn]);

    const handleTermKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') { runCmd(); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); setCmdHistIdx(prev => { const n = Math.min(prev + 1, cmdHistory.length - 1); if (cmdHistory[n]) setTermInput(cmdHistory[n]); return n; }); }
        if (e.key === 'ArrowDown') { e.preventDefault(); setCmdHistIdx(prev => { const n = Math.max(prev - 1, -1); setTermInput(n < 0 ? '' : cmdHistory[n] || ''); return n; }); }
    }, [runCmd, cmdHistory]);

    const gitAction = useCallback((sub: string, extra?: any) => { setGitLoading(sub); send({ action: 'git', sub, ...extra }); }, [send]);

    useEffect(() => { if (conn === 'connected' && sidebarView === 'git') { gitAction('status'); gitAction('log'); } }, [conn, sidebarView, gitAction]);

    const handlePredict = useCallback(() => {
        if (!selectedFile) { toast.error('Select a file first'); return; }
        setPredicting(true); send({ action: 'predict', path: selectedFile });
    }, [selectedFile, send]);

    const handleSearch = useCallback(() => { if (searchQ.length >= 2) send({ action: 'search', query: searchQ }); }, [searchQ, send]);

    const sendAiMessage = useCallback(async () => {
        if (!aiInput.trim() || !aiApiKey) { if (!aiApiKey) toast.error('Configure AI key in Settings'); return; }
        const userMsg: AIMessage = { role: 'user', content: aiInput, ts: new Date().toLocaleTimeString() };
        const msgs = [...aiMessages, userMsg];
        setAiMessages(msgs);
        setAiInput('');
        setAiLoading(true);
        try {
            const sysContent = activeTab ? `You are Ganapathi AI coding assistant. Current file: ${activeTab.path}\n\n\`\`\`${activeTab.language}\n${activeTab.content.slice(0, 6000)}\n\`\`\`` : 'You are Ganapathi AI coding assistant.';
            const res = await fetch('/api/ai/agent', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: aiProvider, apiKey: aiApiKey, model: aiModel, messages: [{ role: 'system', content: sysContent }, ...msgs.map(m => ({ role: m.role, content: m.content }))] }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error); addDebugLog('error', data.error, 'ai-agent'); setAiLoading(false); return; }
            setAiMessages(prev => [...prev, { role: 'assistant', content: data.text, ts: new Date().toLocaleTimeString() }]);
        } catch (err: any) { toast.error(err.message); addDebugLog('error', err.message, 'ai-agent'); }
        setAiLoading(false);
    }, [aiInput, aiApiKey, aiProvider, aiModel, aiMessages, activeTab, addDebugLog]);

    const checkGhUser = useCallback(async () => {
        if (!ghToken) { toast.error('Enter GitHub PAT'); return; }
        setGhLoading('user');
        try {
            const res = await fetch('/api/github/repos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'check-user', token: ghToken }) });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error); setGhLoading(''); return; }
            setGhUser(data.user); toast.success(`Verified: ${data.user.login}`);
        } catch { toast.error('Failed to verify'); }
        setGhLoading('');
    }, [ghToken]);

    const checkGhRepo = useCallback(async () => {
        if (!ghRepoName) return;
        setGhLoading('repo');
        try {
            const res = await fetch('/api/github/repos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'check-repo', token: ghToken, repoName: ghRepoName }) });
            const data = await res.json();
            setGhRepoInfo(data.exists ? data.repo : null);
            if (!data.exists) toast.info('Repo not found — you can create it');
        } catch { toast.error('Failed to check repo'); }
        setGhLoading('');
    }, [ghToken, ghRepoName]);

    const createGhRepo = useCallback(async () => {
        setGhLoading('create');
        try {
            const res = await fetch('/api/github/repos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create-repo', token: ghToken, repoName: ghRepoName }) });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error); setGhLoading(''); return; }
            setGhRepoInfo(data.repo); toast.success('Repo created!');
        } catch { toast.error('Failed to create repo'); }
        setGhLoading('');
    }, [ghToken, ghRepoName]);

    const pushToGh = useCallback(() => { gitAction('push'); }, [gitAction]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveFile(); }
            if ((e.ctrlKey || e.metaKey) && e.key === '`') { e.preventDefault(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); setShowCmdPalette(p => !p); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [saveFile]);

    return {
        conn, wsUrl, setWsUrl, token, setToken, connect, disconnect,
        project, uptime, watching, tree, selectedFile, openTabs, activeTabPath, setActiveTabPath,
        activeTab, isDirty, saving, updateTabContent, openFile, closeTab, saveFile,
        searchQ, setSearchQ, searchResults, setSearchResults, handleSearch, changes,
        termInput, setTermInput, termHistory, setTermHistory, termRunning, termEndRef, runCmd, handleTermKeyDown,
        gitStatus, commitMsg, setCommitMsg, gitLoading, gitLog, gitAction,
        prediction, predicting, handlePredict, setPrediction,
        debugLogs, debugFilter, setDebugFilter, addDebugLog,
        aiMessages, aiInput, setAiInput, aiLoading, sendAiMessage,
        aiProvider, setAiProvider, aiApiKey, setAiApiKey, aiModel, setAiModel,
        ghToken, setGhToken, ghRepoName, setGhRepoName, ghUser, ghRepoInfo, ghLoading,
        checkGhUser, checkGhRepo, createGhRepo, pushToGh,
        sidebarView, setSidebarView, bottomPanel, setBottomPanel,
        showCmdPalette, setShowCmdPalette, send,
    };
}
