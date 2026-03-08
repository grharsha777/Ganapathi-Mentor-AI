'use client'

import { useState, useMemo } from 'react'
import { TOOLS, WORKFLOWS, ToolCategory, Tool, CATEGORY_META } from './data'
import { ToolCard } from './tool-card'
import { WorkflowGenerator } from './workflow-generator'
import {
    Search,
    Sparkles,
    Lightbulb,
    ExternalLink,
    Zap,
    Copy,
    Check,
    Star,
    Send,
    Loader2,
    X,
    Brain,
    Rocket,
    ArrowRight,
    Heart,
    Shield,
    Globe,
    Code2,
    Palette,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function LastMinutePanel() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all')
    const [viewMode, setViewMode] = useState<'directory' | 'workflow'>('directory')
    const [favorites, setFavorites] = useState<string[]>([])
    const [selectedPromptTool, setSelectedPromptTool] = useState<Tool | null>(null)
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
    const [aiPromptInput, setAiPromptInput] = useState('')
    const [aiPromptOutput, setAiPromptOutput] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    // -- Search & Filter --
    const filteredTools = useMemo(() => {
        return TOOLS.filter((tool) => {
            const matchesSearch =
                tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [searchQuery, selectedCategory])

    const categories = Object.keys(CATEGORY_META) as ToolCategory[]

    const toggleFavorite = (id: string) => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        )
    }

    const generateAIPrompt = async () => {
        if (!aiPromptInput.trim() || !selectedTool) return
        setAiLoading(true)
        setAiPromptOutput('')
        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: `You are a prompt engineering expert. Generate the PERFECT prompt for the tool "${selectedTool.name}" (${selectedTool.description}) based on this user request: "${aiPromptInput}". The prompt should be detailed, actionable, and optimized for the best results in ${selectedTool.name}. Only output the prompt, nothing else.`
                    }]
                })
            })
            const data = await res.json()
            setAiPromptOutput(data.response || data.text || 'Could not generate prompt. Try describing your need in more detail.')
        } catch {
            setAiPromptOutput(
                `Here's a tailored prompt for ${selectedTool.name}:\n\n"${aiPromptInput}" — Create this using ${selectedTool.name}. Focus on professional quality, clean design, and optimization for the target audience. Use best practices and modern standards.`
            )
        } finally {
            setAiLoading(false)
        }
    }

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <div className="flex flex-col h-full space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 p-8">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                                Last Minute Arsenal
                            </h1>
                            <p className="text-lg text-muted-foreground mt-1 flex items-center gap-2">
                                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm font-bold">
                                    {TOOLS.length}+ Tools
                                </Badge>
                                Free & low-cost tools for rapid prototyping, hackathons, and research
                            </p>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center p-1.5 bg-muted/50 rounded-2xl border border-border/30 backdrop-blur-sm">
                        <button
                            onClick={() => setViewMode('directory')}
                            className={cn(
                                'px-6 py-3 text-base font-bold rounded-xl transition-all duration-300',
                                viewMode === 'directory'
                                    ? 'bg-background shadow-lg text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Globe className="h-4 w-4 inline mr-2" />
                            Directory
                        </button>
                        <button
                            onClick={() => setViewMode('workflow')}
                            className={cn(
                                'px-6 py-3 text-base font-bold rounded-xl transition-all duration-300 flex items-center gap-2',
                                viewMode === 'workflow'
                                    ? 'bg-background shadow-lg text-amber-400'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Sparkles className="h-4 w-4" />
                            Workflows
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'directory' ? (
                <>
                    {/* Search & Categories */}
                    <div className="space-y-5">
                        <div className="relative">
                            <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search tools, categories, or tags (e.g., 'deploy next.js', 'video ai', 'design')..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 text-lg bg-muted/30 border-2 border-border/30 rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2.5 pb-2">
                            <Button
                                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory('all')}
                                className="rounded-full text-sm h-10 px-5 font-bold"
                            >
                                All
                            </Button>
                            {categories.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat)}
                                    className="rounded-full gap-2 text-sm h-10 px-5 font-semibold"
                                    style={
                                        selectedCategory === cat
                                            ? { backgroundColor: CATEGORY_META[cat].color, color: '#fff', borderColor: CATEGORY_META[cat].color }
                                            : {}
                                    }
                                >
                                    <span className="text-base">{CATEGORY_META[cat].icon}</span>
                                    {CATEGORY_META[cat].label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pb-10">
                        {filteredTools.length > 0 ? (
                            filteredTools.map((tool) => (
                                <ToolCard
                                    key={tool.id}
                                    tool={tool}
                                    isFavorite={favorites.includes(tool.id)}
                                    onToggleFavorite={toggleFavorite}
                                    onShowPrompt={setSelectedPromptTool}
                                    onSelect={setSelectedTool}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
                                    <Search className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-bold">No tools found</h3>
                                <p className="text-lg text-muted-foreground mt-2">
                                    Try adjusting your search or category filter.
                                </p>
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setSearchQuery('')
                                        setSelectedCategory('all')
                                    }}
                                    className="mt-4 text-base"
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <WorkflowGenerator workflows={WORKFLOWS} />
            )}

            {/* ── TOOL DETAIL DIALOG ── */}
            <Dialog open={!!selectedTool} onOpenChange={(open) => { if (!open) { setSelectedTool(null); setAiPromptInput(''); setAiPromptOutput(''); } }}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                            <span className="text-4xl">{selectedTool?.icon}</span>
                            {selectedTool?.name}
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            {selectedTool?.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* Info */}
                        <div className="flex flex-wrap gap-2">
                            {selectedTool && (
                                <Badge variant="outline" className={cn(
                                    'text-sm font-bold px-3 py-1.5 rounded-full border-2',
                                    selectedTool.pricing === 'Free' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                                        selectedTool.pricing === 'Freemium' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                                            'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                )}>
                                    {selectedTool.pricing}
                                </Badge>
                            )}
                            {selectedTool?.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-sm rounded-full">#{tag}</Badge>
                            ))}
                        </div>

                        {/* AI Prompt Generator */}
                        <div className="p-5 rounded-2xl border-2 border-purple-500/20 bg-purple-500/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                    <Brain className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold">AI Prompt Generator</h4>
                                    <p className="text-sm text-muted-foreground">Describe what you need and AI will create the perfect prompt</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g., Create a pitch deck for my AI startup with 10 slides..."
                                    value={aiPromptInput}
                                    onChange={(e) => setAiPromptInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && generateAIPrompt()}
                                    className="h-12 text-base rounded-xl bg-muted/30"
                                />
                                <Button
                                    onClick={generateAIPrompt}
                                    disabled={aiLoading || !aiPromptInput.trim()}
                                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 hover:opacity-90"
                                >
                                    {aiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </Button>
                            </div>

                            {aiPromptOutput && (
                                <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/30 relative group">
                                    <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-mono leading-relaxed">
                                        {aiPromptOutput}
                                    </pre>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg"
                                        onClick={() => copyText(aiPromptOutput)}
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Hackathon Prompt */}
                        {selectedTool?.hackathonPrompt && (
                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                <h4 className="text-base font-bold text-amber-400 mb-3 flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5" /> Quick Hackathon Prompt
                                </h4>
                                <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-mono">
                                    {selectedTool.hackathonPrompt}
                                </pre>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                size="lg"
                                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-lg font-bold"
                                onClick={() => window.open(selectedTool?.url, '_blank')}
                            >
                                <ExternalLink className="h-5 w-5 mr-2" /> Open {selectedTool?.name}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── PROMPT DIALOG (legacy) ── */}
            <Dialog open={!!selectedPromptTool} onOpenChange={(open) => !open && setSelectedPromptTool(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                <Lightbulb className="h-6 w-6" />
                            </div>
                            Prompt for {selectedPromptTool?.name}
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Copy this prompt into {selectedPromptTool?.name} to jumpstart your project.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 p-5 rounded-xl bg-muted/50 border relative group">
                        <pre className="text-base text-foreground/90 whitespace-pre-wrap font-mono leading-relaxed">
                            {selectedPromptTool?.hackathonPrompt}
                        </pre>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg"
                            onClick={() => {
                                navigator.clipboard.writeText(selectedPromptTool?.hackathonPrompt || '')
                            }}
                        >
                            Copy
                        </Button>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button size="lg" className="rounded-xl" onClick={() => window.open(selectedPromptTool?.url, '_blank')}>
                            Open {selectedPromptTool?.name}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
