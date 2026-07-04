'use client'

import { useState, useEffect } from 'react'
import { Tool, CATEGORY_META } from './data'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppLogo } from './app-logo'

interface ToolCardProps {
    tool: Tool
    isFavorite?: boolean
    onToggleFavorite?: (toolId: string) => void
    onShowPrompt?: (tool: Tool) => void
    onSelect?: (tool: Tool) => void
}

/* ── Pexels image cache (avoid re-fetching) ── */
const pexelsCache: Record<string, string> = {}
const CATEGORY_SEARCH_TERMS: Record<string, string> = {
    'ppt-slides': 'presentation technology dark',
    'video-animation': 'video editing creative dark',
    'app-building': 'software development coding dark',
    'deployment': 'cloud server technology dark',
    'research-ai': 'artificial intelligence technology dark',
    'code-debug': 'programming code editor dark',
    'design': 'graphic design creative dark',
    'writing-docs': 'writing notebook dark',
    'music-audio': 'music studio audio dark',
    'utilities': 'digital tools productivity dark',
}

function usePexelsImage(category: string, toolId: string): string | null {
    const [imageUrl, setImageUrl] = useState<string | null>(pexelsCache[toolId] || null)

    useEffect(() => {
        if (pexelsCache[toolId]) {
            setImageUrl(pexelsCache[toolId])
            return
        }

        const searchTerm = CATEGORY_SEARCH_TERMS[category] || 'technology dark'
        // Use tool id hash to pick a different image for each tool
        let hash = 0
        for (let i = 0; i < toolId.length; i++) hash = toolId.charCodeAt(i) + ((hash << 5) - hash)
        const page = (Math.abs(hash) % 10) + 1

        const controller = new AbortController()
        fetch(`/api/assets/pexels?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=landscape`, {
            signal: controller.signal,
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.photos?.length > 0) {
                    // Use the medium size for card backgrounds
                    const url = data.photos[0]?.src?.medium || data.photos[0]?.src?.small
                    if (url) {
                        pexelsCache[toolId] = url
                        setImageUrl(url)
                    }
                }
            })
            .catch(() => {})

        return () => controller.abort()
    }, [category, toolId])

    return imageUrl
}

/* ── Featured Card (tile, for horizontal scroll + grid sections) ── */
export function ToolCardFeatured({ tool, isFavorite, onToggleFavorite, onSelect }: ToolCardProps) {
    const catMeta = CATEGORY_META[tool.category]
    const bgImage = usePexelsImage(tool.category, tool.id)

    return (
        <div
            onClick={() => onSelect?.(tool)}
            className={cn(
                'group relative rounded-2xl cursor-pointer overflow-hidden',
                'w-full', // fluid width — parent controls sizing
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

            {/* Big Icon Area with optional Pexels background */}
            <div className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden">
                {/* Pexels background image */}
                {bgImage && (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={bgImage}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500 scale-110 group-hover:scale-100"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                    </>
                )}

                {/* Gradient backdrop (when no image) */}
                {!bgImage && (
                    <div
                        className="absolute inset-0 transition-all duration-500"
                        style={{
                            background: `radial-gradient(ellipse at 50% 80%, ${catMeta.color}18, transparent 70%)`
                        }}
                    />
                )}

                {/* Floating ambient orb */}
                <div
                    className="absolute w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700"
                    style={{ backgroundColor: catMeta.color }}
                />

                {/* Logo */}
                <AppLogo
                    toolName={tool.name}
                    toolUrl={tool.url}
                    fallbackIcon={tool.icon}
                    className="relative transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1 z-10"
                    imgClassName="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 drop-shadow-lg"
                />
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

            {/* ── Hover Tooltip (description popup) ── */}
            <div className={cn(
                'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
                'w-[240px] sm:w-[280px] p-3 rounded-xl',
                'bg-gray-900/95 backdrop-blur-xl border border-white/[0.12]',
                'shadow-2xl shadow-black/60',
                'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
                'transition-all duration-200 pointer-events-none',
                'translate-y-2 group-hover:translate-y-0',
            )}>
                {/* Arrow */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-gray-900/95 border-r border-b border-white/[0.12]" />

                <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center bg-white/5">
                        <AppLogo toolName={tool.name} toolUrl={tool.url} fallbackIcon={tool.icon} imgClassName="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{tool.name}</h4>
                        <p className="text-[11px] font-medium" style={{ color: catMeta.color }}>{catMeta.label}</p>
                    </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mt-2 line-clamp-3">
                    {tool.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded',
                        tool.pricing === 'Free' ? 'bg-emerald-500/20 text-emerald-300' :
                            tool.pricing === 'Freemium' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-amber-500/20 text-amber-300'
                    )}>
                        {tool.pricing}
                    </span>
                    {tool.noSignup && (
                        <span className="text-[10px] font-medium text-green-300 bg-green-500/15 px-2 py-0.5 rounded">
                            No Signup
                        </span>
                    )}
                </div>
            </div>

            {/* Favorite button */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(tool.id); }}
                className={cn(
                    'absolute top-2.5 right-2.5 p-1.5 rounded-xl transition-all duration-300 z-10',
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
