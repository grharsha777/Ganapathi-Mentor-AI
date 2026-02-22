'use client'

import { useEffect, useState } from 'react'
import { searchStackOverflowAction } from '@/app/actions/stack-exchange'
import { StackQuestion } from '@/lib/integrations/stack-exchange'
import { useContentStore } from '@/lib/content-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, ExternalLink, CheckCircle2, MessageCircle, AlertCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export function StackExchangeSearch({ initialQuery = '' }: { initialQuery?: string }) {
    const [query, setQuery] = useState(initialQuery)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<StackQuestion[]>([])
    const [searched, setSearched] = useState(false)
    const store = useContentStore('stackoverflow')

    // Auto-load last search
    useEffect(() => {
        store.load<any>('last_search').then(data => {
            if (data) {
                if (data.query) setQuery(data.query)
                if (data.results) {
                    setResults(data.results)
                    setSearched(true)
                }
            }
        }).catch(() => { })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSearch = async () => {
        if (!query.trim()) return
        setLoading(true)
        setSearched(true)
        try {
            const res = await searchStackOverflowAction(query)
            setResults(res.results)
            // Auto-save
            store.save('last_search', { query, results: res.results }, query).catch(() => { })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Stack_Overflow_icon.svg" className="h-5 w-5" alt="Stack Overflow" />
                    Stack Overflow Search
                </CardTitle>
                <CardDescription>Find solutions to bugs and implementation details.</CardDescription>
                <div className="flex gap-2 mt-2">
                    <Input
                        placeholder="Search error message or concept..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={loading} size="icon">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0 flex-1 min-h-0">
                <ScrollArea className="h-[500px] w-full pr-4">
                    <div className="space-y-3">
                        {searched && results.length === 0 && !loading && (
                            <div className="text-center py-8 text-muted-foreground">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No results found for "{query}"</p>
                            </div>
                        )}

                        {results.map((q) => (
                            <div key={q.question_id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start gap-2">
                                    <a href={q.link} target="_blank" rel="noopener noreferrer" className="font-medium text-sm text-blue-500 hover:underline line-clamp-2">
                                        {q.title}
                                    </a>
                                    {q.is_answered && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
                                </div>

                                <div className="flex flex-wrap gap-1 my-2">
                                    {q.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-medium ${q.score < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                            {q.score} votes
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="h-3 w-3" /> {q.answer_count || 0}
                                        </span>
                                        <span>{q.view_count.toLocaleString()} views</span>
                                    </div>
                                    <span>{format(new Date(q.creation_date * 1000), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
