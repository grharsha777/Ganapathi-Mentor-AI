'use client'

import { useState } from 'react'
import { textToSpeechAction } from '@/app/actions/voice'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mic, Play, Download, Volume2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const VOICES = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (American, Calm)' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (American, Strong)' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (American, Soft)' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (American, Well-rounded)' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (American, Young)' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (American, Deep)' },
    { id: 'VR6AewLTigWg4xSOukaG', name: 'Arnold (American, Crisp)' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (American, Deep)' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam (American, Raspy)' },
]

export function VoiceStudio() {
    const [text, setText] = useState('')
    const [voiceId, setVoiceId] = useState(VOICES[0].id)
    const [loading, setLoading] = useState(false)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)

    const handleGenerate = async () => {
        if (!text.trim()) return
        setLoading(true)
        setAudioUrl(null)

        try {
            const res = await textToSpeechAction(text, voiceId)
            if (res.audio) {
                setAudioUrl(res.audio)
            } else {
                alert('Failed to generate audio. Check your API key or quota.')
            }
        } catch (error) {
            console.error(error)
            alert("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-amber-500/20 shadow-lg shadow-amber-500/5">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <Mic className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle>Hackathon Voice Studio</CardTitle>
                        <CardDescription>
                            Generate professional voiceovers for your demo videos in seconds.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Script</label>
                        <Textarea
                            placeholder="Enter your demo script here... (e.g. 'Welcome to Project X, an AI-powered solution for...')"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="min-h-[200px] font-mono text-sm resize-none focus-visible:ring-amber-500"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {text.length} characters
                        </p>
                    </div>

                    <div className="w-full md:w-64 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Voice</label>
                            <Select value={voiceId} onValueChange={setVoiceId}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {VOICES.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            {v.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={loading || !text}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Volume2 className="mr-2 h-4 w-4" />
                                    Generate Voiceover
                                </>
                            )}
                        </Button>

                        {audioUrl && (
                            <div className="p-4 bg-muted/50 rounded-lg border animate-in fade-in zoom-in-95 duration-200">
                                <p className="text-xs font-medium mb-2 text-center text-green-500">Generation Complete!</p>
                                <audio controls src={audioUrl} className="w-full h-8 mb-3" />
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <a href={audioUrl} download="demo-voiceover.mp3">
                                        <Download className="mr-2 h-3 w-3" />
                                        Download MP3
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
