'use client'

import { useState, useMemo } from 'react'
import { TOOLS, WORKFLOWS, ToolCategory, Tool, CATEGORY_META } from './data'
import { ToolCard } from './tool-card'
import { WorkflowGenerator } from './workflow-generator'
import { Search, Filter, Sparkles, X, Lightbulb } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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

    // -- Search & Filter Logic --
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

    // -- Handlers --
    const toggleFavorite = (id: string) => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        )
    }

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header Section */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Last Minute Survival Kit
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        50+ free/low-cost tools for rapid prototyping, hackathons, and research.
                    </p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center p-1 bg-muted/50 rounded-lg">
                    <button
                        onClick={() => setViewMode('directory')}
                        className={cn(
                            'px-4 py-2 text-sm font-medium rounded-md transition-all',
                            viewMode === 'directory'
                                ? 'bg-background shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        Directory
                    </button>
                    <button
                        onClick={() => setViewMode('workflow')}
                        className={cn(
                            'px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2',
                            viewMode === 'workflow'
                                ? 'bg-background shadow-sm text-amber-500'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Workflow Mode
                    </button>
                </div>
            </div>

            {viewMode === 'directory' ? (
                <>
                    {/* Search & Categories */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tools, categories, or tags (e.g., 'deploy next.js', 'video ai')..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-muted/30 border-muted-foreground/20 h-10"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 pb-2">
                            <Button
                                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory('all')}
                                className="rounded-full"
                            >
                                All
                            </Button>
                            {categories.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat)}
                                    className="rounded-full gap-1.5"
                                    style={
                                        selectedCategory === cat
                                            ? { backgroundColor: CATEGORY_META[cat].color, color: '#fff', borderColor: CATEGORY_META[cat].color }
                                            : {}
                                    }
                                >
                                    <span>{CATEGORY_META[cat].icon}</span>
                                    {CATEGORY_META[cat].label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-10">
                        {filteredTools.length > 0 ? (
                            filteredTools.map((tool) => (
                                <ToolCard
                                    key={tool.id}
                                    tool={tool}
                                    isFavorite={favorites.includes(tool.id)}
                                    onToggleFavorite={toggleFavorite}
                                    onShowPrompt={setSelectedPromptTool}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium">No tools found</h3>
                                <p className="text-muted-foreground mt-1">
                                    Try adjusting your search or category filter.
                                </p>
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setSearchQuery('')
                                        setSelectedCategory('all')
                                    }}
                                    className="mt-2"
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Workflow Mode */
                <div className="max-w-3xl mx-auto w-full">
                    <WorkflowGenerator workflows={WORKFLOWS} />
                </div>
            )}

            {/* Prompt Dialog */}
            <Dialog open={!!selectedPromptTool} onOpenChange={(open) => !open && setSelectedPromptTool(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                                <Lightbulb className="h-5 w-5" />
                            </div>
                            Hackathon Prompt for {selectedPromptTool?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Copy this prompt into {selectedPromptTool?.name} to jumpstart your hackathon project.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 p-4 rounded-lg bg-muted/50 border relative group">
                        <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-mono">
                            {selectedPromptTool?.hackathonPrompt}
                        </pre>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                            onClick={() => {
                                navigator.clipboard.writeText(selectedPromptTool?.hackathonPrompt || '')
                            }}
                        >
                            Copy
                        </Button>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button onClick={() => window.open(selectedPromptTool?.url, '_blank')}>
                            Open {selectedPromptTool?.name}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
