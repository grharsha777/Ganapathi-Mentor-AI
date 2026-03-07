'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContentStore } from '@/lib/content-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Loader2, Video, Download, Sparkles, Wand2,
    Layers, Zap, Film, ChevronRight,
    CheckCircle2, AlertCircle, RefreshCcw,
    Settings2, Clock, Ratio, Palette,
    Volume2, VolumeX, Play, Pause,
    RotateCcw, Maximize2, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Provider = 'kling' | 'runway' | 'huggingface'

interface GenerationTask {
    id: string
    provider: Provider
    status: 'processing' | 'completed' | 'failed'
    videoUrl?: string
    prompt: string
    timestamp: number
}

const STYLE_PRESETS = [
    { id: 'cinematic', label: 'Cinematic', icon: '🎬', gradient: 'from-amber-500 to-orange-600' },
    { id: 'anime', label: 'Anime', icon: '🎨', gradient: 'from-pink-500 to-purple-600' },
    { id: 'photorealistic', label: 'Photorealistic', icon: '📸', gradient: 'from-emerald-500 to-teal-600' },
    { id: 'abstract', label: 'Abstract', icon: '🌀', gradient: 'from-violet-500 to-indigo-600' },
    { id: 'scifi', label: 'Sci-Fi', icon: '🚀', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'noir', label: 'Film Noir', icon: '🎞️', gradient: 'from-gray-500 to-zinc-700' },
]

const PROMPT_TEMPLATES = [
    "A futuristic cityscape with neon lights reflecting off wet streets at night",
    "A majestic dragon soaring through aurora borealis over snow-capped mountains",
    "Underwater coral reef teeming with bioluminescent sea creatures",
    "A time-lapse of a flower blooming in a mystical enchanted forest",
    "Astronaut floating through a nebula with vibrant cosmic colors",
    "Samurai warrior meditating under cherry blossoms with falling petals",
]

