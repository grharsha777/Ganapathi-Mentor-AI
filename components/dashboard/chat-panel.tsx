
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Send, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export function ChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = input
        setInput('')
        setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
        setIsLoading(true)

        try {
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userMsg, sessionId: localStorage.getItem('current_session_id') }),
            })

            if (!res.ok) throw new Error('Failed to fetch')

            const data = await res.json()
            setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className={cn(
                'fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-background border-l shadow-2xl transition-transform duration-300 ease-in-out transform',
                isOpen ? 'translate-x-0' : 'translate-x-full'
            )}
        >
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" />
                        <span className="font-semibold">AI Assistant</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-10">
                                <p>Hi! I'm your AI Copilot.</p>
                                <p className="text-sm mt-2">Ask me to explain concepts, code, or help you debug.</p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'flex flex-col max-w-[85%] rounded-lg p-3 text-sm',
                                    m.role === 'user'
                                        ? 'ml-auto bg-primary text-primary-foreground'
                                        : 'bg-muted mr-auto'
                                )}
                            >
                                <code className="whitespace-pre-wrap font-sans">{m.content}</code>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center bg-muted rounded-lg p-3 mr-auto w-fit">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                <span className="text-xs">Thinking...</span>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 border-t mt-auto">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSend()
                        }}
                        className="flex gap-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
