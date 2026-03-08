'use client'

import { useState, useMemo, useRef } from 'react'
import { TOOLS, WORKFLOWS, ToolCategory, Tool, CATEGORY_META } from './data'
import { ToolCardFeatured } from './tool-card'
import { WorkflowGenerator } from './workflow-generator'
import {
    Search,
    Sparkles,
    Lightbulb,
    ExternalLink,
    Copy,
    Check,
    Send,
    Loader2,
    X,
    Brain,
    ChevronRight,
    ChevronLeft,
    Heart,
    ArrowLeft,
    Star,
    Share2,
    Shield,
    Globe,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ─────────────────────────────────────────────────────────── */
/*  Horizontal Scroll Row                                      */
/* ─────────────────────────────────────────────────────────── */
function CategoryRow({
    title, icon, tools, favorites,
    onToggleFavorite, onSelect,
}: {
    title: string; icon: string; tools: Tool[]; favorites: string[]
    onToggleFavorite: (id: string) => void; onSelect: (tool: Tool) => void
}) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const scroll = (dir: 'left' | 'right') => {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' })
    }
    if (!tools.length) return null

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">{icon}</span>
                    <span className="truncate">{title}</span>
                    <ChevronRight className="h-5 w-5 text-gray-600 flex-shrink-0" />
                </h2>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => scroll('left')} className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {tools.map(t => (
                    <div key={t.id} className="snap-start">
                        <ToolCardFeatured
                            tool={t}
                            isFavorite={favorites.includes(t.id)}
                            onToggleFavorite={onToggleFavorite}
                            onSelect={onSelect}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────── */
/*  Discover-More Card (sidebar)                               */
/* ─────────────────────────────────────────────────────────── */
function DiscoverCard({ tool, onClick }: { tool: Tool; onClick: () => void }) {
    const catMeta = CATEGORY_META[tool.category]
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.06] transition-all duration-200 w-full text-left group"
        >
            <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: catMeta.color + '20' }}
            >
                {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate group-hover:text-white/90 transition-colors">{tool.name}</p>
                <p className="text-xs text-gray-500">{catMeta.label}</p>
            </div>
            <span className={cn(
                'text-[11px] font-bold px-2 py-0.5 rounded flex-shrink-0',
                tool.pricing === 'Free' ? 'text-emerald-400' : 'text-blue-400'
            )}>
                {tool.pricing}
            </span>
        </button>
    )
}

