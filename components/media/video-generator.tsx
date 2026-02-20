'use client'

import { useState, useEffect } from 'react'
import { useContentStore } from '@/lib/content-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Video, Download, Sparkles, Wand2 } from 'lucide-react'

export function VideoStudio() {
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const store = useContentStore('media')

    // Auto-load last video on mount
    useEffect(() => {
        store.load<any>('last_video').then(data => {
            if (data) {
                if (data.prompt) setPrompt(data.prompt)
                if (data.video) setGeneratedVideo(data.video)
            }
        }).catch(() => { })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleGenerate = async () => {
        if (!prompt.trim()) return
        setLoading(true)
        setGeneratedVideo(null)
        setError(null)

        try {
            const res = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate',
                    text: prompt.trim(),
                    provider: 'huggingface' // Force Advanced Wan-AI Model
                }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Generation failed')
                return
            }
            if (data.video_url) {
                setGeneratedVideo(data.video_url)
                // Auto-save
                store.save('last_video', { prompt, video: data.video_url }, prompt).catch(() => { })
            } else {
                setError(data.error || 'No video returned')
            }
        } catch (e) {
            console.error(e)
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-blue-500/20 shadow-lg shadow-blue-500/5">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Video className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Advanced Video Studio
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase border border-blue-500/30">
                                Wan-AI 5B
                            </span>
                        </CardTitle>
                        <CardDescription>
                            Generate high-quality cinematic videos from text using Hugging Face&apos;s Wan-AI.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2">
                    <Input
                        placeholder="Describe the cinematic video you want... (e.g. 'A futuristic drone flying over a neon city')"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <Button onClick={handleGenerate} disabled={loading || !prompt} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate Video
                    </Button>
                </div>

                <div className="min-h-[400px] w-full bg-muted/30 rounded-lg border-2 border-dashed border-blue-500/20 flex items-center justify-center relative overflow-hidden group">
                    {loading && (
                        <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                            <p className="text-sm text-blue-400 animate-pulse font-medium">Rendering your cinematic vision...</p>
                            <p className="text-xs text-muted-foreground mt-2 max-w-sm text-center">Video generation takes a lot of compute power. This may take a minute.</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute top-4 left-4 right-4 z-20 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive font-medium shadow-md">
                            {error}
                        </div>
                    )}

                    {generatedVideo ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                            <video
                                src={generatedVideo}
                                controls
                                autoPlay
                                loop
                                className="max-w-full max-h-[500px] rounded-xl shadow-2xl border border-white/10"
                            />
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button asChild variant="secondary" className="bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/20">
                                    <a href={generatedVideo} download={`generated-video-${Date.now()}.mp4`}>
                                        <Download className="mr-2 h-4 w-4" /> Download Video
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-8">
                            <Video className="h-16 w-16 mx-auto mb-4 opacity-20 text-blue-400" />
                            <p>Enter a prompt to start generating advanced AI videos.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
