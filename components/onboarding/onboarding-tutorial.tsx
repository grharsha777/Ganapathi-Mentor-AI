'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard, Compass, Code, Brain, CheckCircle, FileText,
    Github, Activity, Telescope, Clapperboard, Trophy, Mic,
    Zap, GraduationCap, Briefcase, MessageSquare, Sparkles,
    ChevronRight, ChevronLeft, X, Rocket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const ONBOARDING_KEY = 'ganapathi_onboarding_seen'

interface Slide {
    title: string
    subtitle: string
    description: string
    icon: any
    color: string
    features?: { icon: any; label: string; desc: string }[]
}

const slides: Slide[] = [
    {
        title: 'Welcome to Ganapathi AI! 🎉',
        subtitle: 'Your AI-Powered Coding Mentor',
        description: 'Built by G R Harsha, Ganapathi AI is your personal coding companion that helps you learn, practice, and master software development with cutting-edge AI tools.',
        icon: Sparkles,
        color: '#7C3AED',
    },
    {
        title: 'Learn & Grow',
        subtitle: 'Personalized Learning Paths',
        description: 'AI generates custom roadmaps based on your skill level. Track progress, complete sessions, and build real expertise — all tailored for you.',
        icon: Compass,
        color: '#F97316',
        features: [
            { icon: Compass, label: 'Learning Paths', desc: 'AI-curated study roadmaps' },
            { icon: Brain, label: 'Concept Engine', desc: 'Master any concept in seconds' },
            { icon: GraduationCap, label: 'Training', desc: 'Specialized AI training modules' },
        ]
    },
    {
        title: 'Code Like a Pro',
        subtitle: 'AI-Powered Code Tools',
        description: 'Get your code reviewed by AI, generate documentation automatically, and collaborate with others in real-time.',
        icon: Code,
        color: '#0EA5E9',
        features: [
            { icon: Code, label: 'Code Review', desc: 'AI analyzes your code quality' },
            { icon: FileText, label: 'Doc Generator', desc: 'Auto-generate documentation' },
            { icon: CheckCircle, label: 'Productivity', desc: 'Track tasks & stay focused' },
        ]
    },
    {
        title: 'Research & Create',
        subtitle: 'Explore Beyond Code',
        description: 'Search the web, find tutorials, generate AI images, and prepare for interviews — all from one platform.',
        icon: Telescope,
        color: '#14B8A6',
        features: [
            { icon: Telescope, label: 'Research Hub', desc: 'Web search + AI analysis' },
            { icon: Clapperboard, label: 'Media Studio', desc: 'AI image generation' },
            { icon: Mic, label: 'Mock Interview', desc: 'Practice with AI interviewer' },
        ]
    },
    {
        title: 'Track & Compete',
        subtitle: 'Analytics & Challenges',
        description: 'View detailed analytics of your learning journey, compete in coding challenges, and build your developer portfolio.',
        icon: Trophy,
        color: '#F59E0B',
        features: [
            { icon: Activity, label: 'Analytics', desc: 'Track your coding progress' },
            { icon: Trophy, label: 'Challenges', desc: 'Solve coding problems for XP' },
            { icon: Briefcase, label: 'Portfolio', desc: 'Showcase your achievements' },
        ]
    },
    {
        title: "You're All Set! 🚀",
        subtitle: 'Start your coding journey',
        description: 'Explore any feature from the bottom navigation dock. Your AI buddy is always ready to help — just open the chat anytime!',
        icon: Rocket,
        color: '#10B981',
    },
]

