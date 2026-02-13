"use client"

import { useState, useEffect } from 'react';
import { useContentStore } from '@/lib/content-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Search, BookOpen, Code, Layers, Send, Sparkles, Lightbulb,
    PlayCircle, ExternalLink, Globe, Image as ImageIcon, Volume2,
    FileText, GraduationCap, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { type YouTubeVideo } from '@/lib/youtube';

interface Explanation {
    concept: string;
    levels: {
        beginner: { text: string; analogy: string };
        intermediate: { text: string; codeSnippet: string };
        advanced: { text: string; useCases: string[] };
    };
    relatedConcepts: string[];
}

interface WebSource {
    title: string;
    link: string;
    snippet: string;
    source: string;
}

interface Paper {
    title: string;
    abstract?: string;
    year?: number;
    citationCount?: number;
    url?: string;
}

interface ConceptImage {
    base64?: string;
    url?: string;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export default function ConceptExplainer() {
    const [concept, setConcept] = useState('');
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState<Explanation | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [webSources, setWebSources] = useState<WebSource[]>([]);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [conceptImage, setConceptImage] = useState<ConceptImage | null>(null);
    const [ttsLoading, setTtsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('beginner');
    const store = useContentStore('concepts');

    // Auto-load last saved concept on mount
    useEffect(() => {
        store.load<any>('last_concept').then(data => {
            if (data) {
                setConcept(data.concept || '');
                if (data.explanation) setExplanation(data.explanation);
                if (data.videos) setVideos(data.videos);
                if (data.webSources) setWebSources(data.webSources);
                if (data.papers) setPapers(data.papers);
                if (data.conceptImage) setConceptImage(data.conceptImage);
            }
        }).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const explain = async () => {
        if (!concept.trim()) return;
        setLoading(true);
        setExplanation(null);
        setVideos([]);
        setWebSources([]);
        setPapers([]);
        setConceptImage(null);
        setChatMessages([]);
        setActiveTab('beginner');

        try {
            // 1. Fetch Videos (Priority — more results)
            const videoPromise = fetch(`/api/youtube/search?q=${encodeURIComponent(concept + ' tutorial')}&maxResults=8`)
                .then(r => r.json())
                .then(data => {
                    if (data.videos) setVideos(data.videos);
                })
                .catch(e => console.error("Video fetch failed", e));

            // 2. Fetch Explanation + SERP + Papers + Image (all parallel on backend)
            const explainPromise = fetch('/api/explain-concept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ concept, mode: 'explain' })
            })
                .then(r => r.json())
                .then(data => {
                    if (data.explanation) setExplanation(data.explanation);
                    if (data.webSources) setWebSources(data.webSources);
                    if (data.papers) setPapers(data.papers);
                    if (data.conceptImage) setConceptImage(data.conceptImage);
                })
                .catch(e => console.warn("Explain fetch failed:", e));

            await Promise.allSettled([videoPromise, explainPromise]);

        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
            // Auto-save after generation completes
            setTimeout(() => {
                store.save('last_concept', {
                    concept,
                    explanation,
                    videos,
                    webSources,
                    papers,
                    conceptImage,
                }, concept).catch(() => { });
            }, 500);
        }
    };

    const sendChat = async () => {
        if (!chatInput.trim() || !explanation) return;
        const userMsg = chatInput;
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatLoading(true);

        try {
            const res = await fetch('/api/explain-concept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concept: explanation.concept,
                    mode: 'chat',
                    messages: [...chatMessages, { role: 'user', content: userMsg }]
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setChatMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
        } catch (e: any) {
            toast.error("Failed to send message");
        } finally {
            setChatLoading(false);
        }
    };

    const speakText = async (text: string) => {
        setTtsLoading(true);
        try {
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.substring(0, 3000) })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'TTS failed');
                return;
            }
            // If we get an audio URL, play it
            if (data.audioFile) {
                const audio = new Audio(data.audioFile);
                audio.play();
            } else {
                toast.info("Speech generated but no audio URL returned.");
            }
        } catch (e: any) {
            toast.error("Text-to-speech failed");
        } finally {
            setTtsLoading(false);
        }
    };

