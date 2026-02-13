"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Loader2, Mic, MicOff, PlayCircle, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContentStore } from '@/lib/content-store';

interface Question {
    question: string;
    difficulty: string;
    topic: string;
    hint: string;
}

interface AnswerState {
    transcript: string;
    isRecording: boolean;
    feedback: string | null;
    isEvaluating: boolean;
}

export default function InterviewPrep() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
    const recognitionRefs = useRef<Record<number, any>>({});
    const [speechSupported, setSpeechSupported] = useState(true);
    const store = useContentStore('interviews');

    // Check browser support + auto-load on mount
    useEffect(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) setSpeechSupported(false);

        store.load<any>('last_interview').then(data => {
            if (data) {
                if (data.questions) setQuestions(data.questions);
                if (data.answers) setAnswers(data.answers);
            }
        }).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const generateQs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/specialized', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ type: 'interview', context: 'Senior React Developer' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate questions');
            const qs = data.result?.questions || [];
            setQuestions(qs);
            // Initialize answer states
            const initial: Record<number, AnswerState> = {};
            qs.forEach((_: any, i: number) => {
                initial[i] = { transcript: '', isRecording: false, feedback: null, isEvaluating: false };
            });
            setAnswers(initial);
            toast.success("Interview questions generated!");
            // Auto-save questions
            store.save('last_interview', { questions: qs, answers: initial }, 'interview prep').catch(() => { });
        } catch (e: any) {
            console.error('Interview prep error:', e);
            toast.error(e.message || "Failed to generate questions");
        }
        setLoading(false);
    };

    const toggleRecording = useCallback((index: number) => {
        if (!speechSupported) {
            toast.error("Voice recording is not supported in this browser. Please use Chrome.");
            return;
        }

        const current = answers[index];
        if (!current) return;

        if (current.isRecording) {
            // Stop recording
            recognitionRefs.current[index]?.stop();
            setAnswers(prev => ({
                ...prev,
                [index]: { ...prev[index], isRecording: false }
            }));
            return;
        }

        // Start recording
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = current.transcript;

        recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            setAnswers(prev => ({
                ...prev,
                [index]: { ...prev[index], transcript: finalTranscript + interim }
            }));
        };

        recognition.onerror = (event: any) => {
            console.error('Speech error:', event.error);
            if (event.error !== 'aborted') {
                toast.error("Voice recording failed: " + event.error);
            }
            setAnswers(prev => ({
                ...prev,
                [index]: { ...prev[index], isRecording: false }
            }));
        };

        recognition.onend = () => {
            setAnswers(prev => ({
                ...prev,
                [index]: { ...prev[index], isRecording: false, transcript: finalTranscript.trim() }
            }));
        };

        recognitionRefs.current[index] = recognition;
        recognition.start();
        setAnswers(prev => ({
            ...prev,
            [index]: { ...prev[index], isRecording: true, transcript: '' }
        }));
        toast.info("Listening... Speak your answer clearly.");
    }, [answers, speechSupported]);

    const evaluateAnswer = useCallback(async (index: number) => {
        const q = questions[index];
        const answer = answers[index]?.transcript;
        if (!answer?.trim()) {
            toast.error("Please record an answer first.");
            return;
        }

        setAnswers(prev => ({ ...prev, [index]: { ...prev[index], isEvaluating: true } }));

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: `You are an expert technical interviewer. Evaluate this interview answer.\n\n**Question (${q.difficulty}):** ${q.question}\n**Topic:** ${q.topic}\n**Candidate's Answer:** ${answer}\n\nProvide:\n1. A score out of 10\n2. What was good\n3. What could be improved\n4. A model answer (brief)\n\nBe encouraging but honest.`
                    }],
                    context: '/dashboard/interview-prep'
                })
            });

            if (!res.ok) throw new Error('Evaluation failed');
            const feedback = await res.text();
            setAnswers(prev => ({ ...prev, [index]: { ...prev[index], feedback, isEvaluating: false } }));
            toast.success("Answer evaluated!");
        } catch (e: any) {
            console.error('Evaluation error:', e);
            toast.error("Failed to evaluate. Please try again.");
            setAnswers(prev => ({ ...prev, [index]: { ...prev[index], isEvaluating: false } }));
        }
    }, [questions, answers]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI Mock Interview Config</CardTitle>
                    <CardDescription>Select difficulty and topic</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={generateQs} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <PlayCircle className="mr-2" />}
                        Start Session
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {questions.map((q, i) => {
                    const ans = answers[i] || { transcript: '', isRecording: false, feedback: null, isEvaluating: false };
                    return (
                        <Card key={i} className="animate-in fade-in slide-in-from-bottom-2">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                    <Badge variant={q.difficulty === 'Hard' ? 'destructive' : q.difficulty === 'Medium' ? 'default' : 'secondary'}>
                                        {q.difficulty}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{q.topic}</span>
                                </div>
                                <CardTitle className="text-lg mt-2">{q.question}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Recording Area */}
                                <div
                                    onClick={() => toggleRecording(i)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 border-dashed text-center min-h-[100px] flex items-center justify-center cursor-pointer transition-all duration-300",
                                        ans.isRecording
                                            ? "bg-red-500/10 border-red-500/50 animate-pulse"
                                            : ans.transcript
                                                ? "bg-green-500/5 border-green-500/30 hover:bg-green-500/10"
                                                : "bg-muted/20 border-muted-foreground/20 hover:bg-muted/40 hover:border-primary/30"
                                    )}
                                >
                                    {ans.isRecording ? (
                                        <div className="flex flex-col items-center gap-2 text-red-400">
                                            <MicOff className="h-6 w-6 animate-pulse" />
                                            <span className="text-sm font-medium">Recording... Click to Stop</span>
                                            {ans.transcript && (
                                                <p className="text-xs text-muted-foreground mt-2 max-w-md">{ans.transcript}</p>
                                            )}
                                        </div>
                                    ) : ans.transcript ? (
                                        <div className="flex flex-col items-center gap-2 w-full">
                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                            <p className="text-sm text-foreground/80 max-w-lg text-left leading-relaxed">{ans.transcript}</p>
                                            <span className="text-xs text-muted-foreground mt-1">Click to re-record</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Mic className="h-6 w-6" />
                                            <span className="text-sm">Click to Record Answer</span>
                                        </div>
                                    )}
                                </div>

                                {/* Evaluate Button - shown after recording */}
                                {ans.transcript && !ans.isRecording && (
                                    <Button
                                        onClick={() => evaluateAnswer(i)}
                                        disabled={ans.isEvaluating}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {ans.isEvaluating ? (
                                            <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Evaluating...</>
                                        ) : (
                                            <><MessageSquare className="mr-2 h-4 w-4" /> Get AI Feedback</>
                                        )}
                                    </Button>
                                )}

                                {/* AI Feedback */}
                                {ans.feedback && (
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm leading-relaxed whitespace-pre-wrap">
                                        {ans.feedback}
                                    </div>
                                )}

                                <Accordion type="single" collapsible>
                                    <AccordionItem value="hint">
                                        <AccordionTrigger className="text-sm text-muted-foreground">Need a hint?</AccordionTrigger>
                                        <AccordionContent>{q.hint}</AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
