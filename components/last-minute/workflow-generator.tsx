'use client'

import { useState } from 'react'
import { Workflow, TOOLS } from './data'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, ExternalLink, Play, Sparkles, Copy, Check } from 'lucide-react'

interface WorkflowGeneratorProps {
    workflows: Workflow[]
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
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-bold">AI Workflow Mode</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
                Chain tools together for rapid results. Click a workflow to see step-by-step instructions
                curated by Ganapathi AI Mentor.
            </p>

            {workflows.map((wf) => {
                const isOpen = expandedId === wf.id
                const toolObjects = wf.tools
                    .map((tid) => TOOLS.find((t) => t.id === tid))
                    .filter(Boolean)

                return (
                    <div
                        key={wf.id}
                        className={cn(
                            'rounded-xl border transition-all duration-300 overflow-hidden',
                            isOpen
                                ? 'border-primary/40 bg-primary/5 shadow-lg shadow-primary/5'
                                : 'border-border/50 bg-card/60 hover:border-border'
                        )}
                    >
                        {/* Header */}
                        <button
                            onClick={() => toggle(wf.id)}
                            className="w-full flex items-center justify-between p-4 text-left"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-2xl">{wf.icon}</span>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-sm">{wf.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">{wf.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                    {wf.useCase}
                                </span>
                                {isOpen ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                            </div>
                        </button>

                        {/* Expanded Content */}
                        {isOpen && (
                            <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                {/* Tool pills */}
                                <div className="flex flex-wrap gap-2">
                                    {toolObjects.map((tool) =>
                                        tool ? (
                                            <a
                                                key={tool.id}
                                                href={tool.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg',
                                                    'bg-primary/10 text-primary hover:bg-primary/20 transition-colors'
                                                )}
                                            >
                                                <span>{tool.icon}</span>
                                                {tool.name}
                                                <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                                            </a>
                                        ) : null
                                    )}
                                </div>

                                {/* Steps */}
                                <div className="space-y-2">
                                    {wf.steps.map((step, idx) => {
                                        const key = `${wf.id}-${idx}`
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-2 group/step"
                                            >
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed flex-1 pt-1">
                                                    {step.replace(/^\d+\.\s*/, '')}
                                                </p>
                                                <button
                                                    onClick={() => copyStep(step, idx, wf.id)}
                                                    className="flex-shrink-0 p-1 rounded opacity-0 group-hover/step:opacity-100 hover:bg-muted transition-all"
                                                    title="Copy step"
                                                >
                                                    {copiedStep === key ? (
                                                        <Check className="h-3 w-3 text-green-400" />
                                                    ) : (
                                                        <Copy className="h-3 w-3 text-muted-foreground" />
                                                    )}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* CTA */}
                                <div className="pt-2 border-t border-border/50">
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Play className="h-3 w-3" />
                                        Click each tool link above to start the workflow. Follow the steps in order for
                                        best results.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