    const hasContent = explanation || videos.length > 0 || webSources.length > 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
            {/* Left: Input & Key Concepts */}
            <div className="space-y-6 lg:col-span-1">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>What do you want to learn?</CardTitle>
                        <CardDescription>Master any concept in seconds with AI + Web Research.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. JWT, Docker, Recursion"
                                value={concept}
                                onChange={(e) => setConcept(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && explain()}
                            />
                            <Button onClick={explain} disabled={loading || !concept}>
                                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {explanation && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Related Concepts</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {explanation.relatedConcepts.map((c, i) => (
                                <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => { setConcept(c); }}>
                                    {c}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Research Stats */}
                {hasContent && (
                    <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">📊 Research Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-xs text-muted-foreground">
                            {explanation && <p>✅ AI Explanation generated</p>}
                            {videos.length > 0 && <p>📺 {videos.length} tutorial videos found</p>}
                            {webSources.length > 0 && <p>🌐 {webSources.length} web sources found</p>}
                            {papers.length > 0 && <p>📄 {papers.length} research papers found</p>}
                            {conceptImage && <p>🎨 Concept visualization generated</p>}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right: Explanation & Chat */}
            <div className="lg:col-span-2 space-y-6 flex flex-col h-full overflow-hidden">
                {hasContent ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
                        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${3 + (videos.length > 0 ? 1 : 0) + (webSources.length > 0 || papers.length > 0 ? 1 : 0) + (conceptImage ? 1 : 0)}, 1fr)` }}>
                            <TabsTrigger value="beginner" disabled={!explanation}>🐣 Beginner</TabsTrigger>
                            <TabsTrigger value="intermediate" disabled={!explanation}>👨‍💻 Intermediate</TabsTrigger>
                            <TabsTrigger value="advanced" disabled={!explanation}>🚀 Advanced</TabsTrigger>
                            {videos.length > 0 && <TabsTrigger value="videos">📺 Videos</TabsTrigger>}
                            {(webSources.length > 0 || papers.length > 0) && <TabsTrigger value="research">🔬 Research</TabsTrigger>}
                            {conceptImage && <TabsTrigger value="visuals">🎨 Visuals</TabsTrigger>}
                        </TabsList>

                        <div className="flex-1 overflow-auto mt-4 px-1">
                            {explanation && (
                                <>
                                    {/* Beginner Tab */}
                                    <TabsContent value="beginner" className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="flex justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => speakText(explanation.levels.beginner.text)} disabled={ttsLoading}>
                                                <Volume2 className="h-4 w-4 mr-1" /> {ttsLoading ? 'Speaking...' : 'Listen'}
                                            </Button>
                                        </div>
                                        <Card className="border-l-4 border-l-blue-500">
                                            <CardHeader><CardTitle className="text-lg">Simple Analogy</CardTitle></CardHeader>
                                            <CardContent className="text-lg leading-relaxed">{explanation.levels.beginner.text}</CardContent>
                                        </Card>
                                        <Card className="bg-secondary/20">
                                            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="h-4 w-4 text-yellow-500" /> Visual Analogy</CardTitle></CardHeader>
                                            <CardContent className="italic text-muted-foreground">{explanation.levels.beginner.analogy}</CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Intermediate Tab */}
                                    <TabsContent value="intermediate" className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="flex justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => speakText(explanation.levels.intermediate.text)} disabled={ttsLoading}>
                                                <Volume2 className="h-4 w-4 mr-1" /> {ttsLoading ? 'Speaking...' : 'Listen'}
                                            </Button>
                                        </div>
                                        <Card>
                                            <CardHeader><CardTitle className="text-lg">Technical Breakdown</CardTitle></CardHeader>
                                            <CardContent>{explanation.levels.intermediate.text}</CardContent>
                                        </Card>
                                        <Card className="bg-neutral-950 text-neutral-50 border-none">
                                            <CardHeader><CardTitle className="text-sm font-mono text-neutral-400">Example Usage</CardTitle></CardHeader>
                                            <CardContent>
                                                <pre className="text-sm font-mono overflow-auto p-2">{explanation.levels.intermediate.codeSnippet}</pre>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Advanced Tab */}
                                    <TabsContent value="advanced" className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="flex justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => speakText(explanation.levels.advanced.text)} disabled={ttsLoading}>
                                                <Volume2 className="h-4 w-4 mr-1" /> {ttsLoading ? 'Speaking...' : 'Listen'}
                                            </Button>
                                        </div>
                                        <Card className="border-l-4 border-l-purple-600">
                                            <CardHeader><CardTitle className="text-lg">Under the Hood</CardTitle></CardHeader>
                                            <CardContent className="leading-relaxed">{explanation.levels.advanced.text}</CardContent>
                                        </Card>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {explanation.levels.advanced.useCases.map((useCase, i) => (
                                                <Card key={i} className="bg-accent/50"><CardContent className="p-4 text-sm font-medium">{useCase}</CardContent></Card>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </>
                            )}

                            {/* Videos Tab */}
                            <TabsContent value="videos" className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                {videos.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {videos.map((video) => (
                                            <Card key={video.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                                                <div className="relative aspect-video">
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <a
                                                            href={video.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-medium transform translate-y-2 group-hover:translate-y-0 transition-transform"
                                                        >
                                                            <PlayCircle className="h-5 w-5" />
                                                            Watch Now
                                                        </a>
                                                    </div>
                                                </div>
                                                <CardContent className="p-3">
                                                    <h3 className="font-semibold text-sm line-clamp-2 mb-1" title={video.title}>
                                                        {video.title}
                                                    </h3>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>{video.channelTitle}</span>
                                                        <a href={video.url} target="_blank" rel="noreferrer" className="flex items-center hover:text-primary">
                                                            <ExternalLink className="h-3 w-3 mr-1" />
                                                            Open
                                                        </a>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <PlayCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>No videos found for this topic.</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Research Tab (Web Sources + Papers) */}
                            <TabsContent value="research" className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                {webSources.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-blue-500" /> Web Sources
                                        </h3>
                                        <div className="space-y-3">
                                            {webSources.map((source, i) => (
                                                <Card key={i} className="hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4">
                                                        <a href={source.link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                                            {source.title}
                                                        </a>
                                                        <p className="text-xs text-muted-foreground mt-1">{source.snippet}</p>
                                                        <p className="text-[10px] text-muted-foreground/50 mt-1">{source.source}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {papers.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-purple-500" /> Research Papers
                                        </h3>
                                        <div className="space-y-3">
                                            {papers.map((paper, i) => (
                                                <Card key={i} className="hover:shadow-md transition-shadow border-l-2 border-l-purple-500/30">
                                                    <CardContent className="p-4">
                                                        <a href={paper.url || '#'} target="_blank" rel="noreferrer" className="text-sm font-semibold text-purple-600 hover:text-purple-800 dark:text-purple-400">
                                                            {paper.title}
                                                        </a>
                                                        {paper.year && (
                                                            <span className="text-xs text-muted-foreground ml-2">({paper.year})</span>
                                                        )}
                                                        {paper.citationCount !== undefined && (
                                                            <Badge variant="outline" className="ml-2 text-[10px]">{paper.citationCount} citations</Badge>
                                                        )}
                                                        {paper.abstract && (
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{paper.abstract}</p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Visuals Tab (Freepik Image) */}
                            <TabsContent value="visuals" className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                {conceptImage && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <ImageIcon className="h-4 w-4 text-pink-500" /> AI-Generated Concept Visualization
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="rounded-lg overflow-hidden border">
                                                <img
                                                    src={conceptImage.url || `data:image/png;base64,${conceptImage.base64}`}
                                                    alt={`Visualization of ${concept}`}
                                                    className="w-full h-auto max-h-[500px] object-contain"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                                Generated by Freepik AI • Educational illustration of "{concept}"
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </div>

                        {/* Inline Chat */}
                        <div className="mt-6 border-t pt-4">
                            <div className="text-sm font-medium mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-500" /> Have questions? Ask AI Tutor</div>
                            <ScrollArea className="h-32 border rounded-md p-3 mb-2 bg-muted/30">
                                {chatMessages.length === 0 && <span className="text-xs text-muted-foreground">Ask follow-up questions here...</span>}
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className={`flex gap-2 mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' && <Avatar className="h-6 w-6"><AvatarFallback>AI</AvatarFallback></Avatar>}
                                        <div className={`text-xs p-2 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                                            {msg.content}
                                        </div>
                                        {msg.role === 'user' && <Avatar className="h-6 w-6"><AvatarFallback>ME</AvatarFallback></Avatar>}
                                    </div>
                                ))}
                                {chatLoading && <div className="text-xs text-muted-foreground animate-pulse">Thinking...</div>}
                            </ScrollArea>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ask a clarifying question..."
                                    className="h-8 text-sm"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                                />
                                <Button size="sm" onClick={sendChat} disabled={chatLoading}><Send className="h-3 w-3" /></Button>
                            </div>
                        </div>

                    </Tabs>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-20">
                        <Layers className="h-24 w-24 mb-4" />
                        <p className="text-xl font-bold">Concept Engine Ready</p>
                        <p className="text-sm mt-2">Search any topic for AI explanations, videos, web research & more</p>
                    </div>
                )}
            </div>
        </div>
    );
}
