'use client'

import { useState, useEffect } from 'react'
import { useContentStore } from '@/lib/content-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, ImageIcon, Download, Sparkles } from 'lucide-react'

export function ImageStudio() {
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const store = useContentStore('media')

    // Auto-load last image on mount
    useEffect(() => {
        store.load<any>('last_image').then(data => {
            if (data) {
                if (data.prompt) setPrompt(data.prompt)
                if (data.image) setGeneratedImage(data.image)
            }
        }).catch(() => { })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleGenerate = async () => {
        if (!prompt.trim()) return
        setLoading(true)
        setGeneratedImage(null)
        setError(null)

        try {
            const res = await fetch('/api/studio/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt.trim() }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Generation failed')
                return
            }
            if (data.image) {
                setGeneratedImage(data.image)
                // Auto-save
                store.save('last_image', { prompt, image: data.image }, prompt).catch(() => { })
            } else {
                setError(data.error || 'No image returned')
            }
        } catch (e) {
            console.error(e)
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-purple-500/20 shadow-lg shadow-purple-500/5">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle>Creative Studio</CardTitle>
                        <CardDescription>
                            Generate assets for your projects using AI-powered image generation.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2">
                    <Input
                        placeholder="Describe the image you want to generate... (e.g. 'Cyberpunk city with neon lights, 8k resolution')"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <Button onClick={handleGenerate} disabled={loading || !prompt} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                        Generate
                    </Button>
                </div>

                <div className="min-h-[400px] w-full bg-muted/30 rounded-lg border-2 border-dashed flex items-center justify-center relative overflow-hidden group">
                    {loading && (
                        <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
                            <p className="text-sm text-muted-foreground animate-pulse">Dreaming up your image...</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute top-4 left-4 right-4 z-20 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    {generatedImage ? (
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                            <img src={generatedImage} alt="Generated" className="max-w-full max-h-[600px] rounded-md shadow-md" />
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button asChild variant="secondary">
                                    <a href={generatedImage} download={`generated-${Date.now()}.png`}>
                                        <Download className="mr-2 h-4 w-4" /> Save Image
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-8">
                            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p>Enter a prompt to start generating.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
