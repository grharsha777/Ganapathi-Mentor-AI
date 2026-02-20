"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Volume2, Languages, Play, Download } from 'lucide-react';
import { toast } from 'sonner';

const LANGUAGES = [
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'bn-IN', name: 'Bengali' },
    { code: 'ta-IN', name: 'Tamil' },
    { code: 'te-IN', name: 'Telugu' },
    { code: 'kn-IN', name: 'Kannada' },
    { code: 'ml-IN', name: 'Malayalam' },
    { code: 'mr-IN', name: 'Marathi' },
    { code: 'gu-IN', name: 'Gujarati' },
    { code: 'pa-IN', name: 'Punjabi' },
    { code: 'or-IN', name: 'Odia' },
];

export default function IndicStudio() {
    const [prompt, setPrompt] = useState('');
    const [targetLang, setTargetLang] = useState('hi-IN');
    const [speaker, setSpeaker] = useState('aditya');

    const [isTranslating, setIsTranslating] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

    const [translatedText, setTranslatedText] = useState('');
    const [audioUrl, setAudioUrl] = useState('');

    const handleTranslate = async () => {
        if (!prompt) return toast.error("Please enter text to translate.");
        setIsTranslating(true);
        setTranslatedText('');

        try {
            const res = await fetch('/api/sarvam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'translate',
                    text: prompt,
                    sourceLanguage: 'en-IN',
                    targetLanguage: targetLang,
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setTranslatedText(data.translated_text);
            toast.success("Translation complete!");
        } catch (e: any) {
            toast.error(e.message || "Failed to translate text.");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleGenerateAudio = async (textToSpeak: string) => {
        if (!textToSpeak) return toast.error("No text available to synthesize.");
        setIsGeneratingAudio(true);
        setAudioUrl('');

        try {
            const res = await fetch('/api/sarvam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'tts',
                    text: textToSpeak,
                    targetLanguage: targetLang,
                    speaker: speaker,
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Convert base64 to blob URL for audio player
            const audioData = `data:audio/wav;base64,${data.audio_base64}`;
            setAudioUrl(audioData);
            toast.success("Audio generated successfully!");
        } catch (e: any) {
            toast.error(e.message || "Failed to generate audio.");
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-white/10 shadow-2xl bg-gradient-to-br from-indigo-950/40 to-blue-900/40 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Languages className="h-6 w-6 text-orange-400" />
                        Indic Translation & TTS
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        Powered by Sarvam AI. Translate English text into 10+ regional Indian languages and synthesize native audio.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">Input Text (English)</Label>
                        <Textarea
                            placeholder="Enter text describing your course, message, or script..."
                            className="min-h-[120px] bg-background/50 border-white/20 text-base"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Target Language</Label>
                            <Select value={targetLang} onValueChange={setTargetLang}>
                                <SelectTrigger className="bg-background/50 border-white/20">
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map(lang => (
                                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Speaker Voice</Label>
                            <Select value={speaker} onValueChange={setSpeaker}>
                                <SelectTrigger className="bg-background/50 border-white/20">
                                    <SelectValue placeholder="Select Speaker" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aditya">Aditya (Male)</SelectItem>
                                    <SelectItem value="ritu">Ritu (Female)</SelectItem>
                                    <SelectItem value="priya">Priya (Female)</SelectItem>
                                    <SelectItem value="kabir">Kabir (Male)</SelectItem>
                                    <SelectItem value="kavya">Kavya (Female)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 h-12 text-lg font-semibold"
                            onClick={handleTranslate}
                            disabled={isTranslating || !prompt}
                        >
                            {isTranslating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Languages className="h-5 w-5 mr-2" />}
                            Translate Context
                        </Button>
                        <Button
                            className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 h-12 text-lg font-semibold"
                            onClick={() => handleGenerateAudio(translatedText || prompt)}
                            disabled={isGeneratingAudio || (!translatedText && !prompt)}
                        >
                            {isGeneratingAudio ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Volume2 className="h-5 w-5 mr-2" />}
                            Synthesize Audio
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="border-white/10 shadow-xl bg-background/50 backdrop-blur-xl h-full min-h-[400px]">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-400" /> Output Studio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 flex flex-col items-center justify-center p-8">
                        {translatedText && (
                            <div className="w-full text-left p-6 rounded-xl bg-muted/30 border border-white/10 overflow-auto">
                                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Translated Text</Label>
                                <p className="text-lg font-medium leading-relaxed">{translatedText}</p>
                            </div>
                        )}

                        {audioUrl && (
                            <div className="w-full p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 flex flex-col items-center gap-4">
                                <Label className="text-xs text-violet-400 uppercase tracking-wider block self-start">Synthesized Audio Output</Label>
                                <div className="w-24 h-24 rounded-full bg-violet-500/20 flex items-center justify-center relative animate-pulse-slow">
                                    <Volume2 className="h-10 w-10 text-violet-400" />
                                </div>
                                <audio controls src={audioUrl} className="w-full mt-4" autoPlay />
                                <Button variant="outline" className="w-full" onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = audioUrl;
                                    a.download = `sarvam-audio-${Date.now()}.wav`;
                                    a.click();
                                }}>
                                    <Download className="h-4 w-4 mr-2" /> Download Audio
                                </Button>
                            </div>
                        )}

                        {!translatedText && !audioUrl && (
                            <div className="flex flex-col items-center justify-center opacity-50 py-12 text-center">
                                <Languages className="h-16 w-16 mb-4" />
                                <p className="text-lg">Waiting for input...</p>
                                <p className="text-sm">Translate text or synthesize audio to see results.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
