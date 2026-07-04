'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, ArrowRight, ChevronRight, Copy, Check, CheckCircle2, Circle, Users,
    Clock, Target, Compass, Sparkles, Send, Download, MonitorPlay, Zap, ExternalLink, Globe, LayoutTemplate,
    Brain, Rocket, Code2, Presentation, PenTool, Database
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AppLogo } from './app-logo'
import { TOOLS } from './data'
import { ROADMAP_TEMPLATES, RoadmapTemplate, RoadmapPhase } from './roadmap-data'

type ViewState = 'select' | 'configure' | 'roadmap' | 'phase'

interface FieldDef {
    key: string;
    label: string;
    placeholder: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[];
    icon: React.ReactNode;
}

// Generate specific config fields based on the template ID
const getTemplateFields = (templateId: string): FieldDef[] => {
    switch (templateId) {
        case 'hackathon':
            return [
                { key: 'name', label: 'Hackathon Name', placeholder: 'e.g. Meta Global Hackathon', type: 'text', icon: <Target className="w-3.5 h-3.5" /> },
                { key: 'prizeTrack', label: 'Prize Track', placeholder: '', type: 'select', options: ['General', 'AI / ML', 'Web3 / Crypto', 'HealthTech', 'FinTech'], icon: <Sparkles className="w-3.5 h-3.5" /> },
                { key: 'problem', label: 'Target Problem', placeholder: 'What specific problem are you solving?', type: 'textarea', icon: <Compass className="w-3.5 h-3.5" /> },
            ]
        case 'research-paper':
            return [
                { key: 'topic', label: 'Core Research Topic', placeholder: 'e.g. Impact of Transformers on Edge Devices', type: 'text', icon: <Brain className="w-3.5 h-3.5" /> },
                { key: 'conference', label: 'Target Journal / Conference', placeholder: 'e.g. IEEE, NeurIPS, College Course', type: 'text', icon: <Target className="w-3.5 h-3.5" /> },
                { key: 'hypothesis', label: 'Main Hypothesis', placeholder: 'Detail the thesis you want to prove / investigate...', type: 'textarea', icon: <PenTool className="w-3.5 h-3.5" /> },
            ]
        case 'mvp-launch':
            return [
                { key: 'startupName', label: 'Startup / App Name', placeholder: 'e.g. TurboTask', type: 'text', icon: <Rocket className="w-3.5 h-3.5" /> },
                { key: 'audience', label: 'Target Audience', placeholder: 'e.g. Remote Freelancers', type: 'text', icon: <Users className="w-3.5 h-3.5" /> },
                { key: 'coreValue', label: 'Core Value Proposition', placeholder: 'What makes this MVP fundamentally different?', type: 'textarea', icon: <Compass className="w-3.5 h-3.5" /> },
            ]
        case 'portfolio':
            return [
                { key: 'devName', label: 'Your Name / Brand', placeholder: 'e.g. John Doe', type: 'text', icon: <Code2 className="w-3.5 h-3.5" /> },
                { key: 'targetRole', label: 'Target Job Role', placeholder: 'e.g. Senior Frontend Engineer', type: 'text', icon: <Target className="w-3.5 h-3.5" /> },
                { key: 'techStack', label: 'Primary Tech Stack', placeholder: 'e.g. React, Next.js, Node, Supabase...', type: 'textarea', icon: <Database className="w-3.5 h-3.5" /> },
            ]
        case 'presentation':
            return [
                { key: 'topic', label: 'Presentation Topic', placeholder: 'e.g. Q3 Earnings Report', type: 'text', icon: <Presentation className="w-3.5 h-3.5" /> },
                { key: 'audience', label: 'Audience Type', placeholder: 'e.g. Investors, Students, Board', type: 'text', icon: <Users className="w-3.5 h-3.5" /> },
                { key: 'keyTakeaway', label: 'Main Takeaway', placeholder: 'What is the one thing they must remember?', type: 'textarea', icon: <Sparkles className="w-3.5 h-3.5" /> },
            ]
        default:
            return [
                { key: 'name', label: 'Project Name', placeholder: 'e.g. Project Apollo', type: 'text', icon: <Target className="w-3.5 h-3.5" /> },
                { key: 'objective', label: 'Primary Objective', placeholder: 'What defines success for this?', type: 'textarea', icon: <Compass className="w-3.5 h-3.5" /> },
            ]
    }
}

