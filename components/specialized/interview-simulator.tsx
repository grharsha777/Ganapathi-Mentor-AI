"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Search, Mic, MicOff, Camera, CameraOff, Play, Square, ChevronRight,
    Loader2, CheckCircle2, XCircle, AlertTriangle, Eye, EyeOff,
    MessageSquare, Sparkles, Volume2, VolumeX, RotateCcw, Trophy,
    Timer, Brain, Target, Zap, ArrowRight, Star, ThumbsUp, ThumbsDown,
    Monitor, User, Bot, Signal, Wifi
} from 'lucide-react';

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface Question {
    question: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
    hint: string;
    idealAnswer?: string;
}

interface PostureAnalysis {
    eyeContact: 'good' | 'needs-improvement' | 'poor';
    posture: 'good' | 'needs-improvement' | 'poor';
    confidence: number;
    tips: string[];
}

interface InterviewFeedback {
    score: number;
    strengths: string[];
    improvements: string[];
    modelAnswer: string;
}

type InterviewPhase = 'setup' | 'waiting' | 'live' | 'feedback' | 'summary';

// ─── TOPIC SUGGESTIONS ─────────────────────────────────────────────────────
const TOPIC_SUGGESTIONS = [
    { label: 'React', icon: '⚛️', color: 'from-cyan-500 to-blue-500' },
    { label: 'Next.js', icon: '▲', color: 'from-white/80 to-gray-400' },
    { label: 'TypeScript', icon: '🔷', color: 'from-blue-500 to-indigo-600' },
    { label: 'Node.js', icon: '🟢', color: 'from-green-500 to-emerald-600' },
    { label: 'Docker', icon: '🐳', color: 'from-sky-400 to-blue-600' },
    { label: 'Python', icon: '🐍', color: 'from-yellow-400 to-green-500' },
    { label: 'AWS', icon: '☁️', color: 'from-orange-400 to-yellow-500' },
    { label: 'System Design', icon: '🏗️', color: 'from-purple-500 to-pink-500' },
    { label: 'Data Structures', icon: '🌲', color: 'from-emerald-500 to-teal-600' },
    { label: 'Algorithms', icon: '🧮', color: 'from-rose-500 to-red-600' },
    { label: 'MongoDB', icon: '🍃', color: 'from-green-600 to-green-800' },
    { label: 'SQL', icon: '🗄️', color: 'from-blue-600 to-indigo-700' },
    { label: 'Kubernetes', icon: '☸️', color: 'from-blue-400 to-indigo-500' },
    { label: 'GraphQL', icon: '◆', color: 'from-pink-500 to-rose-600' },
    { label: 'CSS', icon: '🎨', color: 'from-blue-500 to-purple-500' },
    { label: 'Git', icon: '🔀', color: 'from-orange-500 to-red-500' },
];

const DIFFICULTY_LEVELS = [
    { label: 'Beginner', value: 'Easy', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: '🌱' },
    { label: 'Intermediate', value: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '⚡' },
    { label: 'Advanced', value: 'Hard', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: '🔥' },
];

// ─── QUESTION COUNT OPTIONS ──────────────────────────────────────────────────
const QUESTION_COUNT_OPTIONS = [
    { label: '5 Questions', value: 5, desc: 'Quick practice', icon: '⚡' },
    { label: '10 Questions', value: 10, desc: 'Balanced session', icon: '🎯' },
    { label: '15 Questions', value: 15, desc: 'Deep preparation', icon: '🔥' },
];

