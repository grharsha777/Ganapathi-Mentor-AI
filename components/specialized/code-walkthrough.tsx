"use client"

import { useState, useEffect } from 'react';
import { useContentStore } from '@/lib/content-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QuizState {
    selected: number | null;
    submitted: boolean;
}

export default function CodeWalkthrough() {
    const [code, setCode] = useState('');
    const [steps, setSteps] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [quizStates, setQuizStates] = useState<Record<number, QuizState>>({});
    const store = useContentStore('walkthroughs');

    // Auto-load last walkthrough on mount
    useEffect(() => {
        store.load<any>('last_walkthrough').then(data => {
            if (data) {
                if (data.code) setCode(data.code);
                if (data.steps) setSteps(data.steps);
                if (data.quizStates) setQuizStates(data.quizStates);
            }
        }).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const generate = async () => {
        if (!code) return;
        setLoading(true);
        setSteps([]);
        setCurrentStep(0);
        setQuizStates({});
        try {
            const res = await fetch('/api/specialized', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ type: 'walkthrough', context: code })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate tutorial');
            if (data.result?.steps) {
                setSteps(data.result.steps);
                // Initialize quiz states
                const initial: Record<number, QuizState> = {};
                data.result.steps.forEach((_: any, i: number) => {
                    initial[i] = { selected: null, submitted: false };
                });
                setQuizStates(initial);
                // Auto-save
                store.save('last_walkthrough', { code, steps: data.result.steps, quizStates: initial }, 'walkthrough').catch(() => { });
            } else {
                toast.error("No steps returned. Try different code.");
            }
        } catch (e: any) { toast.error(e.message || "Failed to generate tutorial"); }
        setLoading(false);
    };

    const selectAnswer = (stepIdx: number, optionIdx: number) => {
        const qs = quizStates[stepIdx];
        if (qs?.submitted) return; // Already submitted, can't change
        setQuizStates(prev => ({
            ...prev,
            [stepIdx]: { ...prev[stepIdx], selected: optionIdx }
        }));
    };

    const submitAnswer = (stepIdx: number) => {
        const qs = quizStates[stepIdx];
        if (qs?.selected === null || qs?.selected === undefined) {
            toast.error("Please select an answer first.");
            return;
        }
        setQuizStates(prev => ({
            ...prev,
            [stepIdx]: { ...prev[stepIdx], submitted: true }
        }));

        const step = steps[stepIdx];
        const correctIdx = step.quiz.correctIndex ?? step.quiz.correct ?? 0;
        if (qs.selected === correctIdx) {
            toast.success("Correct! 🎉");
        } else {
            toast.error("Not quite. Check the correct answer highlighted in green.");
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-6 min-h-[600px]">
            <div className="space-y-4 flex flex-col">
                <Card className="flex-1 flex flex-col">
                    <CardHeader><CardTitle>Code Input</CardTitle></CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <Textarea
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="Paste complex code here to get a step-by-step tutorial..."
                            className="flex-1 font-mono text-xs"
                        />
                        <Button onClick={generate} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : "Generate Tutorial"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                {steps.length > 0 ? (
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Step {currentStep + 1}: {steps[currentStep].title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between overflow-y-auto">
                            <div className="space-y-4">
                                <p className="text-lg leading-relaxed">{steps[currentStep].explanation}</p>
                                <div className="p-3 bg-muted rounded font-mono text-sm">
                                    Focus: {steps[currentStep].file} L:{steps[currentStep].lines}
                                </div>

                                {steps[currentStep].quiz && (
                                    <div className="mt-8 border-t pt-4">
                                        <div className="text-sm font-bold mb-3">Quiz: {steps[currentStep].quiz.question}</div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {steps[currentStep].quiz.options.map((opt: string, i: number) => {
                                                const qs = quizStates[currentStep] || { selected: null, submitted: false };
                                                const correctIdx = steps[currentStep].quiz.correctIndex ?? steps[currentStep].quiz.correct ?? 0;
                                                const isSelected = qs.selected === i;
                                                const isCorrect = i === correctIdx;
                                                const isSubmitted = qs.submitted;

                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => selectAnswer(currentStep, i)}
                                                        className={cn(
                                                            "flex items-center gap-3 text-left py-3 px-4 rounded-lg border transition-all duration-200 text-sm",
                                                            !isSubmitted && isSelected && "border-primary bg-primary/10 ring-2 ring-primary/30",
                                                            !isSubmitted && !isSelected && "border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
                                                            isSubmitted && isCorrect && "border-green-500 bg-green-500/10 text-green-400",
                                                            isSubmitted && isSelected && !isCorrect && "border-red-500 bg-red-500/10 text-red-400",
                                                            isSubmitted && !isSelected && !isCorrect && "opacity-50",
                                                            isSubmitted && "cursor-default"
                                                        )}
                                                        disabled={isSubmitted}
                                                    >
                                                        {isSubmitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />}
                                                        {isSubmitted && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                                                        {!isSubmitted && (
                                                            <div className={cn(
                                                                "h-4 w-4 rounded-full border-2 flex-shrink-0 transition-colors",
                                                                isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                                                            )} />
                                                        )}
                                                        <span>{opt}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {/* Submit button */}
                                        {!quizStates[currentStep]?.submitted && (
                                            <Button
                                                onClick={() => submitAnswer(currentStep)}
                                                className="mt-4 w-full"
                                                disabled={quizStates[currentStep]?.selected === null || quizStates[currentStep]?.selected === undefined}
                                            >
                                                Submit Answer
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    disabled={currentStep === 0}
                                    variant="outline"
                                    onClick={() => setCurrentStep(c => c - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    disabled={currentStep === steps.length - 1}
                                    onClick={() => setCurrentStep(c => c + 1)}
                                >
                                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Tutorial will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
