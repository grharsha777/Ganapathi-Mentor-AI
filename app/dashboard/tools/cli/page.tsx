'use client';

import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import {
    Terminal as TerminalIcon,
    Copy,
    Download,
    Zap,
    HeartPulse,
    Search,
    Cpu,
    Globe,
    Rocket,
    ShieldCheck,
    Code2,
    Sparkles,
    Command,
    Settings,
    Key,
    CheckCircle2,
    ChevronRight,
    Info,
    Server,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useState } from 'react';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function TerminalHubPage() {
    const [activeStep, setActiveStep] = useState(0);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Command copied to clipboard!");
    };

    const steps = [
        {
            title: "Installation",
            description: "Install the core engine globally via npm.",
            command: "npm install -g ganapathi-mentor-cli",
            icon: Download
        },
        {
            title: "Authentication",
            description: "Securely link your Mistral AI API key.",
            command: "set MISTRAL_API_KEY=your_key_here",
            icon: Key
        },
        {
            title: "Activation",
            description: "Summon the mentor inside any project folder.",
            command: "ganapathi-mentor \"Analyze this project\"",
            icon: Zap
        }
    ];

    return (
        <PageShell>
            <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-16 pb-24">

                {/* Hero Section with Moving Background */}
                <motion.div variants={fadeInUp} className="relative group rounded-[2.5rem] overflow-hidden border border-primary/20 bg-black/60 backdrop-blur-3xl p-8 md:p-16 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="max-w-2xl space-y-8 text-center md:text-left">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
                            >
                                <Activity className="w-3.5 h-3.5 animate-pulse" />
                                Neural Interface Active
                            </motion.div>

                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                                THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">LEGENDARY</span> <br />
                                CLI MENTOR
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                                Break free from static sidebars. Experience a
                                <span className="text-white font-semibold"> senior architect </span>
                                that lives in your shell, understands your files, and executes with precision.
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <Button size="lg" className="h-14 rounded-2xl gap-3 font-bold px-10 bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 transition-all hover:scale-105" onClick={() => document.getElementById('onboarding')?.scrollIntoView({ behavior: 'smooth' })}>
                                    Get Started <ChevronRight className="w-5 h-5" />
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 rounded-2xl gap-3 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all" onClick={() => copyToClipboard('ganapathi-mentor --version')}>
                                    <TerminalIcon className="w-5 h-5 text-primary" /> View Version
                                </Button>
                            </div>
                        </div>

                        <div className="hidden lg:block relative">
                            <div className="w-80 h-80 rounded-[3rem] border border-white/5 bg-zinc-900/50 backdrop-blur-xl p-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <pre className="text-[10px] font-mono text-primary/80 leading-tight">
                                    {`$ ganapathi-mentor init
> Analyzing repo...
> Node.js detected.
> Tailwind detected.
> 42 components found.
> Standing by for orders.`}
                                </pre>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Onboarding Steps Section */}
                <motion.section id="onboarding" variants={fadeInUp} className="space-y-12">
                    <div className="text-center space-y-4">
                        <Badge variant="outline" className="border-primary/50 text-primary">Onboarding Flow</Badge>
                        <h2 className="text-4xl font-black tracking-tight text-white">Your Path to Mastery</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className={`relative p-8 rounded-[2rem] border transition-all duration-500 ${activeStep === i ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10' : 'border-white/5 bg-white/[0.02]'}`}
                                onClick={() => setActiveStep(i)}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${activeStep === i ? 'bg-primary text-black' : 'bg-white/5 text-white'}`}>
                                    <step.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                    {step.description}
                                </p>
                                <div className="relative group/mini">
                                    <code className="text-[11px] block p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-primary break-all">
                                        {step.command}
                                    </code>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover/mini:opacity-100 transition-opacity"
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(step.command); }}
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                                {activeStep === i && (
                                    <motion.div layoutId="activeStep" className="absolute -bottom-1 left-8 right-8 h-1 bg-primary rounded-full" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Prerequisites & Env Setup */}
                <div className="grid lg:grid-cols-2 gap-8">
                    <motion.section variants={fadeInUp} className="p-1 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20">
                        <div className="h-full w-full bg-zinc-950 rounded-[2.4rem] p-8 md:p-12 space-y-8">
                            <div className="flex items-center gap-4">
                                <Settings className="w-8 h-8 text-primary" />
                                <h3 className="text-2xl font-bold text-white">Environment Config</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-tighter">
                                        <Server className="w-4 h-4 text-blue-400" /> Required Runtime
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Ensure you are running **Node.js 18.0.0** or higher. Check your version with:
                                    </p>
                                    <code className="block p-3 rounded-lg bg-black text-xs text-primary font-mono italic">
                                        node --version
                                    </code>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-tighter">
                                        <Key className="w-4 h-4 text-emerald-400" /> Mistral API Key
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        The CLI requires a valid Mistral API Key to function. Set it as an environment variable:
                                    </p>
                                    <div className="space-y-2">
                                        <Badge variant="secondary" className="text-[10px]">Windows (CMD)</Badge>
                                        <code className="block p-3 rounded-lg bg-black text-xs text-primary font-mono italic">
                                            set MISTRAL_API_KEY=your_key
                                        </code>
                                    </div>
                                    <div className="space-y-2">
                                        <Badge variant="secondary" className="text-[10px]">Linux / macOS / PowerShell</Badge>
                                        <code className="block p-3 rounded-lg bg-black text-xs text-primary font-mono italic">
                                            export MISTRAL_API_KEY=your_key
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section variants={fadeInUp} className="relative rounded-[2.5rem] border border-white/5 bg-zinc-950 p-8 md:p-12 overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px]" />
                        <div className="relative z-10 space-y-6 text-center lg:text-left">
                            <h3 className="text-3xl font-black text-white">POWERED BY <br /><span className="text-primary italic">MISTRAL LARGE</span></h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We utilize the industry-leading **Mistral-Large-Latest** model to provide
                                insane reasoning speeds and perfect tool execution. Your code analysis
                                happens in milliseconds, not seconds.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                    <div className="text-2xl font-black text-white italic">128k</div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Context Window</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                    <div className="text-2xl font-black text-white italic">90+</div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Reasoning Score</div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* Advanced Command Grid */}
                <motion.section variants={fadeInUp} className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white">Command Arsenal</h3>
                            <p className="text-sm text-muted-foreground">Every command is a specialized neural agent.</p>
                        </div>
                        <Button variant="ghost" className="text-primary hover:text-primary/80 gap-2" onClick={() => copyToClipboard('ganapathi-mentor --help')}>
                            Full Documentation <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                cmd: "mentor",
                                desc: "Senior Architect level design review and code explanation.",
                                icon: Search,
                                color: "text-blue-400",
                                bg: "bg-blue-400/10",
                                border: "border-blue-400/20"
                            },
                            {
                                cmd: "fix",
                                desc: "Diagnostic engine that finds bug root causes and repairs them.",
                                icon: HeartPulse,
                                color: "text-red-400",
                                bg: "bg-red-400/10",
                                border: "border-red-400/20"
                            },
                            {
                                cmd: "plan",
                                desc: "Implementation strategist that breaks features into task docs.",
                                icon: Zap,
                                color: "text-yellow-400",
                                bg: "bg-yellow-400/10",
                                border: "border-yellow-400/20"
                            },
                            {
                                cmd: "ops",
                                desc: "DevOps expert for CI/CD, Docker, and infrastructure scripts.",
                                icon: ShieldCheck,
                                color: "text-emerald-400",
                                bg: "bg-emerald-400/10",
                                border: "border-emerald-400/20"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02, rotate: 1 }}
                                className={`p-6 rounded-3xl border ${item.border} ${item.bg} backdrop-blur-sm space-y-4 group cursor-pointer`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color.replace('text', 'bg').replace('400', '500')}/20 transition-transform group-hover:scale-110`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-mono font-bold text-white flex items-center gap-2">
                                        {item.cmd} <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 uppercase">Mode</Badge>
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Footer Section */}
                <motion.div variants={fadeInUp} className="text-center pt-12 border-t border-white/5 space-y-6">
                    <div className="flex justify-center flex-wrap gap-8 opacity-40">
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default text-white font-mono font-black italic">MISTRAL.AI</div>
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default text-white font-mono font-black italic">NODE.JS</div>
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default text-white font-mono font-black italic">TYPESCRIPT</div>
                    </div>
                    <p className="text-muted-foreground text-xs font-mono tracking-widest uppercase">
                        Master your terminal. Master your code. v1.0.0 Global Release.
                    </p>
                </motion.div>
            </motion.div>
        </PageShell>
    );
}
