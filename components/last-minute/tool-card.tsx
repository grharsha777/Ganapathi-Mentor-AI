'use client'

import { Tool, CATEGORY_META } from './data'
import { ExternalLink, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolCardProps {
    tool: Tool
    isFavorite?: boolean
    onToggleFavorite?: (toolId: string) => void
    onShowPrompt?: (tool: Tool) => void
    onSelect?: (tool: Tool) => void
}

/* ── Featured Card (tile, for horizontal scroll + grid sections) ── */
export function ToolCardFeatured({ tool, isFavorite, onToggleFavorite, onSelect }: ToolCardProps) {
    const catMeta = CATEGORY_META[tool.category]

    return (
        <div
            onClick={() => onSelect?.(tool)}
            className={cn(
                'group relative flex-shrink-0 rounded-2xl cursor-pointer overflow-hidden',
                'w-[160px] sm:w-[180px] md:w-[200px] lg:w-[210px] 2xl:w-[220px]',
                'bg-gradient-to-b from-white/[0.07] to-white/[0.03]',
                'border border-white/[0.08] hover:border-white/[0.18]',
                'transition-all duration-300 ease-out',
                'hover:scale-[1.04] hover:shadow-2xl hover:shadow-purple-500/10',
                'active:scale-[0.98]'
            )}
        >
            {/* Glow ring on hover */}
            <div
                className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-sm"
                style={{ background: `linear-gradient(135deg, ${catMeta.color}40, transparent, ${catMeta.color}20)` }}
            />

            {/* Big Icon Area */}
            <div className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden">
                {/* Gradient backdrop */}
                <div
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                        background: `radial-gradient(ellipse at 50% 80%, ${catMeta.color}18, transparent 70%)`
                    }}
                />
                {/* Floating ambient orb */}
                <div
                    className="absolute w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700"
                    style={{ backgroundColor: catMeta.color }}
                />
                {/* Icon */}
                <span className="relative text-5xl sm:text-5xl md:text-6xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1">
                    {tool.icon}
                </span>
            </div>

            {/* Info */}
            <div className="relative p-3 sm:p-3.5 space-y-1.5">
                <h3 className="font-bold text-[13px] sm:text-sm text-white truncate leading-tight">
                    {tool.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-400 truncate">
                    {catMeta.label}
                </p>
                <span className={cn(
                    'inline-block mt-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-md',
                    tool.pricing === 'Free'
                        ? 'bg-emerald-500/20 text-emerald-300 shadow-[inset_0_0_12px_rgba(52,211,153,0.08)]'
                        : tool.pricing === 'Freemium'
                            ? 'bg-blue-500/20 text-blue-300 shadow-[inset_0_0_12px_rgba(96,165,250,0.08)]'
                            : 'bg-amber-500/20 text-amber-300 shadow-[inset_0_0_12px_rgba(251,191,36,0.08)]'
                )}>
                    {tool.pricing}
                </span>
            </div>

            {/* Favorite button */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(tool.id); }}
                className={cn(
                    'absolute top-2.5 right-2.5 p-1.5 rounded-xl transition-all duration-300',
                    'bg-black/40 backdrop-blur-md border border-white/10',
                    isFavorite ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
                )}
            >
                <Heart className={cn('h-3.5 w-3.5 transition-colors', isFavorite ? 'fill-red-500 text-red-500' : 'text-white/70 hover:text-white')} />
            </button>
        </div>
    )
}

export { ToolCardFeatured as ToolCard }