/* ─────────────────────────────────────────────────────────── */
/*  FULL PAGE App Detail View                                  */
/* ─────────────────────────────────────────────────────────── */
function AppDetailPage({
    tool, onBack, similarTools, onSelectTool, isFavorite, onToggleFavorite,
}: {
    tool: Tool; onBack: () => void; similarTools: Tool[]; onSelectTool: (t: Tool) => void
    isFavorite: boolean; onToggleFavorite: (id: string) => void
}) {
    const catMeta = CATEGORY_META[tool.category]
    const [aiInput, setAiInput] = useState('')
    const [aiOutput, setAiOutput] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const generateAIPrompt = async () => {
        if (!aiInput.trim()) return
        setAiLoading(true); setAiOutput('')
        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: `You are a prompt engineering expert. Generate the PERFECT prompt for the tool "${tool.name}" (${tool.description}) based on this user request: "${aiInput}". The prompt should be detailed, actionable, and optimized for the best results. Only output the prompt.` }] })
            })
            const data = await res.json()
            setAiOutput(data.response || data.text || `Here's a tailored prompt for ${tool.name}:\n\n"${aiInput}" — Create this using ${tool.name}. Focus on professional quality, clean design, and modern standards.`)
        } catch {
            setAiOutput(`Here's a tailored prompt for ${tool.name}:\n\n"${aiInput}" — Create this using ${tool.name}. Focus on professional quality, clean design, and optimization for your target audience.`)
        } finally { setAiLoading(false) }
    }

    const features = [
        tool.description,
        tool.pricing === 'Free' ? '✅ Completely free to use' : tool.pricing === 'Freemium' ? '✅ Free tier available' : `✅ ${tool.pricing} available`,
        tool.noSignup ? '✅ No signup required — start instantly' : '✅ Quick signup to get started',
        `✅ Category: ${catMeta.label}`,
        `✅ Tags: ${tool.tags.join(', ')}`,
    ]

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 px-1 sm:px-0">
            {/* Back Button */}
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 sm:mb-6 group">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-sm font-medium">Back to Store</span>
            </button>

            {/* ── HERO BANNER ── */}
            <div
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8"
                style={{ background: `linear-gradient(135deg, ${catMeta.color}25, ${catMeta.color}06, transparent)` }}
            >
                {/* Ambient gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
                {/* Big ghost icon - hidden on tiny screens */}
                <div className="absolute top-0 right-0 w-[200px] sm:w-[300px] lg:w-[400px] h-full opacity-[0.06] flex items-center justify-center text-[120px] sm:text-[160px] lg:text-[200px] pointer-events-none select-none">
                    {tool.icon}
                </div>

                <div className="relative z-10 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col sm:flex-row gap-5 sm:gap-8">
                    {/* App Icon */}
                    <div
                        className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl flex items-center justify-center text-5xl sm:text-6xl md:text-7xl shadow-2xl border-2 border-white/10"
                        style={{ backgroundColor: catMeta.color + '25' }}
                    >
                        {tool.icon}
                    </div>

                    {/* App Info */}
                    <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight truncate">
                                {tool.name}
                            </h1>
                            <p className="text-sm sm:text-base font-medium mt-1" style={{ color: catMeta.color }}>
                                {catMeta.label}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base sm:text-lg font-bold text-white">4.5</span>
                                <div className="flex">
                                    {[1, 2, 3, 4].map(i => <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />)}
                                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400/40 text-amber-400/40" />
                                </div>
                            </div>
                            <span className="text-sm text-gray-500 hidden sm:inline">|</span>
                            <span className={cn(
                                'text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1 rounded-lg',
                                tool.pricing === 'Free' ? 'bg-emerald-500/20 text-emerald-300'
                                    : tool.pricing === 'Freemium' ? 'bg-blue-500/20 text-blue-300'
                                        : 'bg-amber-500/20 text-amber-300'
                            )}>
                                {tool.pricing}
                            </span>
                            {tool.noSignup && (
                                <span className="text-xs font-medium bg-green-500/15 text-green-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                    <Shield className="h-3 w-3" /> No Signup
                                </span>
                            )}
                        </div>

                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none">
                            {tool.description}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2 flex-wrap">
                            <Button
                                size="lg"
                                className="h-11 sm:h-12 px-6 sm:px-10 rounded-xl text-sm sm:text-base font-bold shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                                style={{ backgroundColor: catMeta.color, color: '#fff' }}
                                onClick={() => window.open(tool.url, '_blank')}
                            >
                                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Open App
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-11 sm:h-12 px-4 sm:px-5 rounded-xl border-white/15 text-white hover:bg-white/10 transition-all duration-200"
                                onClick={() => onToggleFavorite(tool.id)}
                            >
                                <Heart className={cn('h-5 w-5 transition-all duration-300', isFavorite ? 'fill-red-500 text-red-500 scale-110' : '')} />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-11 sm:h-12 px-4 sm:px-5 rounded-xl border-white/15 text-white hover:bg-white/10 transition-all duration-200"
                                onClick={() => { navigator.clipboard.writeText(tool.url); }}
                            >
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT + SIDEBAR ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-6 lg:gap-8">
                {/* Left Column */}
                <div className="space-y-6 sm:space-y-8 min-w-0">
                    {/* Description */}
                    <section className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-500" /> Description
                        </h3>
                        <div className="space-y-2">
                            {features.map((f, i) => (
                                <p key={i} className="text-sm text-gray-300 leading-relaxed">{f}</p>
                            ))}
                        </div>
                    </section>

                    {/* Tags */}
                    <section className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {tool.tags.map(tag => (
                                <span key={tag} className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/[0.06] text-gray-300 border border-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-default">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Quick Hackathon Prompt */}
                    {tool.hackathonPrompt && (
                        <section
                            className="rounded-2xl border border-amber-500/20 p-5 sm:p-6"
                            style={{ background: `linear-gradient(135deg, ${catMeta.color}06, transparent)` }}
                        >
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h3 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" /> Quick Hackathon Prompt
                                </h3>
                                <Button size="sm" variant="ghost" className="text-amber-300 hover:bg-amber-500/20 rounded-lg gap-1.5" onClick={() => copyText(tool.hackathonPrompt || '')}>
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    <span className="text-xs hidden sm:inline">Copy</span>
                                </Button>
                            </div>
                            <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed bg-black/20 rounded-xl p-3 sm:p-4 font-mono">
                                {tool.hackathonPrompt}
                            </p>
                        </section>
                    )}

                    {/* AI Prompt Generator */}
                    <section className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent border border-purple-500/20 p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-4 sm:mb-5">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-white">AI Prompt Generator</h3>
                                <p className="text-xs sm:text-sm text-gray-400 truncate">Describe what you need → AI creates the perfect prompt</p>
                            </div>
                        </div>

                        <div className="flex gap-2 sm:gap-3">
                            <Input
                                placeholder={`e.g., Create a pitch deck for my startup...`}
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && generateAIPrompt()}
                                className="h-11 sm:h-12 text-sm rounded-xl bg-white/[0.06] border-white/[0.08] text-white placeholder:text-gray-500 focus:border-purple-500/30"
                            />
                            <Button
                                onClick={generateAIPrompt}
                                disabled={aiLoading || !aiInput.trim()}
                                className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg flex-shrink-0 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                            >
                                {aiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </Button>
                        </div>

                        {aiOutput && (
                            <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-black/30 border border-white/[0.06] relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <pre className="text-xs sm:text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed pr-8 sm:pr-10 max-h-[300px] overflow-y-auto">
                                    {aiOutput}
                                </pre>
                                <Button
                                    size="sm" variant="ghost"
                                    className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                                    onClick={() => copyText(aiOutput)}
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Sidebar — Discover More */}
                <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        Discover more <ChevronRight className="h-4 w-4 text-gray-500" />
                    </h3>
                    <div className="space-y-1 max-h-[600px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {similarTools.map(st => (
                            <DiscoverCard key={st.id} tool={st} onClick={() => onSelectTool(st)} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────── */
/*  MAIN PANEL                                                 */
/* ─────────────────────────────────────────────────────────── */
export function LastMinutePanel() {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'store' | 'all' | 'workflow'>('store')
    const [favorites, setFavorites] = useState<string[]>([])
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null)

    const categories = Object.keys(CATEGORY_META) as ToolCategory[]

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return null
        return TOOLS.filter(tool =>
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    }, [searchQuery])

    const toolsByCategory = useMemo(() => {
        const map: Record<string, Tool[]> = {}
        for (const cat of categories) { map[cat] = TOOLS.filter(t => t.category === cat) }
        return map
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const toggleFavorite = (id: string) => {
        setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
    }

    const selectTool = (tool: Tool) => {
        setSelectedTool(tool)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const similarTools = useMemo(() => {
        if (!selectedTool) return []
        return TOOLS.filter(t => t.category === selectedTool.category && t.id !== selectedTool.id).slice(0, 8)
    }, [selectedTool])

    const featuredTools = TOOLS.filter(t => t.hackathonPrompt).slice(0, 14)
    const freeTools = TOOLS.filter(t => t.pricing === 'Free').slice(0, 14)
    const aiTools = TOOLS.filter(t => t.category === 'research-ai')

    /* ── FULL-PAGE APP DETAIL ── */
    if (selectedTool) {
        return (
            <AppDetailPage
                tool={selectedTool}
                onBack={() => setSelectedTool(null)}
                similarTools={similarTools}
                onSelectTool={selectTool}
                isFavorite={favorites.includes(selectedTool.id)}
                onToggleFavorite={toggleFavorite}
            />
        )
    }

    /* ── STORE VIEW ── */
    return (
        <div className="flex flex-col h-full space-y-5 sm:space-y-6 px-1 sm:px-0">
            {/* ── TOP BAR ── */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-lg pb-3 sm:pb-4 pt-2 space-y-3 sm:space-y-4">
                {/* Search */}
                <div className="relative max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto w-full">
                    <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    <Input
                        placeholder="Search apps, tools, and more"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 sm:pl-12 pr-10 h-10 sm:h-12 text-sm sm:text-base rounded-full bg-white/[0.06] border-white/[0.08] text-white placeholder:text-gray-500 focus:bg-white/[0.10] focus:ring-1 focus:ring-white/15 transition-all duration-200"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors">
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {[
                        { id: 'store' as const, label: 'Home', icon: '🏠' },
                        { id: 'all' as const, label: 'All Apps', icon: '📱' },
                        { id: 'workflow' as const, label: 'Workflows', icon: '⚡' },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => { setViewMode(tab.id); setSearchQuery(''); }}
                            className={cn(
                                'px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0',
                                viewMode === tab.id ? 'bg-white/[0.10] text-white' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                            )}>
                            <span>{tab.icon}</span>{tab.label}
                        </button>
                    ))}
                    <div className="ml-auto flex-shrink-0">
                        <Badge className="bg-white/[0.06] text-gray-400 border-white/[0.08] text-xs sm:text-sm">
                            {TOOLS.length} tools
                        </Badge>
                    </div>
                </div>
            </div>

            {/* ── SEARCH RESULTS ── */}
            {searchResults ? (
                <div className="space-y-4 pb-10">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                        {searchResults.length} results for &quot;{searchQuery}&quot;
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
                        {searchResults.map(t => (
                            <ToolCardFeatured key={t.id} tool={t} isFavorite={favorites.includes(t.id)} onToggleFavorite={toggleFavorite} onSelect={selectTool} />
                        ))}
                    </div>
                    {searchResults.length === 0 && (
                        <div className="py-12 sm:py-16 text-center">
                            <p className="text-base sm:text-lg text-gray-400">No tools found.</p>
                            <Button variant="link" onClick={() => setSearchQuery('')} className="text-blue-400 mt-2">Clear search</Button>
                        </div>
                    )}
                </div>
            ) : viewMode === 'store' ? (
                <div className="space-y-8 sm:space-y-10 pb-10">
                    <CategoryRow title="Popular Tools" icon="🔥" tools={featuredTools} favorites={favorites} onToggleFavorite={toggleFavorite} onSelect={selectTool} />
                    <CategoryRow title="Best Free Tools" icon="💚" tools={freeTools} favorites={favorites} onToggleFavorite={toggleFavorite} onSelect={selectTool} />
                    <CategoryRow title="AI & Research" icon="🧠" tools={aiTools} favorites={favorites} onToggleFavorite={toggleFavorite} onSelect={selectTool} />
                    {categories.filter(c => c !== 'research-ai').map(cat => {
                        const catTools = toolsByCategory[cat]
                        if (!catTools?.length) return null
                        const meta = CATEGORY_META[cat]
                        return <CategoryRow key={cat} title={meta.label} icon={meta.icon} tools={catTools} favorites={favorites} onToggleFavorite={toggleFavorite} onSelect={selectTool} />
                    })}
                </div>
            ) : viewMode === 'all' ? (
                <div className="space-y-8 sm:space-y-10 pb-10">
                    {categories.map(cat => {
                        const catTools = toolsByCategory[cat]
                        if (!catTools?.length) return null
                        const meta = CATEGORY_META[cat]
                        return (
                            <section key={cat} className="space-y-3 sm:space-y-4">
                                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl">{meta.icon}</span> {meta.label}
                                    <ChevronRight className="h-5 w-5 text-gray-600" />
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
                                    {catTools.map(t => (
                                        <ToolCardFeatured key={t.id} tool={t} isFavorite={favorites.includes(t.id)} onToggleFavorite={toggleFavorite} onSelect={selectTool} />
                                    ))}
                                </div>
                            </section>
                        )
                    })}
                </div>
            ) : (
                <WorkflowGenerator workflows={WORKFLOWS} />
            )}
        </div>
    )
}