// ─── SRI GANAPATHI AVATAR COMPONENT ─────────────────────────────────────────
function GanapathiAvatar({ isSpeaking, phase }: { isSpeaking: boolean; phase: InterviewPhase }) {
    return (
        <div className="relative group perspective-1000">
            {/* Dynamic Divine Aura Rings */}
            <div className={cn(
                "absolute inset-[-20px] rounded-full blur-3xl transition-all duration-1000",
                isSpeaking
                    ? "bg-gradient-to-tr from-emerald-500/60 via-teal-600/40 to-amber-300/50 scale-110 animate-pulse"
                    : "bg-gradient-to-tr from-teal-900/40 via-emerald-900/20 to-green-900/30 scale-100"
            )} />

            {/* Audio Wave Visualizer Rings (when speaking) */}
            {isSpeaking && (
                <>
                    <div className="absolute inset-[-10px] rounded-full border border-teal-400/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75" />
                    <div className="absolute inset-[-20px] rounded-full border border-emerald-400/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50 delay-75" />
                </>
            )}

            {/* Avatar container */}
            <div className={cn(
                "relative z-10 w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 transition-all duration-700 ease-in-out transform shadow-2xl",
                isSpeaking
                    ? "border-teal-400 shadow-[0_0_40px_rgba(45,212,191,0.6)] scale-105"
                    : "border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:border-emerald-500/50 hover:scale-[1.02]"
            )}>
                {/* Photorealistic Ganapathi Image */}
                <img
                    src="https://rukminim2.flixcart.com/image/480/640/xif0q/sticker/i/m/6/medium-bal-ganesha-reading-a-book-wall-poster-for-bed-room-original-imah48x9jgvqgzr9.jpeg?q=90"
                    alt="Sri Ganapathi Avatar"
                    className={cn(
                        "w-full h-full object-cover transition-transform duration-1000 origin-center",
                        // Scale to automatically crop out the white borders of the uploaded image
                        isSpeaking ? "scale-[1.35]" : "scale-[1.25]"
                    )}
                />

                {/* Lighting Overlays for realism */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-teal-500/20 via-transparent to-amber-500/10 mix-blend-overlay transition-opacity duration-500 pointer-events-none",
                    isSpeaking ? "opacity-100" : "opacity-0"
                )} />
            </div>

            {/* Status indicator - Glowing Gem */}
            <div className={cn(
                "absolute -bottom-2 right-2 w-8 h-8 rounded-full border-[3px] border-background flex items-center justify-center z-20 shadow-lg transition-colors duration-500",
                phase === 'live'
                    ? "bg-gradient-to-br from-emerald-400 to-green-600 shadow-green-500/50"
                    : "bg-gradient-to-br from-slate-500 to-gray-700 shadow-gray-900/50"
            )}>
                {phase === 'live' ? (
                    <Signal className="w-4 h-4 text-white animate-pulse" />
                ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
                )}
            </div>
        </div>
    );
}