export function AdvancedVideoStudio() {
    const [prompt, setPrompt] = useState('')
    const [provider, setProvider] = useState<Provider>('kling')
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9')
    const [duration, setDuration] = useState(5)
    const [stylePreset, setStylePreset] = useState('cinematic')
    const [loading, setLoading] = useState(false)
    const [currentTask, setCurrentTask] = useState<GenerationTask | null>(null)
    const [history, setHistory] = useState<GenerationTask[]>([])
    const [showPresets, setShowPresets] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [isMuted, setIsMuted] = useState(true)
    const [isPlaying, setIsPlaying] = useState(true)

    const store = useContentStore('media')
    const pollingInterval = useRef<NodeJS.Timeout | null>(null)
    const timerInterval = useRef<NodeJS.Timeout | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        store.load<GenerationTask[]>('video_history_v2').then(data => {
            if (data) setHistory(data)
        }).catch(() => { })
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current)
            if (timerInterval.current) clearInterval(timerInterval.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const startTimer = useCallback(() => {
        setElapsedTime(0)
        if (timerInterval.current) clearInterval(timerInterval.current)
        timerInterval.current = setInterval(() => setElapsedTime(p => p + 1), 1000)
    }, [])

    const stopTimer = useCallback(() => {
        if (timerInterval.current) clearInterval(timerInterval.current)
    }, [])

    const startPolling = useCallback((taskId: string, taskProvider: Provider, taskPrompt: string) => {
        if (pollingInterval.current) clearInterval(pollingInterval.current)

        pollingInterval.current = setInterval(async () => {
            try {
                const res = await fetch('/api/generate-video', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'status', videoId: taskId, provider: taskProvider }),
                    credentials: 'include',
                })
                const data = await res.json()

                if (data.status === 'completed' || data.status === 'failed') {
                    if (pollingInterval.current) clearInterval(pollingInterval.current)
                    stopTimer()
                    setLoading(false)

                    const updatedTask: GenerationTask = {
                        id: taskId, provider: taskProvider, status: data.status,
                        videoUrl: data.videoUrl, prompt: taskPrompt, timestamp: Date.now()
                    }
                    setCurrentTask(updatedTask)
                    setHistory(prev => {
                        const newH = [updatedTask, ...prev.filter(h => h.id !== taskId)].slice(0, 20)
                        store.save('video_history_v2', newH, 'History update').catch(() => { })
                        return newH
                    })

                    if (data.status === 'completed') {
                        toast.success("Render Complete!", { description: "Your cinematic sequence is ready." })
                    } else {
                        toast.error("Render Failed", { description: "The AI engine encountered an issue. Please retry." })
                    }
                }
            } catch (e) { console.error("Poll error:", e) }
        }, 4000)
    }, [stopTimer, store])

    const handleGenerate = async () => {
        if (!prompt.trim()) return
        setLoading(true)
        setCurrentTask(null)
        startTimer()

        const enhancedPrompt = `${prompt.trim()}, ${stylePreset} style, high quality, detailed`

        try {
            const res = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate', text: enhancedPrompt,
                    provider, aspect_ratio: aspectRatio,
                    durationSeconds: duration
                }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            const newTask: GenerationTask = {
                id: data.video_id, provider: data.provider, status: data.status,
                videoUrl: data.video_url, prompt: prompt.trim(), timestamp: Date.now()
            }
            setCurrentTask(newTask)

            if (data.status === 'processing') {
                startPolling(data.video_id, data.provider, prompt.trim())
            } else {
                setLoading(false); stopTimer()
                setHistory(prev => {
                    const newH = [newTask, ...prev].slice(0, 20)
                    store.save('video_history_v2', newH, 'History update').catch(() => { })
                    return newH
                })
            }
        } catch (e: any) {
            toast.error("Generation Failed", { description: e.message })
            setLoading(false); stopTimer()
        }
    }

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

    const togglePlay = () => {
        if (!videoRef.current) return
        if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
        else { videoRef.current.pause(); setIsPlaying(false) }
    }

    return (
        <div className="min-h-screen">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-50" />
                    </div>
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400">Neural Engine Online</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span className="text-[10px] font-mono text-slate-400">{loading ? formatTime(elapsedTime) : '00:00'}</span>
                    </div>
                </div>
            </div>

            <div className="grid xl:grid-cols-[1fr_380px] gap-6">
                {/* Main Panel */}
                <div className="space-y-6">
                    {/* Cinema Display */}
                    <div className="relative rounded-2xl overflow-hidden bg-[#030308] border border-white/[0.06] shadow-[0_0_80px_-20px_rgba(6,182,212,0.15)]">
                        {/* Top chrome bar */}
                        <div className="flex items-center justify-between px-5 py-3 bg-[#0A0A12] border-b border-white/[0.04]">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                                </div>
                                <span className="text-[9px] font-mono text-white/20 ml-2">VIEWPORT — {aspectRatio} @ {duration}s</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {currentTask?.videoUrl && (
                                    <>
                                        <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 rounded-md hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors">
                                            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                                        </button>
                                        <button onClick={togglePlay} className="p-1.5 rounded-md hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors">
                                            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                        </button>
                                    </>
                                )}
                                <button className="p-1.5 rounded-md hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors">
                                    <Maximize2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Main viewport */}
                        <div className="aspect-video w-full flex items-center justify-center relative overflow-hidden">
                            {/* Ambient scan lines for cyberpunk feel */}
                            <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.015] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />

                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-8 relative z-20">
                                        {/* Orbital spinner */}
                                        <div className="relative w-32 h-32">
                                            <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-[spin_8s_linear_infinite]" />
                                            <div className="absolute inset-2 rounded-full border border-cyan-500/20 animate-[spin_5s_linear_infinite_reverse]" />
                                            <div className="absolute inset-4 rounded-full border-t-2 border-cyan-500 animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <span className="text-2xl font-black font-mono text-cyan-400">{formatTime(elapsedTime)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3 text-center max-w-md">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                                <p className="text-cyan-400 font-black tracking-[0.25em] uppercase text-[10px]">
                                                    {elapsedTime < 15 ? 'Initializing Neural Cores' :
                                                        elapsedTime < 45 ? 'Diffusion Cascade Active' :
                                                            elapsedTime < 90 ? 'Temporal Coherence Pass' :
                                                                'Final Frame Assembly'}
                                                </p>
                                            </div>
                                            <div className="w-72 h-1 bg-white/[0.03] rounded-full overflow-hidden mx-auto">
                                                <motion.div
                                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500/80 via-blue-500/80 to-purple-500/80"
                                                    animate={{ width: ['0%', '100%'] }}
                                                    transition={{ duration: 120, ease: "linear" }}
                                                />
                                            </div>
                                            <p className="text-[9px] text-white/15 font-mono">
                                                ENGINE: {provider.toUpperCase()} | STYLE: {stylePreset.toUpperCase()} | RES: 4K
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : currentTask?.videoUrl ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
                                        <video
                                            ref={videoRef}
                                            src={currentTask.videoUrl}
                                            className="w-full h-full object-contain"
                                            autoPlay loop muted={isMuted}
                                        />
                                    </motion.div>
                                ) : currentTask?.status === 'failed' ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                                        <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
                                            <AlertCircle className="h-10 w-10 text-red-500/60 mx-auto mb-3" />
                                            <p className="text-red-400 text-xs font-bold">Render Failed</p>
                                            <p className="text-white/20 text-[10px] mt-1">Try a different engine or simplify your prompt</p>
                                        </div>
                                        <Button onClick={() => setCurrentTask(null)} variant="ghost" size="sm" className="text-white/30 hover:text-white/60">
                                            <RotateCcw className="h-3 w-3 mr-2" />Retry
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
                                        <div className="relative inline-block">
                                            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.04]">
                                                <Film className="h-16 w-16 text-white/[0.06]" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-500/30 animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-white/20 text-xs font-medium">Describe your vision below</p>
                                            <p className="text-white/10 text-[10px] mt-1">Powered by Kling AI + Runway Gen-4 + Wan-AI</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Bottom control bar with download */}
                        {currentTask?.videoUrl && (
                            <div className="flex items-center justify-between px-5 py-3 bg-[#0A0A12] border-t border-white/[0.04]">
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3 w-3" /> RENDER COMPLETE
                                    </span>
                                    <span className="text-[9px] font-mono text-white/15">| {currentTask.provider.toUpperCase()}</span>
                                </div>
                                <Button size="sm" className="h-7 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[10px] font-bold" asChild>
                                    <a href={currentTask.videoUrl} download={`ganapathi-video-${Date.now()}.mp4`}>
                                        <Download className="h-3 w-3 mr-1.5" /> Export MP4
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Prompt Composer */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all pointer-events-none" />
                            <div className="relative flex items-stretch rounded-2xl bg-[#0A0A12] border border-white/[0.06] overflow-hidden focus-within:border-cyan-500/30 transition-all group">
                                <div className="flex-1 flex items-center">
                                    <Wand2 className="h-4 w-4 text-white/10 ml-5 mr-3 flex-shrink-0" />
                                    <textarea
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                        placeholder="Describe the impossible — e.g., &quot;A lone astronaut discovering an ancient temple on Mars during a dust storm&quot;"
                                        className="w-full bg-transparent border-none outline-none text-sm text-white/80 placeholder:text-white/15 font-medium py-4 pr-4 resize-none min-h-[56px] max-h-[120px]"
                                        rows={1}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate() } }}
                                    />
                                </div>
                                <div className="flex items-center pr-2 gap-2">
                                    <button
                                        onClick={() => {
                                            const t = PROMPT_TEMPLATES[Math.floor(Math.random() * PROMPT_TEMPLATES.length)]
                                            setPrompt(t)
                                        }}
                                        className="p-2.5 rounded-xl hover:bg-white/5 text-white/15 hover:text-cyan-400 transition-all"
                                        title="Random prompt"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                    </button>
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={loading || !prompt.trim()}
                                        className="rounded-xl px-6 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black uppercase tracking-wider text-[10px] shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)] disabled:opacity-30 disabled:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Render'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Style Presets Bar */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {STYLE_PRESETS.map(preset => (
                                <button
                                    key={preset.id}
                                    onClick={() => setStylePreset(preset.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3.5 py-2 rounded-xl border whitespace-nowrap transition-all text-[11px] font-bold",
                                        stylePreset === preset.id
                                            ? `bg-gradient-to-r ${preset.gradient} border-transparent text-white shadow-lg`
                                            : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/10"
                                    )}
                                >
                                    <span>{preset.icon}</span>
                                    <span>{preset.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Engine Selector */}
                    <div className="grid sm:grid-cols-3 gap-3">
                        <EngineCard
                            active={provider === 'kling'} onClick={() => setProvider('kling')}
                            icon={<Zap className="h-4 w-4" />} title="Kling v1.0" desc="Cinematic Mastery"
                            color="cyan" badge="RECOMMENDED"
                        />
                        <EngineCard
                            active={provider === 'runway'} onClick={() => setProvider('runway')}
                            icon={<Layers className="h-4 w-4" />} title="Runway Gen-4" desc="Ultra Realistic"
                            color="purple" badge="TURBO"
                        />
                        <EngineCard
                            active={provider === 'huggingface'} onClick={() => setProvider('huggingface')}
                            icon={<Sparkles className="h-4 w-4" />} title="Wan-AI 2.1" desc="Open Source"
                            color="blue" badge="FREE"
                        />
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-5">
                    {/* Control Panel */}
                    <Card className="bg-[#0A0A12] border-white/[0.06] text-white overflow-hidden">
                        <CardHeader className="pb-3 border-b border-white/[0.04]">
                            <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 flex items-center gap-2">
                                <Settings2 className="h-3 w-3" /> Render Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-6">
                            {/* Aspect Ratio */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-white/25 uppercase tracking-wider flex items-center gap-2">
                                    <Ratio className="h-3 w-3" /> Frame Ratio
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['16:9', '9:16', '1:1'] as const).map(ratio => (
                                        <button
                                            key={ratio}
                                            onClick={() => setAspectRatio(ratio)}
                                            className={cn(
                                                "relative p-3 rounded-xl border text-center transition-all group/ratio",
                                                aspectRatio === ratio
                                                    ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_-5px_rgba(6,182,212,0.5)]"
                                                    : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
                                            )}
                                        >
                                            <div className={cn(
                                                "mx-auto mb-1.5 border rounded-sm transition-all",
                                                ratio === '16:9' ? 'w-8 h-5' : ratio === '9:16' ? 'w-5 h-8' : 'w-6 h-6',
                                                aspectRatio === ratio ? 'border-cyan-400' : 'border-white/10 group-hover/ratio:border-white/20'
                                            )} />
                                            <span className={cn("text-[10px] font-black", aspectRatio === ratio ? 'text-cyan-400' : 'text-white/25')}>
                                                {ratio}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-white/25 uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="h-3 w-3" /> Duration
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[5, 10].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDuration(d)}
                                            className={cn(
                                                "p-2.5 rounded-xl border text-[10px] font-black transition-all",
                                                duration === d
                                                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                                                    : "bg-white/[0.02] border-white/[0.06] text-white/25 hover:border-white/10"
                                            )}
                                        >
                                            {d}s
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Render Specs Panel */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/[0.03] to-blue-500/[0.03] border border-cyan-500/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-wider">Output Specs</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {[
                                        ['Resolution', '4K UHD'],
                                        ['Frame Rate', '24 fps'],
                                        ['Codec', 'H.264'],
                                        ['Bitrate', 'Auto'],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex items-center justify-between">
                                            <span className="text-[9px] text-white/15 font-medium">{k}</span>
                                            <span className="text-[9px] text-cyan-400/60 font-bold font-mono">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Engine Status */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Engine Status</span>
                                </div>
                                {[
                                    { name: 'Kling v1.0', status: 'online', load: 72 },
                                    { name: 'Runway Gen-4', status: 'online', load: 45 },
                                    { name: 'Wan-AI 2.1', status: 'online', load: 31 },
                                ].map(engine => (
                                    <div key={engine.name} className="flex items-center justify-between py-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", engine.status === 'online' ? 'bg-emerald-500' : 'bg-red-500')} />
                                            <span className="text-[10px] text-white/30 font-medium">{engine.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500/50 rounded-full" style={{ width: `${engine.load}%` }} />
                                            </div>
                                            <span className="text-[9px] font-mono text-white/15">{engine.load}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Render History */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-white/20 flex items-center gap-2">
                                <Film className="h-3 w-3" /> Recent Renders
                            </h3>
                            <span className="text-[9px] text-white/10 font-mono">{history.length}/20</span>
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
                            {history.length === 0 ? (
                                <div className="p-10 rounded-xl border border-dashed border-white/[0.04] text-center">
                                    <Video className="h-6 w-6 text-white/5 mx-auto mb-2" />
                                    <p className="text-[10px] text-white/10 font-medium">No renders yet</p>
                                </div>
                            ) : history.map((h, i) => (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    key={h.id + h.timestamp}
                                    className="w-full group p-3 rounded-xl bg-[#0A0A12] border border-white/[0.04] hover:border-cyan-500/20 transition-all flex gap-3 text-left relative overflow-hidden"
                                    onClick={() => { if (h.status === 'completed') setCurrentTask(h) }}
                                >
                                    <div className="w-14 h-10 rounded-lg bg-black flex-shrink-0 flex items-center justify-center border border-white/[0.04] overflow-hidden">
                                        {h.videoUrl ? (
                                            <video src={h.videoUrl} className="w-full h-full object-cover" muted />
                                        ) : h.status === 'failed' ? (
                                            <AlertCircle className="h-3 w-3 text-red-500/40" />
                                        ) : (
                                            <RefreshCcw className="h-3 w-3 text-cyan-500/30 animate-spin" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold text-white/40 truncate group-hover:text-white/60 transition-colors">{h.prompt}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={cn(
                                                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                                                h.provider === 'kling' ? 'bg-cyan-500/10 text-cyan-400/60' :
                                                    h.provider === 'runway' ? 'bg-purple-500/10 text-purple-400/60' : 'bg-blue-500/10 text-blue-400/60'
                                            )}>
                                                {h.provider}
                                            </span>
                                            <span className={cn(
                                                "text-[8px] font-bold uppercase",
                                                h.status === 'completed' ? 'text-emerald-500/50' : h.status === 'failed' ? 'text-red-500/50' : 'text-yellow-500/50'
                                            )}>
                                                {h.status}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 text-white/[0.03] group-hover:text-cyan-500/30 transition-colors" />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function EngineCard({ active, onClick, icon, title, desc, color, badge }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string;
    color: 'cyan' | 'purple' | 'blue'; badge?: string;
}) {
    const colors = {
        cyan: {
            active: 'border-cyan-500/40 shadow-[0_0_25px_-8px_rgba(6,182,212,0.4)] ring-1 ring-cyan-500/10',
            text: 'text-cyan-400', bg: 'bg-cyan-500/10', badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
        },
        purple: {
            active: 'border-purple-500/40 shadow-[0_0_25px_-8px_rgba(168,85,247,0.4)] ring-1 ring-purple-500/10',
            text: 'text-purple-400', bg: 'bg-purple-500/10', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        },
        blue: {
            active: 'border-blue-500/40 shadow-[0_0_25px_-8px_rgba(59,130,246,0.4)] ring-1 ring-blue-500/10',
            text: 'text-blue-400', bg: 'bg-blue-500/10', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        },
    }

    return (
        <motion.button
            whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
            onClick={onClick}
            className={cn(
                "w-full p-4 rounded-2xl bg-[#0A0A12] border text-left transition-all relative overflow-hidden",
                active ? colors[color].active : "border-white/[0.04] hover:border-white/[0.08]"
            )}
        >
            {active && <div className={cn("absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent", `via-${color === 'cyan' ? 'cyan' : color === 'purple' ? 'purple' : 'blue'}-500`)} />}
            <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-lg", active ? colors[color].bg : "bg-white/[0.03]")}>
                    <div className={active ? colors[color].text : "text-white/15"}>{icon}</div>
                </div>
                {badge && (
                    <span className={cn("text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border", active ? colors[color].badge : "bg-white/[0.02] text-white/10 border-white/[0.04]")}>
                        {badge}
                    </span>
                )}
            </div>
            <h4 className={cn("font-black tracking-tight text-xs", active ? 'text-white' : 'text-white/30')}>{title}</h4>
            <p className="text-[10px] font-medium text-white/15 mt-0.5">{desc}</p>
        </motion.button>
    )
}
