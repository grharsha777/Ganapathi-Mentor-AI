'use client'

import { useState } from 'react'
import { Tool, CATEGORY_META } from './data'
import { ExternalLink, Heart, Zap, Star, Sparkles, Send, Loader2, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ToolCardProps {
    tool: Tool
    isFavorite?: boolean
    onToggleFavorite?: (toolId: string) => void
    onShowPrompt?: (tool: Tool) => void
    onSelect?: (tool: Tool) => void
}

export function ToolCard({ tool, isFavorite, onToggleFavorite, onShowPrompt, onSelect }: ToolCardProps) {
    const catMeta = CATEGORY_META[tool.category]

    return (
        <div
            onClick={() => onSelect?.(tool)}
            className={cn(
                'group relative rounded-2xl border-2 border-border/30 bg-card/80 backdrop-blur-sm cursor-pointer',
                'p-5 transition-all duration-400 ease-out',
                'hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40',
                'hover:-translate-y-1 hover:scale-[1.02]',
                'active:scale-[0.98]'
            )}
        >
            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-4xl flex-shrink-0 drop-shadow-sm">{tool.icon}</span>
                    <div className="min-w-0">
                        <h3 className="font-bold text-lg truncate">{tool.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span
                                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: catMeta.color + '20', color: catMeta.color }}
                            >
                                {catMeta.label}
                            </span>
                            {tool.noSignup && (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">
                                    No Signup
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Favorite */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(tool.id); }}
                    className="flex-shrink-0 p-2 rounded-xl hover:bg-muted transition-colors"
                >
                    <Heart
                        className={cn(
                            'h-5 w-5 transition-all',
                            isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-muted-foreground'
                        )}
                    />
                </button>
            </div>

            {/* Description */}
            <p className="relative z-10 text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                {tool.description}
            </p>

            {/* Pricing Badge */}
            <div className="relative z-10 flex items-center gap-2 mb-4">
                <Badge
                    variant="outline"
                    className={cn(
                        'text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border-2',
                        tool.pricing === 'Free'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : tool.pricing === 'Freemium'
                                ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                : tool.pricing === 'Free Trial'
                                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                    : 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                    )}
                >
                    {tool.pricing}
                </Badge>
            </div>

            {/* Tags */}
            <div className="relative z-10 flex flex-wrap gap-1.5 mb-4">
                {tool.tags.slice(0, 4).map((tag) => (
                    <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-lg bg-muted/80 text-muted-foreground font-medium"
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="relative z-10 flex items-center gap-2">
                <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2 text-sm font-bold',
                        'py-3 rounded-xl transition-all duration-300',
                        'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground',
                        'shadow-sm hover:shadow-lg hover:shadow-primary/10'
                    )}
                >
                    <ExternalLink className="h-4 w-4" />
                    Open App
                </a>

                {tool.hackathonPrompt && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onShowPrompt?.(tool); }}
                        className={cn(
                            'flex items-center justify-center gap-2 text-sm font-bold',
                            'py-3 px-4 rounded-xl transition-all duration-300',
                            'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
                            'shadow-sm hover:shadow-lg hover:shadow-amber-500/10'
                        )}
                    >
                        <Zap className="h-4 w-4" />
                        Prompt
                    </button>
                )}
            </div>
        </div>
    )
}
