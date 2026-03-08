'use client'

import { useState } from 'react'
import { Workflow, TOOLS } from './data'
import { cn } from '@/lib/utils'
import {
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Play,
    Sparkles,
    Copy,
    Check,
    Clock,
    Zap,
    ArrowRight,
    Star,
    Rocket
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface WorkflowGeneratorProps {
    workflows: Workflow[]
}

const DIFFICULTY_COLORS: Record<string, string> = {
    'Hackathons': 'from-red-500 to-orange-500',
    'Research': 'from-blue-500 to-indigo-500',
    'Startup / MVP': 'from-green-500 to-emerald-500',
    'Presentations': 'from-purple-500 to-pink-500',
    'Portfolio': 'from-amber-500 to-yellow-500',
    'Marketing': 'from-pink-500 to-rose-500',
}

export function WorkflowGenerator({ workflows }: WorkflowGeneratorProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [copiedStep, setCopiedStep] = useState<string | null>(null)

    const toggle = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id))
    }

    const copyStep = (step: string, idx: number, wfId: string) => {
        navigator.clipboard.writeText(step)
        const key = `${wfId}-${idx}`
        setCopiedStep(key)
        setTimeout(() => setCopiedStep(null), 1500)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-2xl" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20">
                        <Sparkles className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">AI Workflow Engine</h2>
                        <p className="text-base text-muted-foreground mt-1">
                            Pre-built tool chains for rapid results. Click any workflow to see step-by-step instructions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Workflows */}
            <div className="space-y-4">
                {workflows.map((wf) => {
                    const isOpen = expandedId === wf.id
                    const toolObjects = wf.tools
                        .map((tid) => TOOLS.find((t) => t.id === tid))
                        .filter(Boolean)
                    const gradientColor = DIFFICULTY_COLORS[wf.useCase] || 'from-purple-500 to-blue-500'

                    return (
                        <div
                            key={wf.id}
                            className={cn(
                                'rounded-2xl border-2 transition-all duration-400 overflow-hidden',
                                isOpen
                                    ? 'border-primary/40 bg-gradient-to-br from-primary/5 to-purple-500/5 shadow-2xl shadow-primary/10'
                                    : 'border-border/30 bg-card/80 backdrop-blur-sm hover:border-primary/20 hover:shadow-lg'
                            )}
                        >
                            {/* Header */}
                            <button
                                onClick={() => toggle(wf.id)}
                                className="w-full flex items-center justify-between p-6 text-left group"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={cn(
                                        'h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0',
                                        `bg-gradient-to-br ${gradientColor}`
                                    )}>
                                        <span className="drop-shadow-sm">{wf.icon}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{wf.title}</h3>
                                        <p className="text-base text-muted-foreground mt-1">{wf.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                    <Badge variant="outline" className={cn(
                                        'text-xs font-bold px-3 py-1.5 rounded-full border-2',
                                        isOpen ? 'border-primary/30 text-primary' : ''
                                    )}>
                                        {wf.useCase}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>~{wf.steps.length * 10}m</span>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        {isOpen ? (
                                            <ChevronUp className="h-5 w-5" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5" />
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {isOpen && (
                                <div className="px-6 pb-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                    {/* Tool pills */}
                                    <div className="flex flex-wrap gap-3">
                                        {toolObjects.map((tool) =>
                                            tool ? (
                                                <a
                                                    key={tool.id}
                                                    href={tool.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={cn(
                                                        'flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl',
                                                        'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground',
                                                        'transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/10',
                                                        'hover:scale-105'
                                                    )}
                                                >
                                                    <span className="text-lg">{tool.icon}</span>
                                                    {tool.name}
                                                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                                                </a>
                                            ) : null
                                        )}
                                    </div>

                                    {/* Steps - Timeline Style */}
                                    <div className="relative pl-8">
                                        {/* Timeline line */}
                                        <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

                                        <div className="space-y-4">
                                            {wf.steps.map((step, idx) => {
                                                const key = `${wf.id}-${idx}`
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="relative flex items-start gap-4 group/step"
                                                    >
                                                        {/* Timeline dot */}
                                                        <div className="absolute -left-8 top-1 flex items-center justify-center">
                                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white text-sm font-black flex items-center justify-center shadow-lg shadow-primary/20">
                                                                {idx + 1}
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 p-4 rounded-xl bg-muted/20 border border-border/30 group-hover/step:border-primary/20 group-hover/step:bg-muted/30 transition-all">
                                                            <p className="text-base text-foreground/90 leading-relaxed">
                                                                {step.replace(/^\d+\.\s*/, '')}
                                                            </p>
                                                        </div>

                                                        <button
                                                            onClick={() => copyStep(step, idx, wf.id)}
                                                            className="flex-shrink-0 p-2 rounded-xl opacity-0 group-hover/step:opacity-100 hover:bg-muted transition-all"
                                                            title="Copy step"
                                                        >
                                                            {copiedStep === key ? (
                                                                <Check className="h-4 w-4 text-green-400" />
                                                            ) : (
                                                                <Copy className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Rocket className="h-4 w-4 text-amber-400" />
                                            Follow the steps in order for best results
                                        </p>
                                        <Button
                                            size="sm"
                                            className="rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                                            onClick={() => window.open(toolObjects[0]?.url, '_blank')}
                                        >
                                            Start Workflow <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
