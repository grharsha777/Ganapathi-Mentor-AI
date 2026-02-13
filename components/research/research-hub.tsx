'use client'

import { useState } from 'react'
import { searchResearchPapers } from '@/app/actions/research'
import { ArxivPaper } from '@/lib/integrations/arxiv'
import { SemanticPaper } from '@/lib/integrations/semantic-scholar'
import { WikiResult } from '@/lib/integrations/wikipedia'
import { SearchResult } from '@/lib/integrations/tavily'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, BookOpen, ExternalLink, Loader2, Volume2, Globe, GraduationCap, Library } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { textToSpeechAction } from '@/app/actions/voice'

export function ResearchHub() {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [arxivResults, setArxivResults] = useState<ArxivPaper[]>([])
    const [semanticResults, setSemanticResults] = useState<SemanticPaper[]>([])
    const [wikiResults, setWikiResults] = useState<WikiResult[]>([])
    const [webResults, setWebResults] = useState<SearchResult[]>([])
    const [apiKeys, setApiKeys] = useState({ tavily: true, serp: true, semanticScholar: true })

    const handleSearch = async () => {
        if (!query.trim()) return
        setLoading(true)

        try {
            const { arxiv, semantic, wiki, web, apiKeys: keys } = await searchResearchPapers(query)
            setArxivResults(arxiv)
            setSemanticResults(semantic)
            setWikiResults(wiki)
            setWebResults(web)
            if (keys) setApiKeys(keys)
        } catch (error) {
            console.error("Search failed", error)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">AI Scholar Hub</h2>
                <p className="text-muted-foreground">
                    Search across arXiv, Semantic Scholar, Wikipedia, and the Web for comprehensive research.
                </p>

                <div className="flex gap-2 flex-wrap text-xs">
                    <Badge variant={apiKeys.semanticScholar ? "secondary" : "destructive"} className="opacity-80">
                        {apiKeys.semanticScholar ? "Semantic Scholar Active" : "Semantic Scholar Key Missing"}
                    </Badge>
                    <Badge variant={apiKeys.tavily ? "secondary" : "destructive"} className="opacity-80">
                        {apiKeys.tavily ? "Tavily Active" : "Tavily Key Missing"}
                    </Badge>
                    <Badge variant={apiKeys.serp ? "secondary" : "destructive"} className="opacity-80">
                        {apiKeys.serp ? "SerpAPI Active" : "SerpAPI Key Missing"}
                    </Badge>
                </div>

                <div className="flex w-full max-w-2xl items-center space-x-2">
                    <Input
                        type="text"
                        placeholder="Search for 'Transformers', 'Graph Neural Networks'..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Search
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="all">All Results</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="wiki">Wikipedia</TabsTrigger>
                    <TabsTrigger value="web">Web</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Academic Column */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-purple-500" />
                                Academic Papers
                            </h3>
                            {arxivResults.slice(0, 3).map(paper => (
                                <ArxivCard key={paper.id} paper={paper} />
                            ))}
                            {semanticResults.slice(0, 3).map(paper => (
                                <SemanticCard key={paper.paperId} paper={paper} />
                            ))}
                        </div>

                        {/* Knowledge Column */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Globe className="h-5 w-5 text-blue-500" />
                                Web & Knowledge
                            </h3>
                            {wikiResults.slice(0, 2).map(item => (
                                <WikiCard key={item.id} item={item} />
                            ))}
                            {webResults.slice(0, 3).map((item, idx) => (
                                <WebCard key={idx} item={item} />
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="academic">
                    <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {arxivResults.map(paper => (
                                <ArxivCard key={paper.id} paper={paper} />
                            ))}
                            {semanticResults.map(paper => (
                                <SemanticCard key={paper.paperId} paper={paper} />
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="wiki">
                    <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                        <div className="grid gap-4 md:grid-cols-1">
                            {wikiResults.map(item => (
                                <WikiCard key={item.id} item={item} />
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="web">
                    <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                        <div className="grid gap-4 md:grid-cols-1">
                            {webResults.map((item, idx) => (
                                <WebCard key={idx} item={item} />
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function ArxivCard({ paper }: { paper: ArxivPaper }) {
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleListen = async () => {
        if (audioUrl) return
        setLoading(true)
        try {
            const res = await textToSpeechAction(paper.summary.slice(0, 500))
            if (res.audio) setAudioUrl(res.audio)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Simple gradient header */}
            <div className="absolute top-0 left-0 w-1 bg-red-500 h-full" />
            <CardHeader className="pb-3 pl-5">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight">
                        <a href={paper.id} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-red-500">
                            {paper.title}
                        </a>
                    </CardTitle>
                    <Badge variant="outline" className="flex-shrink-0 text-[10px] scale-90">{paper.category}</Badge>
                </div>
                <CardDescription className="text-xs">
                    arXiv • {new Date(paper.published).getFullYear()}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-3 pl-5">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {paper.summary}
                </p>
                {audioUrl && (
                    <div className="mt-3 p-2 bg-muted rounded-md flex items-center gap-2 animate-in fade-in">
                        <audio controls src={audioUrl} className="w-full h-6" autoPlay />
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-0 pl-5 flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => window.open(paper.id, '_blank')}>
                    PDF
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleListen}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3.5 w-3.5" />}
                </Button>
            </CardFooter>
        </Card>
    )
}

function SemanticCard({ paper }: { paper: SemanticPaper }) {
    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full" />
            <CardHeader className="pb-3 pl-5">
                <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight">
                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-500">
                        {paper.title}
                    </a>
                </CardTitle>
                <CardDescription className="text-xs">
                    Semantic Scholar • {paper.year} • {paper.citationCount} cites
                </CardDescription>
            </CardHeader>
        </Card>
    )
}

function WikiCard({ item }: { item: WikiResult }) {
    return (
        <Card className="hover:bg-muted/30 transition-colors border-l-4 border-l-gray-400">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-serif">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {item.title}
                    </a>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.snippet}...
                </p>
            </CardContent>
        </Card>
    )
}

function WebCard({ item }: { item: SearchResult }) {
    return (
        <Card className="hover:bg-muted/30 transition-colors border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400">
                        {item.title}
                    </a>
                </CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-wider text-green-600/70 font-semibold">
                    {item.source}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.snippet}
                </p>
            </CardContent>
        </Card>
    )
}