// ─── POSTURE OVERLAY COMPONENT ──────────────────────────────────────────────
function PostureOverlay({ analysis }: { analysis: PostureAnalysis | null }) {
    if (!analysis) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'text-emerald-400';
            case 'needs-improvement': return 'text-amber-400';
            case 'poor': return 'text-rose-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'good': return <CheckCircle2 className="w-3.5 h-3.5" />;
            case 'needs-improvement': return <AlertTriangle className="w-3.5 h-3.5" />;
            case 'poor': return <XCircle className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    return (
        <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1.5">
            {/* Eye Contact */}
            <div className={cn(
                "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm",
                getStatusColor(analysis.eyeContact)
            )}>
                {getStatusIcon(analysis.eyeContact)}
                <Eye className="w-3 h-3" />
                <span>Eye Contact: {analysis.eyeContact.replace('-', ' ')}</span>
            </div>
            {/* Posture */}
            <div className={cn(
                "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm",
                getStatusColor(analysis.posture)
            )}>
                {getStatusIcon(analysis.posture)}
                <User className="w-3 h-3" />
                <span>Posture: {analysis.posture.replace('-', ' ')}</span>
            </div>
            {/* Confidence level */}
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-violet-300">
                <Zap className="w-3 h-3" />
                <span>Confidence: {analysis.confidence}%</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden ml-1">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-700"
                        style={{ width: `${analysis.confidence}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── WAVEFORM VISUALIZER ────────────────────────────────────────────────────
function WaveformVisualizer({ isActive }: { isActive: boolean }) {
    return (
        <div className="flex items-end gap-0.5 h-8">
            {Array.from({ length: 20 }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "w-1 rounded-full transition-all",
                        isActive
                            ? "bg-gradient-to-t from-violet-500 to-purple-400"
                            : "bg-white/10"
                    )}
                    style={{
                        height: isActive
                            ? `${Math.random() * 24 + 8}px`
                            : '4px',
                        animationDuration: `${0.3 + Math.random() * 0.5}s`,
                        animation: isActive ? `wave ${0.3 + Math.random() * 0.5}s ease-in-out infinite alternate` : 'none',
                    }}
                />
            ))}
        </div>
    );
}

// ─── SCORE RING ─────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 10) * circumference;

    const getColor = () => {
        if (score >= 8) return 'text-emerald-400';
        if (score >= 6) return 'text-amber-400';
        return 'text-rose-400';
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="4"
                    className={cn("transition-all duration-1000", getColor())}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className={cn("absolute inset-0 flex items-center justify-center font-bold text-xl", getColor())}>
                {score}
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function InterviewSimulator() {
    // ── State ─────────────────────────────────────────
    const [phase, setPhase] = useState<InterviewPhase>('setup');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [questionCount, setQuestionCount] = useState(5);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);

    // Camera
    const [cameraOn, setCameraOn] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [postureAnalysis, setPostureAnalysis] = useState<PostureAnalysis | null>(null);

    // Speech
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Timer
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Feedback
    const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    // Summary
    const [overallScore, setOverallScore] = useState(0);
    const [allFeedbacks, setAllFeedbacks] = useState<InterviewFeedback[]>([]);

    // Search filtering
    const filteredTopics = TOPIC_SUGGESTIONS.filter(t =>
        t.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ── Camera ────────────────────────────────────────
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 },
                audio: false
            });
            setCameraStream(stream);
            setCameraOn(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            toast.error("Camera access denied. Enable camera for posture feedback.");
        }
    }, []);

    const stopCamera = useCallback(() => {
        cameraStream?.getTracks().forEach(t => t.stop());
        setCameraStream(null);
        setCameraOn(false);
    }, [cameraStream]);

    useEffect(() => {
        if (videoRef.current && cameraStream) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [cameraStream]);

    // ── Posture Analysis Simulation ───────────────────
    useEffect(() => {
        if (!cameraOn || phase !== 'live') return;
        const interval = setInterval(() => {
            // Simulated posture analysis — in production, use TensorFlow.js PoseNet/BlazePose
            const eyeStates: ('good' | 'needs-improvement' | 'poor')[] = ['good', 'good', 'good', 'needs-improvement'];
            const postureStates: ('good' | 'needs-improvement' | 'poor')[] = ['good', 'good', 'needs-improvement'];
            const tips = [
                "Great eye contact! Keep looking at the camera.",
                "Sit up straight for a more confident appearance.",
                "Try to maintain steady eye contact with the interviewer.",
                "Your posture looks professional!",
                "Relax your shoulders slightly.",
            ];
            setPostureAnalysis({
                eyeContact: eyeStates[Math.floor(Math.random() * eyeStates.length)],
                posture: postureStates[Math.floor(Math.random() * postureStates.length)],
                confidence: Math.min(100, Math.max(40, 65 + Math.floor(Math.random() * 30))),
                tips: [tips[Math.floor(Math.random() * tips.length)]],
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [cameraOn, phase]);

    // ── Timer ─────────────────────────────────────────
    useEffect(() => {
        if (phase === 'live') {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase]);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // ── Speech Synthesis ──────────────────────────────
    const speak = useCallback((text: string) => {
        if (isMuted || typeof window === 'undefined') return;

        speechSynthesis.cancel();

        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            // Slightly lower pitch for a calmer, wiser tone appropriate for Ganapathi
            utterance.pitch = 0.9;
            utterance.volume = 1;

            const voices = speechSynthesis.getVoices();
            // Try to find a good deep or clear voice
            const preferred = voices.find(v =>
                v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Samantha') || v.name.includes('UK English') || v.name.includes('Male')
            );
            if (preferred) utterance.voice = preferred;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = (e) => {
                console.error("Speech synthesis error", e);
                setIsSpeaking(false);
            };

            // Prevent garbage collection bug in Chrome
            (window as any).currentUtterance = utterance;

            speechSynthesis.speak(utterance);
        }, 50);
    }, [isMuted]);

    // ── Speech Recognition ────────────────────────────
    const startRecording = useCallback(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { toast.error("Speech recognition not supported. Use Chrome."); return; }

        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalText = '';

        recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalText += event.results[i][0].transcript + ' ';
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            setTranscript(finalText + interim);
        };

        recognition.onerror = (event: any) => {
            if (event.error !== 'aborted') toast.error("Mic error: " + event.error);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setTranscript(finalText.trim());
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    }, []);

    const stopRecording = useCallback(() => {
        recognitionRef.current?.stop();
        setIsRecording(false);
    }, []);

    // ── Generate Questions ────────────────────────────
    const startInterview = async () => {
        if (!selectedTopic) { toast.error("Please select a topic first."); return; }

        // Unlock speech synthesis on user gesture to bypass browser autoplay policies
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            speechSynthesis.resume();
            const unlockUtterance = new SpeechSynthesisUtterance('');
            unlockUtterance.volume = 0;
            speechSynthesis.speak(unlockUtterance);
        }

        setIsGenerating(true);
        setPhase('waiting');

        try {
            const res = await fetch('/api/specialized', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    type: 'interview',
                    context: `${selectedTopic} - ${difficulty} level`,
                    topic: selectedTopic,
                    difficulty,
                    questionCount
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate');
            const qs = data.result?.questions || [];
            setQuestions(qs);
            setCurrentQIndex(0);
            setTimer(0);
            setAllFeedbacks([]);
            setOverallScore(0);

            // Start camera automatically
            await startCamera();

            // Transition to live
            setPhase('live');
            toast.success("Interview session started!");

            // AI speaks the first question
            setTimeout(() => {
                speak(`Welcome to your ${selectedTopic} interview. Let's begin. ${qs[0]?.question || ''}`);
            }, 500);
        } catch (e: any) {
            toast.error(e.message || "Failed to start interview");
            setPhase('setup');
        }
        setIsGenerating(false);
    };

    // ── Submit Answer ─────────────────────────────────
    const submitAnswer = async () => {
        if (!transcript.trim()) { toast.error("Please answer the question first."); return; }
        stopRecording();
        setIsEvaluating(true);

        const q = questions[currentQIndex];
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: `You are an expert technical interviewer evaluating a candidate's answer. Respond ONLY in valid JSON format with these fields:
{
  "score": <number 1-10>,
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "modelAnswer": "<brief ideal answer>"
}

Question (${q.difficulty}): ${q.question}
Topic: ${q.topic}
Candidate's Answer: ${transcript}

Be encouraging but honest. Evaluate technical accuracy, completeness, and communication clarity.`
                    }],
                    context: '/dashboard/interview-simulator'
                })
            });

            if (!res.ok) throw new Error('Evaluation failed');
            const rawText = await res.text();

            let fb: InterviewFeedback;
            try {
                // Try to parse JSON from the response
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
                fb = {
                    score: Math.min(10, Math.max(1, parsed.score || 5)),
                    strengths: parsed.strengths || ['Good attempt'],
                    improvements: parsed.improvements || ['Keep practicing'],
                    modelAnswer: parsed.modelAnswer || 'No model answer provided.',
                };
            } catch {
                fb = { score: 6, strengths: ['Good effort'], improvements: ['Keep learning'], modelAnswer: rawText.substring(0, 300) };
            }

            setFeedback(fb);
            setAllFeedbacks(prev => [...prev, fb]);
            setPhase('feedback');

            // Speak feedback
            const scoreMsg = fb.score >= 8 ? "Excellent answer!" : fb.score >= 6 ? "Good answer, with some room for improvement." : "Let me share some feedback.";
            speak(scoreMsg);
        } catch (e: any) {
            toast.error("Evaluation failed. Please try again.");
        }
        setIsEvaluating(false);
    };

    // ── Next Question ─────────────────────────────────
    const nextQuestion = () => {
        if (currentQIndex >= questions.length - 1) {
            // All questions done — show summary
            const avg = allFeedbacks.reduce((sum, f) => sum + f.score, 0) / allFeedbacks.length;
            setOverallScore(Math.round(avg * 10) / 10);
            setPhase('summary');
            speak("That concludes your interview session. Let's review your performance.");
            return;
        }
        setCurrentQIndex(i => i + 1);
        setTranscript('');
        setFeedback(null);
        setPhase('live');
        setTimeout(() => {
            speak(`Next question. ${questions[currentQIndex + 1]?.question || ''}`);
        }, 300);
    };

    // ── Reset ─────────────────────────────────────────
    const resetInterview = () => {
        stopCamera();
        stopRecording();
        speechSynthesis.cancel();
        setPhase('setup');
        setQuestions([]);
        setCurrentQIndex(0);
        setTranscript('');
        setFeedback(null);
        setTimer(0);
        setAllFeedbacks([]);
        setOverallScore(0);
        setPostureAnalysis(null);
    };

    // ── Cleanup ───────────────────────────────────────
    useEffect(() => {
        return () => {
            stopCamera();
            speechSynthesis.cancel();
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ═══════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════

    // ── SETUP PHASE ───────────────────────────────────
    if (phase === 'setup') {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-950/50 via-background to-purple-950/30 p-6 sm:p-10">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Bot className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
                            AI Live Interview Simulator
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
                            Experience realistic mock interviews with an AI interviewer. Get real-time feedback on your answers, posture, eye contact, and communication skills.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                            <Badge variant="outline" className="border-violet-500/30 text-violet-300 gap-1.5"><Camera className="w-3 h-3" /> Camera Analysis</Badge>
                            <Badge variant="outline" className="border-violet-500/30 text-violet-300 gap-1.5"><Mic className="w-3 h-3" /> Voice Recognition</Badge>
                            <Badge variant="outline" className="border-violet-500/30 text-violet-300 gap-1.5"><Brain className="w-3 h-3" /> AI Feedback</Badge>
                            <Badge variant="outline" className="border-violet-500/30 text-violet-300 gap-1.5"><Eye className="w-3 h-3" /> Posture Coach</Badge>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
                        <div className="relative flex items-center bg-card/50 border border-white/[0.08] rounded-xl overflow-hidden backdrop-blur-sm">
                            <Search className="w-5 h-5 text-muted-foreground ml-4" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search topics... (React, Docker, Python, System Design...)"
                                className="w-full bg-transparent border-0 px-4 py-4 text-base focus:outline-none placeholder:text-muted-foreground/50"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="mr-3 text-muted-foreground hover:text-foreground">
                                    <XCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Topic Grid */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Select Interview Topic</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {filteredTopics.map((topic) => (
                            <button
                                key={topic.label}
                                onClick={() => { setSelectedTopic(topic.label); setSearchQuery(topic.label); }}
                                className={cn(
                                    "group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 hover:scale-[1.02]",
                                    selectedTopic === topic.label
                                        ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                                        : "border-white/[0.06] bg-card/30 hover:border-white/[0.12] hover:bg-card/50"
                                )}
                            >
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                                    topic.color,
                                    selectedTopic === topic.label ? "opacity-[0.08]" : "group-hover:opacity-[0.04]"
                                )} />
                                <div className="relative z-10">
                                    <div className="text-2xl mb-2">{topic.icon}</div>
                                    <div className="font-semibold text-sm">{topic.label}</div>
                                </div>
                                {selectedTopic === topic.label && (
                                    <div className="absolute top-2 right-2">
                                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    {filteredTopics.length === 0 && searchQuery && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No matching topics. We'll use "<strong>{searchQuery}</strong>" as your custom topic.</p>
                            <Button variant="outline" className="mt-3" onClick={() => setSelectedTopic(searchQuery)}>
                                Use Custom Topic: {searchQuery}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Difficulty */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Difficulty Level</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {DIFFICULTY_LEVELS.map((d) => (
                            <button
                                key={d.value}
                                onClick={() => setDifficulty(d.value)}
                                className={cn(
                                    "rounded-xl border p-4 text-center transition-all duration-300",
                                    difficulty === d.value
                                        ? cn(d.color, "border-current shadow-lg")
                                        : "border-white/[0.06] bg-card/30 hover:border-white/[0.12]"
                                )}
                            >
                                <div className="text-2xl mb-1">{d.icon}</div>
                                <div className="text-sm font-semibold">{d.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Count */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Number of Questions</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {QUESTION_COUNT_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setQuestionCount(opt.value)}
                                className={cn(
                                    "rounded-xl border p-4 text-center transition-all duration-300",
                                    questionCount === opt.value
                                        ? "border-violet-500/50 bg-violet-500/15 text-violet-300 shadow-lg shadow-violet-500/10"
                                        : "border-white/[0.06] bg-card/30 hover:border-white/[0.12]"
                                )}
                            >
                                <div className="text-2xl mb-1">{opt.icon}</div>
                                <div className="text-sm font-semibold">{opt.label}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Start Button */}
                <Button
                    onClick={startInterview}
                    disabled={!selectedTopic || isGenerating}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Preparing Interview...</>
                    ) : (
                        <><Play className="w-5 h-5 mr-2" /> Start Live Interview</>
                    )}
                </Button>
            </div>
        );
    }

    // ── WAITING PHASE ─────────────────────────────────
    if (phase === 'waiting') {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-6 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Setting Up Your Interview</h3>
                    <p className="text-muted-foreground">Generating {selectedTopic} questions at {difficulty} level...</p>
                </div>
            </div>
        );
    }

    // ── LIVE INTERVIEW PHASE ──────────────────────────
    if (phase === 'live' || phase === 'feedback') {
        const currentQ = questions[currentQIndex];

        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                {/* Top Bar */}
                <div className="flex items-center justify-between bg-card/50 border border-white/[0.06] rounded-xl px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="font-semibold text-red-400">LIVE</span>
                        </div>
                        <div className="w-px h-5 bg-white/10" />
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Timer className="w-3.5 h-3.5" />
                            <span className="font-mono">{formatTime(timer)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                            Q{currentQIndex + 1}/{questions.length}
                        </Badge>
                        <Badge variant={currentQ?.difficulty === 'Hard' ? 'destructive' : currentQ?.difficulty === 'Easy' ? 'secondary' : 'default'} className="text-xs">
                            {currentQ?.difficulty}
                        </Badge>
                        <button onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground hover:text-foreground transition-colors">
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button onClick={resetInterview} className="text-muted-foreground hover:text-rose-400 transition-colors">
                            <Square className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Interview Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Interviewer Side */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* AI Interviewer */}
                        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-950/30 via-card/50 to-purple-950/20 p-6">
                            <div className="flex items-start gap-5">
                                <GanapathiAvatar isSpeaking={isSpeaking} phase={phase} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-violet-300">AI Interviewer</span>
                                        {isSpeaking && <WaveformVisualizer isActive={true} />}
                                    </div>
                                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                                        <p className="text-base sm:text-lg leading-relaxed font-medium">
                                            {currentQ?.question || 'Loading question...'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Badge variant="outline" className="text-xs border-white/10">{currentQ?.topic}</Badge>
                                        {currentQ?.hint && (
                                            <button
                                                onClick={() => toast.info(currentQ.hint)}
                                                className="text-xs text-muted-foreground hover:text-violet-400 transition-colors flex items-center gap-1"
                                            >
                                                <Sparkles className="w-3 h-3" /> Hint
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Answer Area */}
                        {phase === 'live' && (
                            <div className="space-y-4">
                                {/* Transcript */}
                                <div className={cn(
                                    "rounded-2xl border p-5 min-h-[120px] transition-all duration-300",
                                    isRecording
                                        ? "border-red-500/30 bg-red-500/5 shadow-lg shadow-red-500/5"
                                        : transcript
                                            ? "border-emerald-500/20 bg-emerald-500/5"
                                            : "border-white/[0.06] bg-card/30"
                                )}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Your Answer</span>
                                        {isRecording && (
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                <span className="text-xs text-red-400">Recording</span>
                                            </div>
                                        )}
                                    </div>
                                    {transcript ? (
                                        <p className="text-sm sm:text-base leading-relaxed">{transcript}</p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground/50 italic">
                                            Click the microphone to start answering...
                                        </p>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        variant={isRecording ? "destructive" : "outline"}
                                        className={cn(
                                            "flex-1 h-12 rounded-xl transition-all duration-300",
                                            isRecording && "animate-pulse"
                                        )}
                                    >
                                        {isRecording ? <><MicOff className="w-4 h-4 mr-2" /> Stop Recording</> : <><Mic className="w-4 h-4 mr-2" /> Start Speaking</>}
                                    </Button>
                                    <Button
                                        onClick={submitAnswer}
                                        disabled={!transcript.trim() || isEvaluating}
                                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40"
                                    >
                                        {isEvaluating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</> : <><ArrowRight className="w-4 h-4 mr-2" /> Submit Answer</>}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Feedback Phase */}
                        {phase === 'feedback' && feedback && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Score Card */}
                                <div className="rounded-2xl border border-white/[0.06] bg-card/50 p-6">
                                    <div className="flex items-center gap-6">
                                        <ScoreRing score={feedback.score} />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg mb-1">
                                                {feedback.score >= 8 ? '🎉 Excellent!' : feedback.score >= 6 ? '👍 Good Job!' : '💪 Keep Practicing!'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Score: {feedback.score}/10 for this question
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Strengths */}
                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ThumbsUp className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm font-semibold text-emerald-400">Strengths</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {feedback.strengths.map((s, i) => (
                                            <li key={i} className="text-sm flex items-start gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Improvements */}
                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ThumbsDown className="w-4 h-4 text-amber-400" />
                                        <span className="text-sm font-semibold text-amber-400">Areas for Improvement</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {feedback.improvements.map((s, i) => (
                                            <li key={i} className="text-sm flex items-start gap-2">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Model Answer */}
                                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Brain className="w-4 h-4 text-violet-400" />
                                        <span className="text-sm font-semibold text-violet-400">Model Answer</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{feedback.modelAnswer}</p>
                                </div>

                                {/* Next / Finish */}
                                <Button
                                    onClick={nextQuestion}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                                >
                                    {currentQIndex >= questions.length - 1 ? (
                                        <><Trophy className="w-4 h-4 mr-2" /> View Final Results</>
                                    ) : (
                                        <><ChevronRight className="w-4 h-4 mr-2" /> Next Question ({currentQIndex + 2}/{questions.length})</>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Camera Side Panel */}
                    <div className="space-y-4">
                        {/* Camera Feed */}
                        <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-black aspect-[4/3]">
                            {cameraOn ? (
                                <>
                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform -scale-x-100" />
                                    <PostureOverlay analysis={postureAnalysis} />
                                    <div className="absolute top-2 left-2 flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-green-400">
                                        <Camera className="w-3 h-3" /> Live
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                    <CameraOff className="w-8 h-8" />
                                    <span className="text-sm">Camera Off</span>
                                    <Button variant="outline" size="sm" onClick={startCamera}>
                                        <Camera className="w-3 h-3 mr-1.5" /> Enable Camera
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Camera Controls */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 rounded-lg"
                                onClick={cameraOn ? stopCamera : startCamera}
                            >
                                {cameraOn ? <><CameraOff className="w-3 h-3 mr-1.5" /> Turn Off</> : <><Camera className="w-3 h-3 mr-1.5" /> Turn On</>}
                            </Button>
                        </div>

                        {/* Posture Tips */}
                        {postureAnalysis && postureAnalysis.tips.length > 0 && (
                            <div className="rounded-xl border border-white/[0.06] bg-card/30 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-violet-400" />
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coaching Tips</span>
                                </div>
                                {postureAnalysis.tips.map((tip, i) => (
                                    <p key={i} className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                                ))}
                            </div>
                        )}

                        {/* Progress */}
                        <div className="rounded-xl border border-white/[0.06] bg-card/30 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Target className="w-4 h-4 text-violet-400" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</span>
                            </div>
                            <div className="flex gap-1.5">
                                {questions.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-2 flex-1 rounded-full transition-all duration-300",
                                            i < currentQIndex ? "bg-emerald-500"
                                                : i === currentQIndex ? "bg-violet-500 animate-pulse"
                                                    : "bg-white/10"
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {currentQIndex + 1} of {questions.length} questions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── SUMMARY PHASE ─────────────────────────────────
    if (phase === 'summary') {
        return (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Final Score */}
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-950/50 via-card/50 to-purple-950/30 p-8 text-center">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
                        <p className="text-muted-foreground mb-6">Here's how you performed in your {selectedTopic} interview</p>
                        <div className="flex justify-center mb-6">
                            <ScoreRing score={overallScore} size={120} />
                        </div>
                        <div className="flex justify-center gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-violet-400">{questions.length}</div>
                                <div className="text-muted-foreground">Questions</div>
                            </div>
                            <div className="w-px bg-white/10" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-violet-400">{formatTime(timer)}</div>
                                <div className="text-muted-foreground">Duration</div>
                            </div>
                            <div className="w-px bg-white/10" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-violet-400">{overallScore}/10</div>
                                <div className="text-muted-foreground">Avg Score</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question-by-question scores */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Question Breakdown</h3>
                    {questions.map((q, i) => {
                        const fb = allFeedbacks[i];
                        return (
                            <div key={i} className="rounded-xl border border-white/[0.06] bg-card/30 p-4 flex items-center gap-4">
                                <ScoreRing score={fb?.score || 0} size={48} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{q.question}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{q.topic} · {q.difficulty}</p>
                                </div>
                                <Badge variant={fb?.score && fb.score >= 8 ? 'default' : fb?.score && fb.score >= 6 ? 'secondary' : 'destructive'}>
                                    {fb?.score || 0}/10
                                </Badge>
                            </div>
                        );
                    })}
                </div>

                {/* Restart */}
                <div className="flex gap-3">
                    <Button onClick={resetInterview} variant="outline" className="flex-1 h-12 rounded-xl">
                        <RotateCcw className="w-4 h-4 mr-2" /> New Interview
                    </Button>
                    <Button
                        onClick={() => { resetInterview(); setSelectedTopic(selectedTopic); setSearchQuery(selectedTopic); }}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Retry {selectedTopic}
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}
