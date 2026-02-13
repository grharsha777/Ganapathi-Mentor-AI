
"use client";

import * as React from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
};

interface ChatPanelProps {
    sessionId?: string | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ChatPanel({ sessionId, open, onOpenChange }: ChatPanelProps) {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [input, setInput] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [isEli5, setIsEli5] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: userMsg.content,
                    sessionId: sessionId,
                    eli5: isEli5
                }),
            });

            if (!res.ok) throw new Error("Failed to get response");

            const data = await res.json();
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.answer || "Sorry, something went wrong.",
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm having trouble connecting right now. Please try again.",
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                {!open && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 z-50 border-2 border-white/20"
                    >
                        <Sparkles className="h-6 w-6" />
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col glass border-l-theme p-0 gap-0">
                <SheetHeader className="p-6 border-b border-border/50 bg-background/40 backdrop-blur-xl">
                    <SheetTitle className="flex items-center gap-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                        <Bot className="h-6 w-6 text-primary" />
                        AI Assistant
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="flex flex-col gap-6">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-center mt-20 text-muted-foreground gap-4">
                                <div className="bg-primary/10 p-4 rounded-full ring-1 ring-primary/20">
                                    <Sparkles className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-foreground">How can I help you?</h3>
                                    <p className="text-sm max-w-[250px]">
                                        Ask about code concepts, explain errors, or get help with your repository.
                                    </p>
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-3 max-w-[85%]",
                                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                )}>
                                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div
                                    className={cn(
                                        "p-3 rounded-2xl text-sm shadow-sm backdrop-blur-sm",
                                        msg.role === "user"
                                            ? "bg-primary/90 text-primary-foreground rounded-tr-none"
                                            : "bg-card/80 border border-border/50 text-foreground rounded-tl-none"
                                    )}
                                >
                                    <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3 mr-auto max-w-[85%]">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-card/80 border border-border/50 p-4 rounded-2xl rounded-tl-none">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border/50 bg-background/40 backdrop-blur-xl mt-auto">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask anything..."
                            className="flex-1 bg-background/50 border-input/50 focus-visible:ring-primary/50"
                        />
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant={isEli5 ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setIsEli5(!isEli5)}
                                className={cn(
                                    "px-2 h-9 transition-colors",
                                    isEli5 ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Explain Like I'm 5"
                            >
                                <span className="text-xs font-bold">ELI5</span>
                            </Button>
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={loading || !input.trim()}
                            className="bg-primary hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
