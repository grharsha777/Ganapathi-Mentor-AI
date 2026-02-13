'use client'

import { Tool, CATEGORY_META } from './data'
import { ExternalLink, Heart, Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolCardProps {
    tool: Tool
    isFavorite?: boolean
    onToggleFavorite?: (toolId: string) => void
    onShowPrompt?: (tool: Tool) => void
}

export function ToolCard({ tool, isFavorite, onToggleFavorite, onShowPrompt }: ToolCardProps) {
    const catMeta = CATEGORY_META[tool.category]

    return (
        <div
            className={cn(
                'group relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm',
                'p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
                'hover:border-primary/30 hover:-translate-y-0.5'
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{tool.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: catMeta.color + '20', color: catMeta.color }}
                            >
                                {catMeta.label}
                            </span>
                            {tool.noSignup && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400">
                                    No Signup
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Favorite */}
                <button
                    onClick={() => onToggleFavorite?.(tool.id)}
                    className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                >
                    <Heart
                        className={cn(
                            'h-3.5 w-3.5 transition-colors',
                            isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                        )}
                    />
                </button>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                {tool.description}
            </p>

            {/* Pricing Badge */}
            <div className="flex items-center gap-1.5 mb-3">
                <span
                    className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                        tool.pricing === 'Free'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : tool.pricing === 'Freemium'
                                ? 'bg-blue-500/15 text-blue-400'
                                : tool.pricing === 'Free Trial'
                                    ? 'bg-amber-500/15 text-amber-400'
                                    : 'bg-purple-500/15 text-purple-400'
                    )}
                >
                    {tool.pricing}
                </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
                {tool.tags.slice(0, 3).map((tag) => (
                    <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 text-xs font-medium',
                        'py-2 rounded-lg transition-all duration-200',
                        'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                    )}
                >
                    <ExternalLink className="h-3 w-3" />
                    Open
                </a>

                {tool.hackathonPrompt && (
                    <button
                        onClick={() => onShowPrompt?.(tool)}
                        className={cn(
                            'flex items-center justify-center gap-1.5 text-xs font-medium',
                            'py-2 px-3 rounded-lg transition-all duration-200',
                            'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                        )}
                    >
                        <Zap className="h-3 w-3" />
                        Prompt
                    </button>
                )}
            </div>
        </div>
    )
}
