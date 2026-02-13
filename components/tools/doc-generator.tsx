"use client"

import { useState, useEffect } from 'react';
import { useContentStore } from '@/lib/content-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, FileText, Zap, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface DocResult {
    markdown: string;
    diagram?: string;
    imageUrl?: string;
}

export default function DocGenerator() {
    const [context, setContext] = useState('');
    const [type, setType] = useState('readme');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DocResult | null>(null);
    const store = useContentStore('docs');

    // Auto-load last doc on mount
    useEffect(() => {
        store.load<any>('last_doc').then(data => {
            if (data) {
                if (data.context) setContext(data.context);
                if (data.type) setType(data.type);
                if (data.result) setResult(data.result);
            }
        }).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const generate = async () => {
        if (!context.trim()) return toast.error("Please provide code context");
        setLoading(true);
        try {
            const res = await fetch('/api/docs/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, context })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            const doc = data.document || data.result;
            const docResult = doc?.content ? { markdown: doc.content } : doc;
            setResult(docResult);
            toast.success("Documentation Generated");
            // Auto-save
            store.save('last_doc', { context, type, result: docResult }, `${type} doc`).catch(() => { });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Generator Settings</CardTitle>
                        <CardDescription>Configure what you want to build</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Document Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="readme">README.md (GitHub)</SelectItem>
                                    <SelectItem value="openapi">Swagger / OpenAPI Docs</SelectItem>
                                    <SelectItem value="architecture">Architecture Diagram (Mermaid)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Code Context / File Content</Label>
                            <Textarea
                                placeholder="Paste entry file, package.json, or key logic here..."
                                className="min-h-[300px] font-mono text-xs"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                            />
                        </div>
                        <Button className="w-full" onClick={generate} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                            Generate Docs
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {result ? (
                    <Tabs defaultValue="preview" className="h-full flex flex-col">
                        <TabsList>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                            <TabsTrigger value="raw">Raw Markdown</TabsTrigger>
                            {result.diagram && <TabsTrigger value="diagram">Diagram Code</TabsTrigger>}
                        </TabsList>

                        <TabsContent value="preview" className="flex-1 mt-4">
                            <Card className="h-full bg-muted/20 border-2">
                                <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                                    <CardTitle className="text-base">Rendered Preview</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.markdown)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-6 prose dark:prose-invert max-w-none text-sm max-h-[600px] overflow-auto">
                                    {result.imageUrl && (
                                        <div className="mb-6 rounded-lg overflow-hidden border-2 shadow-lg bg-background">
                                            <img src={result.imageUrl} alt="Generated Asset" className="w-full h-auto" />
                                            <div className="p-2 bg-muted/30 text-[10px] flex items-center gap-1">
                                                <ImageIcon className="h-3 w-3" /> AI Generated Asset (Picsart)
                                            </div>
                                        </div>
                                    )}
                                    <pre className="whitespace-pre-wrap font-sans text-foreground">{result.markdown}</pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="raw" className="flex-1 mt-4">
                            <Card className="h-full overflow-hidden border-2">
                                <CardContent className="p-0 h-full">
                                    <Textarea
                                        className="min-h-[500px] w-full font-mono text-xs border-0 rounded-none focus-visible:ring-0 resize-none p-4"
                                        value={result.markdown}
                                        readOnly
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {result.diagram && (
                            <TabsContent value="diagram" className="flex-1 mt-4">
                                <Card className="h-full border-2">
                                    <CardHeader className="p-4 border-b">
                                        <CardTitle className="text-base text-purple-500">Mermaid JS Code</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto font-mono text-xs">
                                            <pre>{result.diagram}</pre>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-4 italic">
                                            Paste this into a Mermaid Editor or markdown file for visual rendering.
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                ) : (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-muted-foreground border-4 border-dashed rounded-2xl bg-muted/5 transition-colors">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                            <FileText className="h-20 w-20 relative opacity-40" />
                        </div>
                        <p className="text-xl font-medium">Ready to Analyze</p>
                        <p className="text-sm opacity-60">Paste your code on the left to begin generation.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
