"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Palette, Sparkles, Copy, ImageIcon, Wand2, Download } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function BrandingGenerator() {
    const [keywords, setKeywords] = useState("")
    const [loadingBranding, setLoadingBranding] = useState(false)
    const [loadingImage, setLoadingImage] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)

    const generateBranding = async () => {
        if (!keywords.trim()) return

        setLoadingBranding(true)
        setResult(null)

        try {
            const response = await fetch('/api/branding/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: keywords })
            });

            if (!response.ok) throw new Error('Generation failed');
            const data = await response.json();
            setResult(data);
            toast.success("Branding generated!")
        } catch (error) {
            // Fallback for demo if API route doesn't exist yet or fails
            const colors = [
                { name: 'Neon Purple', hex: '#8b5cf6' },
                { name: 'Cyber Blue', hex: '#06b6d4' },
                { name: 'Midnight', hex: '#0f172a' }
            ]
            setResult({
                name: "NeuralFlow",
                tagline: `Powering the next generation of ${keywords}`,
                colors: colors,
                font: "Geist Sans"
            });
            toast.error("Using local fallback - Live AI route coming soon")
        } finally {
            setLoadingBranding(false)
        }
    }

    const generateBrandingImage = async () => {
        if (!keywords.trim()) return
        setLoadingImage(true)
        setGeneratedImage(null)

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: `Modern professional logo/branding for ${keywords}, minimalist, high quality, vector style` })
            });

            const data = await response.json();
            if (data.data?.[0]?.url) {
                setGeneratedImage(data.data[0].url);
                toast.success("AI Image Generated!");
            } else {
                throw new Error("No image URL returned");
            }
        } catch (error) {
            toast.error("Failed to generate image with Picsart")
            console.error(error);
        } finally {
            setLoadingImage(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

    return (
        <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            Identity Engine
                        </CardTitle>
                        <CardDescription>Describe your project to get AI branding items</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Core Concept</label>
                            <Input
                                placeholder="e.g., ai analytics dashboard"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={generateBranding}
                                disabled={loadingBranding || !keywords}
                                className="flex-1 bg-gradient-to-r from-primary to-purple-600"
                            >
                                {loadingBranding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Palette className="mr-2 h-4 w-4" />}
                                Generate Style
                            </Button>
                            <Button
                                onClick={generateBrandingImage}
                                disabled={loadingImage || !keywords}
                                variant="outline"
                                className="border-primary/20 hover:bg-primary/10"
                            >
                                {loadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                                <span className="ml-2 hidden sm:inline">AI Image</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-primary/20">
                    <CardHeader>
                        <CardTitle>AI Output</CardTitle>
                        <CardDescription>Your generated brand identity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {result ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
                                    <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 mb-2">
                                        {result.name}
                                    </h3>
                                    <p className="text-muted-foreground italic">{result.tagline}</p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">Color Palette</h4>
                                    <div className="flex gap-2">
                                        {result.colors?.map((c: any, i: number) => (
                                            <div key={i} className="group relative flex-1">
                                                <div
                                                    className="h-12 w-full rounded-md shadow-lg cursor-pointer transition-transform hover:scale-105"
                                                    style={{ backgroundColor: c.hex }}
                                                    onClick={() => copyToClipboard(c.hex)}
                                                />
                                                <span className="text-xs text-center block mt-1 opacity-70">{c.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-xl">
                                Identity will appear here
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* AI Image Results Section */}
            {(loadingImage || generatedImage) && (
                <Card className="glass-card overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-purple-500" />
                            AI Visual Asset
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loadingImage ? (
                            <div className="h-64 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <p className="text-muted-foreground animate-pulse">Picsart AI is imagining your brand...</p>
                            </div>
                        ) : generatedImage ? (
                            <div className="relative group rounded-xl overflow-hidden shadow-2xl">
                                <img src={generatedImage} alt="AI Generated Branding" className="w-full h-auto object-cover max-h-[600px]" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <Button onClick={() => window.open(generatedImage, '_blank')} variant="secondary">
                                        View Fullscreen
                                    </Button>
                                    <a href={generatedImage} download="brand-asset.png">
                                        <Button variant="default">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