export function OnboardingTutorial() {
    const [show, setShow] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)
    const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
    const { user } = useAuth()

    const onboardingKey = user?.email
        ? `${ONBOARDING_KEY}_${user.email}`
        : ONBOARDING_KEY

    useEffect(() => {
        if (!user?.email) return // Wait until user is loaded
        // Only show if user has NOT seen it before
        const seen = localStorage.getItem(onboardingKey)
        if (!seen) {
            // Small delay so the dashboard loads first
            const timer = setTimeout(() => setShow(true), 1200)
            return () => clearTimeout(timer)
        }
    }, [user?.email, onboardingKey])

    const dismiss = () => {
        setShow(false)
        localStorage.setItem(onboardingKey, 'true')
    }

    const next = () => {
        if (currentSlide === slides.length - 1) {
            dismiss()
        } else {
            setDirection(1)
            setCurrentSlide(prev => prev + 1)
        }
    }

    const prev = () => {
        if (currentSlide > 0) {
            setDirection(-1)
            setCurrentSlide(prev => prev - 1)
        }
    }

    if (!show) return null

    const slide = slides[currentSlide]
    const Icon = slide.icon
    const isLast = currentSlide === slides.length - 1

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
            >
                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className="relative w-full max-w-lg rounded-3xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(180deg, rgba(18,18,30,0.98) 0%, rgba(10,10,20,0.99) 100%)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: `0 30px 80px -15px ${slide.color}30, 0 0 0 1px rgba(255,255,255,0.05)`,
                    }}
                >
                    {/* Skip Button */}
                    <button
                        onClick={dismiss}
                        className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                        aria-label="Skip onboarding"
                    >
                        <X className="w-4 h-4 text-white/50" />
                    </button>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 pt-6">
                        {slides.map((_, i) => (
                            <div
                                key={i}
                                className="h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: i === currentSlide ? '24px' : '8px',
                                    background: i === currentSlide ? slide.color : 'rgba(255,255,255,0.15)',
                                }}
                            />
                        ))}
                    </div>

                    {/* Slide Content */}
                    <div className="px-8 pb-8 pt-6">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={currentSlide}
                                initial={{ x: direction * 60, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: direction * -60, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                {/* Icon */}
                                <div className="flex justify-center">
                                    <div
                                        className="w-20 h-20 rounded-[28%] flex items-center justify-center relative overflow-hidden"
                                        style={{
                                            background: `linear-gradient(135deg, ${slide.color} 0%, ${slide.color}88 100%)`,
                                            boxShadow: `0 0 40px ${slide.color}50, inset 0 0 15px rgba(255,255,255,0.3)`,
                                        }}
                                    >
                                        <div className="absolute inset-x-0 top-0 h-[50%] pointer-events-none"
                                            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, transparent 100%)' }} />
                                        <Icon className="w-10 h-10 text-white relative z-10" strokeWidth={2}
                                            style={{ filter: `drop-shadow(0 0 8px #fff) drop-shadow(0 0 15px ${slide.color})` }} />
                                    </div>
                                </div>

                                {/* Text */}
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{slide.title}</h2>
                                    <p className="text-sm font-medium" style={{ color: slide.color }}>{slide.subtitle}</p>
                                    <p className="text-sm text-white/60 leading-relaxed">{slide.description}</p>
                                </div>

                                {/* Features Grid */}
                                {slide.features && (
                                    <div className="grid grid-cols-3 gap-3 pt-2">
                                        {slide.features.map((feat, i) => {
                                            const FIcon = feat.icon
                                            return (
                                                <div key={i} className="text-center p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                                                    <FIcon className="w-5 h-5 mx-auto mb-1.5" style={{ color: slide.color }} />
                                                    <p className="text-[11px] font-semibold text-white/90">{feat.label}</p>
                                                    <p className="text-[10px] text-white/40 mt-0.5">{feat.desc}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-8">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={prev}
                                disabled={currentSlide === 0}
                                className="text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-0"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back
                            </Button>

                            <span className="text-xs text-white/30 font-medium">
                                {currentSlide + 1} / {slides.length}
                            </span>

                            <Button
                                size="sm"
                                onClick={next}
                                className="px-5 font-semibold text-white border-0"
                                style={{
                                    background: `linear-gradient(135deg, ${slide.color} 0%, ${slide.color}cc 100%)`,
                                    boxShadow: `0 4px 20px -4px ${slide.color}60`,
                                }}
                            >
                                {isLast ? "Let's Go!" : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