// ── Pexels Image Fetcher for visually stunning backgrounds ──
const cachedImages: Record<string, string> = {}
function useDynamicBackground(query: string, seed: string) {
    const [bg, setBg] = useState<string | null>(cachedImages[query + seed] || null)
    useEffect(() => {
        if (cachedImages[query + seed]) return;
        const controller = new AbortController()
        // Determine page randomly via seed
        let hash = 0; for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        const page = (Math.abs(hash) % 10) + 1;

        fetch(`/api/assets/pexels?query=${encodeURIComponent(query)}&per_page=1&page=${page}&orientation=landscape`, { signal: controller.signal })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                const url = data?.photos?.[0]?.src?.large2x || data?.photos?.[0]?.src?.large
                if (url) { cachedImages[query + seed] = url; setBg(url) }
            }).catch(() => { })
        return () => controller.abort()
    }, [query, seed])
    return bg
}

// ── Native IndexedDB Helper for Per-User Storage ──
const DB_NAME = 'AntigravityWorkflowDB';
const STORE_NAME = 'workflow-state';
function getIDB(key: string): Promise<any> {
    return new Promise((resolve) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
        req.onsuccess = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) return resolve(null);
            const tx = db.transaction(STORE_NAME, 'readonly');
            const getReq = tx.objectStore(STORE_NAME).get(key);
            getReq.onsuccess = () => resolve(getReq.result || null);
            getReq.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
    });
}
function setIDB(key: string, val: any): Promise<void> {
    return new Promise((resolve) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
        req.onsuccess = () => {
            const tx = req.result.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(val, key);
            tx.oncomplete = () => resolve();
        };
    });
}

export function WorkflowGenerator() {
    const { user } = useAuth()
    const emailKey = user?.email || 'anonymous'

    const [view, setView] = useState<ViewState>('select')
    const [template, setTemplate] = useState<RoadmapTemplate | null>(null)
    const [config, setConfig] = useState<any>({ isTeam: true, teamSize: '2-4 people', duration: '48 Hours', customData: {} })
    const [activePhase, setActivePhase] = useState<RoadmapPhase | null>(null)
    const [loaded, setLoaded] = useState(false)

    // Load initial state from IDB
    useEffect(() => {
        getIDB(`workflow_${emailKey}`).then((saved) => {
            if (saved) {
                if (saved.view) setView(saved.view)
                if (saved.template) setTemplate(saved.template)
                if (saved.config) setConfig(saved.config)
                if (saved.activePhase) setActivePhase(saved.activePhase)
            }
            setLoaded(true)
        })
    }, [emailKey])

    // Save state to IDB on change
    useEffect(() => {
        if (loaded) {
            setIDB(`workflow_${emailKey}`, { view, template, config, activePhase })
        }
    }, [view, template, config, activePhase, loaded, emailKey])

    const handleSelectTemplate = (t: RoadmapTemplate) => {
        setTemplate(t)
        // Reset config logic for new template
        setConfig({ isTeam: true, teamSize: '2-4 people', duration: t.timeframe, customData: {} })
        setView('configure')
    }

    const goBack = () => {
        if (view === 'phase') setView('roadmap')
        else if (view === 'roadmap') setView('configure')
        else if (view === 'configure') { setView('select'); setTemplate(null) }
    }

    if (!loaded) return <div className="w-full flex items-center justify-center min-h-[700px]"><Sparkles className="w-6 h-6 animate-pulse text-indigo-400" /></div>

    return (
        <div className="w-full relative min-h-[700px] pb-24">
            <AnimatePresence mode="wait">
                {view === 'select' && (
                    <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                        <SelectView onSelect={handleSelectTemplate} />
                    </motion.div>
                )}
                {view === 'configure' && template && (
                    <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                        <ConfigureView template={template} config={config} setConfig={setConfig} onNext={() => setView('roadmap')} onBack={goBack} />
                    </motion.div>
                )}
                {view === 'roadmap' && template && (
                    <motion.div key="roadmap" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4 }}>
                        <RoadmapView template={template} config={config} onSelectPhase={(p: RoadmapPhase) => { setActivePhase(p); setView('phase') }} onBack={goBack} />
                    </motion.div>
                )}
                {view === 'phase' && template && activePhase && (
                    <motion.div key="phase" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                        <PhaseDetailView template={template} phase={activePhase} onBack={goBack} config={config} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────── */
/*  1. Initial Selection View: Cinematic Cards                 */
/* ─────────────────────────────────────────────────────────── */
function SelectView({ onSelect }: { onSelect: (t: RoadmapTemplate) => void }) {
    return (
        <div className="w-full space-y-12 py-4">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold mb-2">
                    <Zap className="w-4 h-4" /> AI Accelerated Execution
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                    Select your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500">Mission Type</span>
                </h1>
                <p className="text-lg text-gray-400">
                    Skip the planning. Choose your objective and AI will synthesize a phase-by-phase tactical roadmap loaded with golden AI prompts.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ROADMAP_TEMPLATES.map((t) => (
                    <MissionCard key={t.id} template={t} onClick={() => onSelect(t)} />
                ))}
            </div>
        </div>
    )
}

function MissionCard({ template, onClick }: { template: RoadmapTemplate, onClick: () => void }) {
    const bgImage = useDynamicBackground(`${template.useCase} futuristic technology abstract dark`, template.id)

    return (
        <div
            onClick={onClick}
            className="group relative h-[320px] rounded-3xl cursor-pointer overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] hover:-translate-y-1"
        >
            {bgImage ? (
                <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700" />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <div className="absolute inset-0 p-6 flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-xl mb-auto group-hover:scale-110 transition-transform">
                    {template.icon}
                </div>

                <div className="space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Badge variant="outline" className="bg-black/50 backdrop-blur-sm border-white/10 text-white font-bold tracking-wider mb-2">
                        {template.timeframe} RUN
                    </Badge>
                    <h3 className="text-2xl font-black text-white">{template.title}</h3>
                    <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {template.description}
                    </p>
                </div>
            </div>
        </div>
    )
}


/* ─────────────────────────────────────────────────────────── */
/*  2. Dynamic Configuration Wizard                            */
/* ─────────────────────────────────────────────────────────── */
function ConfigureView({ template, config, setConfig, onNext, onBack }: any) {
    const updateCustom = (key: string, val: any) => setConfig((p: any) => ({ ...p, customData: { ...p.customData, [key]: val } }))
    const updateBase = (key: string, val: any) => setConfig((p: any) => ({ ...p, [key]: val }))

    const fields = getTemplateFields(template.id)
    const bgImage = useDynamicBackground('blueprint data network dark', template.id + 'config')

    return (
        <div className="max-w-5xl mx-auto space-y-6 pt-4">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group px-2">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-wider">Change Mission</span>
            </button>

            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl p-6 sm:p-12">
                {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-luminosity pointer-events-none" />}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />

                <div className="relative z-10 grid lg:grid-cols-5 gap-12">

                    {/* Intro Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-3xl shadow-xl shadow-blue-500/20">
                            {template.icon}
                        </div>
                        <h1 className="text-4xl font-black text-white leading-tight">Configure your <br /><span className="text-blue-400">{template.shortLabel}</span></h1>
                        <p className="text-gray-400 text-lg leading-relaxed">Customize the parameters below. The AI execution engine will adapt your roadmap to perfectly fit your targets.</p>

                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl space-y-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">Logistics</h4>
                            {/* Team Toggle */}
                            <div className="flex bg-black/60 p-1.5 rounded-xl border border-white/5">
                                <button
                                    onClick={() => updateBase('isTeam', false)}
                                    className={cn('flex-1 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wide', !config.isTeam ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-300')}
                                >
                                    Solo
                                </button>
                                <button
                                    onClick={() => updateBase('isTeam', true)}
                                    className={cn('flex-1 py-2 flex justify-center items-center gap-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wide', config.isTeam ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-300')}
                                >
                                    Team
                                </button>
                            </div>

                            {config.isTeam && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Team Size</label>
                                    <select value={config.teamSize} onChange={e => updateBase('teamSize', e.target.value)} className="w-full bg-black/60 border border-white/10 h-10 rounded-lg px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none">
                                        <option>2-3 people</option><option>4-5 people</option><option>6+ people</option>
                                    </select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Timeframe</label>
                                <Input value={config.duration} onChange={e => updateBase('duration', e.target.value)} className="bg-black/60 border-white/10 h-10 rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Fields Panel */}
                    <div className="lg:col-span-3 space-y-6">
                        <h4 className="text-lg font-bold text-white pb-2 border-b border-white/10">Mission Parameters</h4>

                        <div className="space-y-6">
                            {fields.map((f) => (
                                <div key={f.key} className="space-y-2 group">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 group-focus-within:text-blue-400 transition-colors">
                                        <span className="p-1 rounded-md bg-white/5 group-focus-within:bg-blue-500/20">{f.icon}</span> {f.label}
                                    </label>

                                    {f.type === 'select' ? (
                                        <select
                                            value={config.customData[f.key] || ''}
                                            onChange={e => updateCustom(f.key, e.target.value)}
                                            className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 h-14 rounded-2xl px-4 text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all appearance-none text-base"
                                        >
                                            <option value="" disabled hidden>Select {f.label}</option>
                                            {f.options?.map(o => <option key={o} value={o} className="bg-gray-900">{o}</option>)}
                                        </select>
                                    ) : f.type === 'textarea' ? (
                                        <Textarea
                                            value={config.customData[f.key] || ''}
                                            onChange={e => updateCustom(f.key, e.target.value)}
                                            placeholder={f.placeholder}
                                            className="bg-white/[0.02] border-white/10 hover:border-white/20 min-h-[140px] rounded-2xl resize-none p-4 text-base focus:border-blue-500 focus:bg-white/[0.05] transition-all"
                                        />
                                    ) : (
                                        <Input
                                            value={config.customData[f.key] || ''}
                                            onChange={e => updateCustom(f.key, e.target.value)}
                                            placeholder={f.placeholder}
                                            className="bg-white/[0.02] border-white/10 hover:border-white/20 h-14 rounded-2xl px-4 text-base focus:border-blue-500 focus:bg-white/[0.05] transition-all"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-6">
                            <Button size="lg" className="w-full h-16 text-lg rounded-2xl font-black bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-xl shadow-blue-500/20 border border-blue-400/30 transition-all hover:scale-[1.02]" onClick={onNext}>
                                Initialize Roadmap <Sparkles className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────── */
/*  3. Cinematic Roadmap HUD (Dashboard)                       */
/* ─────────────────────────────────────────────────────────── */
function RoadmapView({ template, config, onSelectPhase, onBack }: any) {
    const bgImage = useDynamicBackground(`space galaxy dark data network`, template.id + 'hud')
    const mainTitle = config.customData.name || config.customData.topic || config.customData.startupName || config.customData.devName || template.title;

    return (
        <div className="w-full space-y-8 pt-4 pb-16">
            {/* HUD Header */}
            <div className="relative rounded-[3rem] overflow-hidden bg-black border border-white/10 p-8 sm:p-12">
                {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 select-none pointer-events-none mix-blend-lighten" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-end gap-6 h-full mt-12">
                    <div>
                        <Badge variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white font-mono tracking-widest px-3 py-1 mb-4 uppercase">
                            STATUS: ACTIVE // {config.duration}
                        </Badge>
                        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase leading-none max-w-3xl drop-shadow-2xl">
                            {mainTitle}
                        </h1>
                        <p className="text-lg text-gray-300 mt-4 font-mono">TACTICAL ROADMAP // {config.isTeam ? `TEAM OF ${config.teamSize}` : 'SOLO OP'}</p>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button variant="outline" className="bg-black/50 backdrop-blur-xl border-white/20 hover:bg-white/10 text-white h-12 px-6 rounded-2xl"><LayoutTemplate className="w-4 h-4 mr-2" /> Intel</Button>
                        {config.isTeam && (
                            <Button className="h-12 px-6 rounded-2xl font-bold border border-white/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-blue-600/20 backdrop-blur-xl hover:bg-blue-600/40 text-blue-100 transition-all">
                                <Users className="w-4 h-4 mr-2" /> Sync Team
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline UI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 px-2">
                {template.phases.map((phase: RoadmapPhase, idx: number) => (
                    <div
                        key={phase.id}
                        onClick={() => onSelectPhase(phase)}
                        className="group relative h-[300px] bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 cursor-pointer overflow-hidden transition-all duration-500 hover:border-violet-500/50 hover:bg-white/[0.04] hover:-translate-y-2 hover:shadow-[0_20px_40px_-20px_rgba(139,92,246,0.3)] flex flex-col"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex justify-between items-start mb-auto">
                            <span className="font-mono text-6xl font-black text-white/[0.05] group-hover:text-violet-500/10 transition-colors tracking-tighter -mt-2 -ml-2">
                                0{idx + 1}
                            </span>
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black/40 group-hover:bg-violet-500/20 group-hover:border-violet-500/50 transition-colors">
                                <Sparkles className="w-4 h-4 text-gray-500 group-hover:text-violet-400" />
                            </div>
                        </div>

                        <div className="z-10">
                            <h3 className="text-2xl font-black text-white mb-2">{phase.title}</h3>
                            <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-6">
                                {phase.description}
                            </p>

                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-violet-400 transition-colors">
                                <span>Execute Phase</span>
                                <ArrowRight className="w-4 h-4 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-12">
                <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Abort & Reconfigure
                </button>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────── */
/*  4. Phase Detail Workspace (Ultra-Modern)                   */
/* ─────────────────────────────────────────────────────────── */
function PhaseDetailView({ template, phase, config, onBack }: any) {
    const { user } = useAuth()
    const emailKey = user?.email || 'anonymous'
    const phaseKey = `checked_${emailKey}_${template.id}_${phase.id}`

    const [checked, setChecked] = useState<Record<number, boolean>>({})
    const [copied, setCopied] = useState(false)

    // Persist checkmarks internally for the phase
    useEffect(() => {
        getIDB(phaseKey).then((saved) => {
            if (saved) setChecked(saved)
        })
    }, [phaseKey])

    useEffect(() => {
        if (Object.keys(checked).length > 0 || true) {
            setIDB(phaseKey, checked)
        }
    }, [checked, phaseKey])

    const handleCopy = () => {
        if (!phase.goldenPrompt) return
        navigator.clipboard.writeText(phase.goldenPrompt)
        setCopied(true); setTimeout(() => setCopied(false), 2000)
    }

    const bgImage = useDynamicBackground(`${phase.title} abstract data technology`, phase.id)

    return (
        <div className="w-full space-y-6 pt-2 pb-20">
            {/* Header / Hero */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-black border border-white/10 p-8 sm:p-12 mb-8">
                {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none mix-blend-screen" />}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />

                <div className="relative z-10">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group bg-white/5 pr-4 pl-2 py-1.5 rounded-full border border-white/10 w-fit backdrop-blur-md">
                        <div className="bg-black/50 rounded-full p-1"><ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" /></div>
                        <span className="text-xs font-bold uppercase tracking-wider">Back to HUD</span>
                    </button>

                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-xl">{phase.title}</h1>
                    <p className="text-lg text-gray-300 max-w-2xl">{phase.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column (Main Content) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Golden Prompt */}
                    {phase.goldenPrompt && (
                        <div className="group relative rounded-3xl overflow-hidden border border-indigo-500/30 p-8 bg-black/40 backdrop-blur-xl">
                            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <div className="relative z-10 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30"><Sparkles className="w-5 h-5" /></div>
                                        The Golden Prompt
                                    </h2>
                                    <Button onClick={handleCopy} className="bg-white text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
                                        {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>
                                <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 font-mono text-base text-indigo-100 leading-relaxed shadow-inner">
                                    {phase.goldenPrompt}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Operational Checklist */}
                    <div className="rounded-3xl border border-white/10 p-8 bg-[#09090b]/80 backdrop-blur-xl">
                        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30"><Target className="w-5 h-5" /></div>
                            Operational Objectives
                        </h2>
                        <div className="space-y-4">
                            {phase.checklist.map((item: string, i: number) => {
                                const isDone = checked[i]
                                return (
                                    <div key={i} onClick={() => setChecked(p => ({ ...p, [i]: !p[i] }))}
                                        className={cn(
                                            'flex items-center gap-4 p-5 rounded-2xl cursor-pointer border-2 transition-all duration-300',
                                            isDone ? 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-black/60 border-white/5 hover:border-white/20'
                                        )}>
                                        <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all duration-300', isDone ? 'bg-emerald-500 border-emerald-500 text-black scale-110' : 'border-gray-600 bg-black')}>
                                            <Check className={cn("w-4 h-4 transition-all duration-300", isDone ? "opacity-100 scale-100" : "opacity-0 scale-50")} />
                                        </div>
                                        <span className={cn("text-base font-medium transition-colors", isDone ? "text-emerald-100 blur-[0.3px]" : "text-gray-300")}>{item}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                </div>

                {/* Right Column (Sidebar) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Arsenal (Tools) */}
                    <div className="rounded-3xl border border-white/10 p-6 bg-[#09090b]/80 backdrop-blur-xl">
                        <h2 className="text-lg font-black mb-4 uppercase tracking-wider text-gray-400">Toolkit Arsenal</h2>
                        <div className="space-y-3">
                            {phase.tools.map((tid: string) => {
                                const tool = TOOLS.find(t => t.id === tid) || { name: tid, url: '#', description: 'Essential execution tool' }
                                return (
                                    <a key={tid} href={tool.url} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                                            <AppLogo toolName={tool.name} toolUrl={tool.url} imgClassName="w-8 h-8 rounded-md" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">{tool.name} <ExternalLink className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" /></h4>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{tool.description}</p>
                                        </div>
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
