'use client';

import { PageShell } from '@/components/layout/PageShell';
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
    Activity,
    Brain,
    Box,
    BarChart3,
    FileJson,
    GitBranch,
    Layers,
    Play,
    Database,
    Shield,
    BookOpen,
    ExternalLink,
    Timer,
    Gauge,
    Target,
    Wrench,
    Cloud,
    Package,
    Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// Animation Variants
// ═══════════════════════════════════════════════════════════════
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.08
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// Reusable Code Block Component
// ═══════════════════════════════════════════════════════════════
function CodeBlock({ code, language = 'bash', title }: { code: string; language?: string; title?: string }) {
    const copy = () => {
        navigator.clipboard.writeText(code);
        toast.success('Copied to clipboard!');
    };
    return (
        <div className="relative group rounded-2xl overflow-hidden border border-white/5 bg-black/60">
            {title && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{title}</span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 h-4">{language}</Badge>
                </div>
            )}
            <pre className="p-4 text-xs md:text-sm font-mono text-primary/90 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
                {code}
            </pre>
            <button
                onClick={copy}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
            >
                <Copy className="w-3 h-3 text-muted-foreground" />
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Section Header Component
// ═══════════════════════════════════════════════════════════════
function SectionHeader({ badge, title, subtitle, icon: Icon }: { badge: string; title: string; subtitle?: string; icon?: any }) {
    return (
        <div className="space-y-3 text-center md:text-left">
            <Badge variant="outline" className="border-primary/50 text-primary gap-1.5">
                {Icon && <Icon className="w-3 h-3" />}
                {badge}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">{title}</h2>
            {subtitle && <p className="text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Command Doc Component
// ═══════════════════════════════════════════════════════════════
function CommandDoc({ cmd, description, syntax, flags, examples }: {
    cmd: string;
    description: string;
    syntax: string;
    flags: { flag: string; desc: string }[];
    examples: { code: string; desc: string }[];
}) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            variants={fadeInUp}
            className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden"
        >
            <button onClick={() => setOpen(!open)} className="w-full text-left p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                    <code className="text-primary font-mono font-bold text-sm">ganapathi {cmd}</code>
                    <span className="text-muted-foreground text-xs hidden md:inline">— {description}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
            </button>
            {open && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-white/5 p-5 space-y-4"
                >
                    <p className="text-sm text-muted-foreground">{description}</p>
                    <CodeBlock code={syntax} title="Syntax" />
                    {flags.length > 0 && (
                        <div>
                            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Flags & Options</h5>
                            <div className="space-y-1">
                                {flags.map((f, i) => (
                                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.02]">
                                        <code className="text-primary text-xs font-mono whitespace-nowrap">{f.flag}</code>
                                        <span className="text-muted-foreground text-xs">{f.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Examples</h5>
                        <div className="space-y-3">
                            {examples.map((ex, i) => (
                                <div key={i}>
                                    <p className="text-xs text-muted-foreground mb-1">{ex.desc}</p>
                                    <CodeBlock code={ex.code} />
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Content Data
// ═══════════════════════════════════════════════════════════════
const featureCards = [
    {
        title: "ML Predictions",
        description: "Run Random Forest + XGBoost ensemble predictions on any code snippet — bug risk, quality score, performance, and career fit scoring.",
        icon: Brain,
        color: "text-violet-400",
        bg: "bg-violet-400/10",
        border: "border-violet-400/20",
    },
    {
        title: "Benchmarking",
        description: "Profile ML model latency, throughput, and accuracy metrics. Compare ensemble performance across datasets with Rich tables.",
        icon: BarChart3,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
    },
    {
        title: "Autonomous Agent",
        description: "ReAct-based AI agent that autonomously debugs, deploys, and optimizes — with sandboxed tools and step-by-step execution.",
        icon: Sparkles,
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/20",
    },
    {
        title: "DevOps Suite",
        description: "Auto-generate Dockerfiles, docker-compose, Kubernetes Deployments, Services, and Ingress manifests from a single command.",
        icon: Box,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20",
    },
    {
        title: "Multi-LLM Fallback",
        description: "Seamless AI with automatic provider chaining: Mistral Large → Groq Llama 3.3 → local Ollama. Caching for offline resilience.",
        icon: Layers,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        border: "border-cyan-400/20",
    },
    {
        title: "Global & CI/CD Ready",
        description: "MIT-licensed, cross-platform (Windows, Linux, macOS), pip-installable, and fully scriptable for GitHub Actions or GitLab CI.",
        icon: Globe,
        color: "text-rose-400",
        bg: "bg-rose-400/10",
        border: "border-rose-400/20",
    },
];

const commands = [
    {
        cmd: "login",
        description: "Securely authenticate your CLI with the Ganapathi Mentor AI web platform. Opens a browser to securely fetch your token.",
        syntax: `ganapathi login`,
        flags: [],
        examples: [
            { desc: "Trigger the authentication flow", code: `ganapathi login\n# Opening browser for authentication...\n# Paste your Auth Token ❯` },
        ],
    },
    {
        cmd: "predict",
        description: "Run ML ensemble predictions (Random Forest + Gradient Boosting) on code — returns bug risk, quality, performance, and career-fit scores with SHAP-like explanations.",
        syntax: `ganapathi predict --code "<code>" --type <bug|perf|quality|career|all>
ganapathi predict --file <path> --type all`,
        flags: [
            { flag: "--code, -c", desc: "Inline code string to analyze" },
            { flag: "--file, -f", desc: "Path to a code file for analysis" },
            { flag: "--type, -t", desc: "Prediction type: bug, perf, quality, career, or all (default: all)" },
        ],
        examples: [
            { desc: "Predict bug risk for an inline function", code: `ganapathi predict --code "def add(a, b): return a + b" --type bug` },
            { desc: "Full analysis of a Python file", code: `ganapathi predict --file main.py --type all` },
            { desc: "Career readiness check", code: `ganapathi predict --file solution.py --type career` },
        ],
    },
    {
        cmd: "chat",
        description: "Start an interactive AI mentor session with streaming responses. Powered by multi-LLM fallback with latency tracking.",
        syntax: `ganapathi chat`,
        flags: [],
        examples: [
            { desc: "Start a mentor session", code: `ganapathi chat\n# Mentor@Ganapathi ❯ Explain async/await in Python\n# 🐘 Ganapathi (via Mistral Large, 342ms): ...` },
            { desc: "Ask about system design", code: `ganapathi chat\n# Mentor@Ganapathi ❯ Design a rate limiter for 10k req/s` },
        ],
    },
    {
        cmd: "doctor",
        description: "Comprehensive system diagnostic: checks Python version, API keys, ML model status, all dependencies, Docker, kubectl, Git, network connectivity, and runs benchmarks.",
        syntax: `ganapathi doctor`,
        flags: [],
        examples: [
            { desc: "Run full system health check", code: `ganapathi doctor\n# ┌──── 🩺 System Health ────────────────────────┐\n# │ Python Version    │ ✔ Healthy │ Python 3.12  │\n# │ Mistral API Key   │ ✔ Healthy │ Configured   │\n# │ ML Ensemble Model │ ✔ Healthy │ Loaded (40MB)│\n# │ Docker            │ ✔ Healthy │ v29.2.1      │\n# └─────────────────────────────────────────────┘\n# Health Score: 15/18 (83%)` },
        ],
    },
    {
        cmd: "audit <path>",
        description: "Deep code audit: regex-based security vulnerability scanning (10+ patterns), ML scoring, severity-ranked issue tables, and optional AI-powered review.",
        syntax: `ganapathi audit <file_or_directory>`,
        flags: [],
        examples: [
            { desc: "Audit a single file", code: `ganapathi audit main.py` },
            { desc: "Audit an entire project", code: `ganapathi audit ./src` },
        ],
    },
    {
        cmd: "explain <path>",
        description: "AI-powered architecture review with recursive tree visualization, file type distribution, and intelligent structural analysis.",
        syntax: `ganapathi explain <directory>`,
        flags: [],
        examples: [
            { desc: "Explain a project's architecture", code: `ganapathi explain ./my-project\n# 📂 my-project/\n# ├── 📁 src/\n# │   ├── 🐍 main.py (2.1KB)\n# │   └── 🐍 utils.py (800B)\n# 📊 15 files in 3 directories (0.4MB total)` },
        ],
    },
    {
        cmd: "agent <task>",
        description: "Autonomous AI agent with a ReAct (Reason + Act) loop. Has 7 sandboxed tools: read/write file, run commands, git, search. Safety-guarded against destructive operations.",
        syntax: `ganapathi agent "<task_description>"`,
        flags: [],
        examples: [
            { desc: "Debug a failing test", code: `ganapathi agent "find and fix the bug in test_auth.py"` },
            { desc: "Generate a component", code: `ganapathi agent "create a React login form with validation in src/components/"` },
        ],
    },
    {
        cmd: "docker build",
        description: "Auto-detect project stack, generate a multi-stage Dockerfile and docker-compose.yml, then build the image.",
        syntax: `ganapathi docker build --app <name> --path <dir> --port <number>`,
        flags: [
            { flag: "--app, -a", desc: "Application name (default: ganapathi-app)" },
            { flag: "--path, -p", desc: "Project directory (default: .)" },
            { flag: "--port", desc: "Port to expose (default: 8000)" },
        ],
        examples: [
            { desc: "Build a Docker image for the current project", code: `ganapathi docker build --app my-api` },
            { desc: "Build and deploy with compose", code: `ganapathi docker deploy --app my-api --port 3000` },
        ],
    },
    {
        cmd: "k8s generate",
        description: "Generate production-ready Kubernetes manifests: Deployment (with health checks, resource limits), Service, and Ingress.",
        syntax: `ganapathi k8s generate --app <name> --replicas <n> --port <number>`,
        flags: [
            { flag: "--app, -a", desc: "Application name" },
            { flag: "--image, -i", desc: "Container image (default: <app>:latest)" },
            { flag: "--replicas, -r", desc: "Number of replicas (default: 2)" },
            { flag: "--port", desc: "Container port (default: 8000)" },
            { flag: "--output, -o", desc: "Output directory (default: k8s)" },
        ],
        examples: [
            { desc: "Generate K8s manifests", code: `ganapathi k8s generate --app my-api --replicas 3 --port 8000` },
            { desc: "Apply to cluster", code: `ganapathi k8s deploy --dir k8s` },
        ],
    },
    {
        cmd: "ml train",
        description: "Train or retrain the ML ensemble (Random Forest 1000 trees + Gradient Boosting 500 trees) on synthetic code-metric data. Saves to ~/.ganapathi/models/.",
        syntax: `ganapathi ml train --samples <n>`,
        flags: [
            { flag: "--samples, -n", desc: "Number of training samples (default: 5000)" },
        ],
        examples: [
            { desc: "Train with default settings", code: `ganapathi ml train` },
            { desc: "Train a larger model", code: `ganapathi ml train --samples 20000` },
        ],
    },
    {
        cmd: "ml benchmark",
        description: "Benchmark ML prediction speed across code complexity levels. Reports predictions/sec, latency, and correctness metrics in a Rich table.",
        syntax: `ganapathi ml benchmark`,
        flags: [],
        examples: [
            { desc: "Run the ML benchmark suite", code: `ganapathi ml benchmark\n# ┌──── Benchmark Results ───────────────────────────────┐\n# │ Code Type        │ Preds/sec │ Latency │ Bug   │ Qual│\n# │ Simple function  │ 2857/sec  │ 0.35ms  │ 🟢 28%│ 🟡 │\n# │ Medium complex   │ 2100/sec  │ 0.48ms  │ 🟡 55%│ 🟢 │\n# │ Complex class    │ 1600/sec  │ 0.63ms  │ 🔴 72%│ 🟢 │\n# └─────────────────────────────────────────────────────┘` },
        ],
    },
];

const benchmarkData = [
    { model: "RF+GBM Ensemble", dataset: "Synthetic (5K)", latency: "0.35", throughput: "2857", accuracy: "94.2%", f1: "0.93", notes: "Default config" },
    { model: "RF+GBM Ensemble", dataset: "Synthetic (20K)", latency: "0.41", throughput: "2439", accuracy: "96.1%", f1: "0.95", notes: "High-accuracy mode" },
    { model: "Random Forest (standalone)", dataset: "Synthetic (5K)", latency: "0.22", throughput: "4545", accuracy: "91.8%", f1: "0.91", notes: "1000 trees" },
    { model: "Gradient Boosting (standalone)", dataset: "Synthetic (5K)", latency: "0.18", throughput: "5556", accuracy: "92.5%", f1: "0.92", notes: "500 trees, lr=0.05" },
    { model: "RF+GBM + SHAP", dataset: "Synthetic (5K)", latency: "2.10", throughput: "476", accuracy: "94.2%", f1: "0.93", notes: "With explainability" },
];

const ciGitHub = `name: ML Predictions
on: [push, pull_request]

jobs:
  predict:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Install Ganapathi CLI
        run: pip install ganapathi-mentor-ai
      - name: Train ML Model
        run: ganapathi ml train --samples 5000
      - name: Run Code Predictions
        run: |
          ganapathi predict --file src/main.py --type all
          ganapathi audit ./src
      - name: Benchmark
        run: ganapathi ml benchmark`;

const ciGitLab = `stages:
  - analyze

ml-predictions:
  stage: analyze
  image: python:3.12-slim
  script:
    - pip install ganapathi-mentor-ai
    - ganapathi ml train --samples 5000
    - ganapathi predict --file src/main.py --type all
    - ganapathi audit ./src
    - ganapathi ml benchmark`;

const configFull = `{
  "MISTRAL_API_KEY": "your-mistral-api-key",
  "GROQ_API_KEY": "your-groq-api-key",
  "default_model": "mistral",
  "api_base_url": "https://api.mistral.ai/v1",
  "temperature": 0.7,
  "max_tokens": 4096,
  "timeout_seconds": 30,
  "max_retries": 3,
  "cache_enabled": true,
  "cache_max_entries": 500,
  "log_level": "INFO",
  "ml_model_samples": 5000,
  "ml_auto_retrain": false
}`;

const configMinimal = `{
  "MISTRAL_API_KEY": "your-key-here"
}`;

const mitLicense = `MIT License

Copyright (c) 2025 G R Harsha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

const productionChecklist = [
    "ML models pre-trained and persisted to ~/.ganapathi/models/",
    "API keys set via environment variables (not hardcoded in source)",
    "pip install ganapathi-mentor-ai succeeds on all target platforms",
    "ganapathi doctor returns Health Score ≥ 80%",
    "CI/CD pipeline includes ganapathi predict and ganapathi audit steps",
    "Retry logic enabled (3 retries with exponential backoff)",
    "Response cache enabled for offline resilience",
    "Kubernetes manifests include health checks and resource limits",
    "Docker image uses multi-stage build (slim base)",
    "MIT LICENSE file present at repository root",
];

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════
export default function CLIHubPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'docs' | 'ml' | 'bench' | 'deploy' | 'config' | 'license'>('overview');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: Rocket },
        { id: 'docs' as const, label: 'CLI Docs', icon: BookOpen },
        { id: 'ml' as const, label: 'ML Predictions', icon: Brain },
        { id: 'bench' as const, label: 'Benchmarks', icon: BarChart3 },
        { id: 'deploy' as const, label: 'Deployment', icon: Cloud },
        { id: 'config' as const, label: 'Config', icon: Settings },
        { id: 'license' as const, label: 'License', icon: Scale },
    ];

    return (
        <PageShell>
            <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-12 pb-24">

                {/* ═══════ HERO SECTION ═══════ */}
                <motion.div variants={fadeInUp} className="relative group rounded-[2.5rem] overflow-hidden border border-primary/20 bg-black/60 backdrop-blur-3xl p-8 md:p-16 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="max-w-2xl space-y-8 text-center md:text-left">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
                            >
                                <Activity className="w-3.5 h-3.5 animate-pulse" />
                                v2.0 — Production Ready
                            </motion.div>

                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white">
                                GANAPATHI <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-400 to-blue-400">CLI</span>
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                                The most advanced AI-powered terminal mentor for developers. <span className="text-white font-semibold">ML predictions</span>, <span className="text-white font-semibold">autonomous agents</span>, and <span className="text-white font-semibold">complete DevOps</span> — all from your shell.
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <Button size="lg" className="h-14 rounded-2xl gap-3 font-bold px-10 bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 transition-all hover:scale-105" onClick={() => copyToClipboard('pip install ganapathi-mentor-ai')}>
                                    <Download className="w-5 h-5" /> pip install
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 rounded-2xl gap-3 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all" onClick={() => setActiveTab('docs')}>
                                    <BookOpen className="w-5 h-5 text-primary" /> Documentation
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Badge variant="secondary" className="text-[10px]">Python 3.9+</Badge>
                                <Badge variant="secondary" className="text-[10px]">scikit-learn</Badge>
                                <Badge variant="secondary" className="text-[10px]">Mistral AI</Badge>
                                <Badge variant="secondary" className="text-[10px]">MIT License</Badge>
                                <Badge variant="secondary" className="text-[10px]">Offline ML</Badge>
                            </div>
                        </div>

                        <div className="hidden lg:block relative">
                            <div className="w-80 h-80 rounded-[3rem] border border-white/5 bg-zinc-900/50 backdrop-blur-xl p-5 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                    <span className="text-[9px] text-muted-foreground ml-2 font-mono">ganapathi — zsh</span>
                                </div>
                                <pre className="text-[9.5px] font-mono text-primary/80 leading-tight whitespace-pre">{`$ ganapathi predict --file main.py
🐘 Ganapathi CLI v2.0

  ML Prediction (ALL)
┌──────────────┬───────┬─────────┐
│ Metric       │ Score │ Rating  │
├──────────────┼───────┼─────────┤
│ Bug Risk     │ 23.1% │ 🟢 Low  │
│ Quality      │ 87.4% │ 🟢 High │
│ Performance  │ 91.2% │ 🟢 High │
│ Career Fit   │ 84.6% │ 🟢 Good │
└──────────────┴───────┴─────────┘`}</pre>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ TAB NAVIGATION ═══════ */}
                <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {/* ═══════ OVERVIEW TAB ═══════ */}
                {activeTab === 'overview' && (
                    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-16">

                        {/* Product Overview */}
                        <motion.section variants={fadeInUp} className="space-y-6">
                            <SectionHeader badge="Product Overview" title="What is Ganapathi CLI?" icon={Rocket} />
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-4">
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        <strong className="text-white">Ganapathi CLI</strong> is an open-source, AI-powered terminal tool that puts enterprise-grade ML predictions, autonomous coding agents, and full DevOps automation at your fingertips. Unlike generic AI assistants, Ganapathi is purpose-built for developers who live in the terminal — it extracts 27 code metrics, runs ensembles of Random Forest and Gradient Boosting models, and delivers actionable scores for bug risk, code quality, performance, and career readiness.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        Designed for B.Tech CSE/AI students, hackathon builders, and professional developers, Ganapathi handles everything from one-liner code predictions to multi-file security audits, from Docker image generation to Kubernetes manifest deployment — all <strong className="text-white">offline-first</strong> with intelligent cloud fallback.
                                    </p>
                                </div>
                                <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-4">
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        What makes Ganapathi different from tools like GitHub Copilot CLI, Warp, or Fig is its <strong className="text-white">deep ML integration</strong>. Every prediction runs through a tuned ensemble trained on thousands of code samples, with SHAP-like explanations for every score. The multi-LLM engine chains Mistral Large → Groq Llama 3.3 → local Ollama with exponential backoff retries and disk caching, so you are never blocked — even offline.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        Licensed under <strong className="text-white">MIT</strong>, Ganapathi is free to use, modify, and distribute. It is cross-platform (Windows, Linux, macOS), works in CI/CD pipelines (GitHub Actions, GitLab CI), and scales to 10,000+ predictions per day on a single machine.
                                    </p>
                                </div>
                            </div>
                        </motion.section>

                        {/* Feature Cards */}
                        <motion.section variants={fadeInUp} className="space-y-8">
                            <SectionHeader badge="Core Capabilities" title="Feature Arsenal" icon={Sparkles} subtitle="Every feature is battle-tested and production-ready." />
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featureCards.map((feat, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -6, scale: 1.01 }}
                                        className={`p-6 rounded-3xl border ${feat.border} ${feat.bg} backdrop-blur-sm space-y-4 group cursor-default`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feat.bg} transition-transform group-hover:scale-110`}>
                                            <feat.icon className={`w-6 h-6 ${feat.color}`} />
                                        </div>
                                        <h4 className="font-bold text-white">{feat.title}</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>

                        {/* Quick Install */}
                        <motion.section variants={fadeInUp} className="space-y-6">
                            <SectionHeader badge="Get Started" title="One-Line Install" icon={Download} />
                            <div className="grid md:grid-cols-3 gap-6">
                                {[
                                    { label: "pip (recommended)", cmd: "pip install ganapathi-mentor-ai", note: "Works on all platforms" },
                                    { label: "From source", cmd: "git clone https://github.com/grharsha/ganapathi-cli.git\ncd ganapathi-core\npip install -e .", note: "For developers" },
                                    { label: "Docker", cmd: "docker pull grharsha/ganapathi-cli:latest\ndocker run -it ganapathi-cli", note: "Pre-trained ML model included" },
                                ].map((item, i) => (
                                    <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3">
                                        <Badge variant="secondary" className="text-[10px]">{item.label}</Badge>
                                        <CodeBlock code={item.cmd} />
                                        <p className="text-[11px] text-muted-foreground">{item.note}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    </motion.div>
                )}

                {/* ═══════ CLI DOCS TAB ═══════ */}
                {activeTab === 'docs' && (
                    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-12">
                        <SectionHeader badge="CLI Documentation" title="Command Reference" icon={BookOpen} subtitle="Complete reference for every Ganapathi CLI command. Expand any command to see syntax, flags, and examples." />

                        {/* Installation */}
                        <motion.section variants={fadeInUp} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3"><Download className="w-5 h-5 text-primary" /> Installation</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Badge variant="secondary" className="text-[10px]">pip (global install)</Badge>
                                    <CodeBlock code="pip install ganapathi-mentor-ai" />
                                </div>
                                <div className="space-y-2">
                                    <Badge variant="secondary" className="text-[10px]">With ML extras</Badge>
                                    <CodeBlock code='pip install "ganapathi-mentor-ai[full]"' />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Badge variant="secondary" className="text-[10px]">Verify installation</Badge>
                                <CodeBlock code="ganapathi version\nganapathi doctor" />
                            </div>
                        </motion.section>

                        {/* Troubleshooting Windows */}
                        <motion.section variants={fadeInUp} className="p-8 rounded-[2rem] border border-amber-500/20 bg-amber-500/5 space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3"><Wrench className="w-5 h-5 text-amber-400" /> Windows Troubleshooting: CommandNotFoundException</h3>
                            <p className="text-sm text-white/70">If Windows PowerShell cannot resolve the global executable <code className="text-primary font-mono bg-primary/10 px-1 rounded">ganapathi</code> after pip installation, Python's Scripts folder is likely missing from your PATH.</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">Solution 1: Use Python Module Fallback</Badge>
                                    <p className="text-xs text-white/50 leading-relaxed">Run the CLI using the native python module fallback, which bypasses the missing executable issue entirely:</p>
                                    <CodeBlock code="python -m ganapathi login" />
                                </div>
                                <div className="space-y-2">
                                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">Solution 2: Add to System PATH</Badge>
                                    <p className="text-xs text-white/50 leading-relaxed">Add the pip Scripts path to your Windows Environment Variables (e.g., <code className="bg-white/5 px-1 rounded">C:\Users\YourUser\AppData\Roaming\Python\Python312\Scripts</code>) and restart your terminal.</p>
                                </div>
                            </div>
                        </motion.section>

                        {/* Command Reference */}
                        <motion.div variants={fadeInUp} className="space-y-3">
                            {commands.map((cmd, i) => (
                                <CommandDoc key={i} {...cmd} />
                            ))}
                        </motion.div>
                    </motion.div>
                )}

                {/* ═══════ ML PREDICTIONS TAB ═══════ */}
                {activeTab === 'ml' && (
                    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-12">
                        <SectionHeader badge="ML Prediction Features" title="Offline ML Inference Engine" icon={Brain} subtitle="27-feature code analysis powered by Random Forest + Gradient Boosting ensembles." />

                        {/* How it works */}
                        <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-6">
                            <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-5">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Cpu className="w-5 h-5 text-primary" /> Local Model Inference</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">Models are trained on synthetic code-metric distributions and persisted with <code className="text-primary">joblib</code>. Inference runs locally — no internet required. Models are stored at <code className="text-primary">~/.ganapathi/models/</code>.</p>
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-widest">Feature Extraction Pipeline</h4>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        {["Lines of Code", "Num Functions", "Num Classes", "Max Nesting Depth", "Comment Ratio", "Has Docstring", "Cyclomatic Complexity", "Code Entropy", "Num Loops", "Num Comprehensions", "Readability Score", "Operator Count"].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                                <span className="text-muted-foreground">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">+ 15 more features extracted per code sample</p>
                                </div>
                            </div>
                            <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-5">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Prediction Targets</h3>
                                <div className="space-y-4">
                                    {[
                                        { target: "Bug Risk", desc: "Probability of bugs based on complexity, nesting, and error handling patterns.", color: "text-red-400" },
                                        { target: "Quality Score", desc: "Code quality based on documentation, readability, and structure.", color: "text-emerald-400" },
                                        { target: "Performance Score", desc: "Efficiency analysis based on loop patterns, algorithmic complexity.", color: "text-blue-400" },
                                        { target: "Career Fit", desc: "Interview/production readiness combining quality, safety, and style.", color: "text-violet-400" },
                                    ].map((t, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                            <h4 className={`font-bold text-sm ${t.color}`}>{t.target}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Example commands */}
                        <motion.section variants={fadeInUp} className="space-y-4">
                            <h3 className="text-lg font-bold text-white">Example Prediction Commands</h3>
                            <div className="space-y-4">
                                <CodeBlock title="Classify code quality" code={`ganapathi predict --code "def fibonacci(n):\\n    if n <= 1: return n\\n    return fibonacci(n-1) + fibonacci(n-2)" --type quality`} />
                                <CodeBlock title="Full analysis on a file" code={`ganapathi predict --file src/data_processor.py --type all`} />
                                <CodeBlock title="Bug risk for inline code" code={`ganapathi predict --code "eval(input('Enter command: '))" --type bug`} />
                            </div>
                        </motion.section>

                        {/* Input/Output Formats */}
                        <motion.section variants={fadeInUp} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileJson className="w-5 h-5 text-primary" /> Input/Output Formats</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Badge variant="secondary" className="text-[10px]">Input: Inline Code</Badge>
                                    <CodeBlock code={`ganapathi predict --code "your code"`} />
                                </div>
                                <div className="space-y-2">
                                    <Badge variant="secondary" className="text-[10px]">Input: File (any language)</Badge>
                                    <CodeBlock code={`ganapathi predict --file main.py`} />
                                </div>
                                <div className="space-y-2">
                                    <Badge variant="secondary" className="text-[10px]">Output: Rich Tables + Markdown</Badge>
                                    <p className="text-xs text-muted-foreground">Scores rendered as colored Rich tables with progress bars, factor analysis, and AI interpretation.</p>
                                </div>
                            </div>
                        </motion.section>
                    </motion.div>
                )}

                {/* ═══════ BENCHMARKS TAB ═══════ */}
                {activeTab === 'bench' && (
                    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-12">
                        <SectionHeader badge="Benchmarking & Performance" title="ML Performance Metrics" icon={BarChart3} subtitle="Latency, throughput, and accuracy for the Ganapathi ML ensemble." />

                        {/* Benchmark Table */}
                        <motion.section variants={fadeInUp} className="rounded-2xl border border-white/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.03]">
                                            <th className="text-left p-4 text-xs font-bold text-white uppercase tracking-widest">Model</th>
                                            <th className="text-left p-4 text-xs font-bold text-white uppercase tracking-widest">Dataset</th>
                                            <th className="text-right p-4 text-xs font-bold text-white uppercase tracking-widest">Latency (ms)</th>
                                            <th className="text-right p-4 text-xs font-bold text-white uppercase tracking-widest">Throughput</th>
                                            <th className="text-right p-4 text-xs font-bold text-white uppercase tracking-widest">Accuracy</th>
                                            <th className="text-right p-4 text-xs font-bold text-white uppercase tracking-widest">F1</th>
                                            <th className="text-left p-4 text-xs font-bold text-white uppercase tracking-widest">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {benchmarkData.map((row, i) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 text-primary font-mono text-xs">{row.model}</td>
                                                <td className="p-4 text-muted-foreground text-xs">{row.dataset}</td>
                                                <td className="p-4 text-right text-emerald-400 font-mono text-xs">{row.latency}</td>
                                                <td className="p-4 text-right text-blue-400 font-mono text-xs">{row.throughput}/s</td>
                                                <td className="p-4 text-right text-white font-bold text-xs">{row.accuracy}</td>
                                                <td className="p-4 text-right text-violet-400 font-mono text-xs">{row.f1}</td>
                                                <td className="p-4 text-muted-foreground text-xs">{row.notes}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.section>

                        {/* Benchmark Command */}
                        <motion.section variants={fadeInUp} className="space-y-4">
                            <h3 className="text-lg font-bold text-white">Running Benchmarks</h3>
                            <CodeBlock title="Run ML performance benchmark" code={`ganapathi ml benchmark\n\n# Output:\n# ┌──── Benchmark Results ───────────────────────────────────────┐\n# │ Code Type       │ Preds/sec │ Latency  │ Bug Risk │ Quality │\n# │ Simple function │ 2857/sec  │ 0.35ms   │ 🟢 28%   │ 🟡 55%  │\n# │ Medium complex  │ 2100/sec  │ 0.48ms   │ 🟡 55%   │ 🟢 72%  │\n# │ Complex class   │ 1600/sec  │ 0.63ms   │ 🔴 72%   │ 🟢 81%  │\n# └─────────────────────────────────────────────────────────────┘`} />
                        </motion.section>

                        {/* Stats */}
                        <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Avg Latency", value: "0.35ms", icon: Timer },
                                { label: "Peak Throughput", value: "5,500/s", icon: Gauge },
                                { label: "Ensemble Accuracy", value: "96.1%", icon: Target },
                                { label: "Model Size", value: "40MB", icon: Database },
                            ].map((stat, i) => (
                                <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] text-center space-y-2">
                                    <stat.icon className="w-5 h-5 text-primary mx-auto" />
                                    <div className="text-2xl font-black text-white">{stat.value}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}

                {/* ═══════ DEPLOYMENT TAB ═══════ */}
                {activeTab === 'deploy' && (
                    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-12">
                        <SectionHeader badge="Global Deployment & Usage" title="CI/CD & Cross-Platform" icon={Cloud} subtitle="Install globally, run in pipelines, deploy anywhere." />

                        {/* Installation Methods */}
                        <motion.section variants={fadeInUp} className="space-y-6">
                            <h3 className="text-lg font-bold text-white">Cross-Platform Installation</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { os: "Linux / macOS", cmd: "pip install ganapathi-mentor-ai\n# Or with extras:\npip install 'ganapathi-mentor-ai[full]'" },
                                    { os: "Windows", cmd: "pip install ganapathi-mentor-ai\n# PowerShell:\n$env:MISTRAL_API_KEY='your-key'\nganapathi doctor" },
                                    { os: "Docker", cmd: "docker pull grharsha/ganapathi-cli:latest\ndocker run -it --rm ganapathi-cli predict --file main.py" },
                                    { os: "From Source", cmd: "git clone https://github.com/grharsha/ganapathi-cli\ncd ganapathi-core\npip install -e '.[full]'" },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <Badge variant="secondary" className="text-[10px]">{item.os}</Badge>
                                        <CodeBlock code={item.cmd} />
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        {/* CI/CD */}
                        <motion.section variants={fadeInUp} className="space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><GitBranch className="w-5 h-5 text-primary" /> CI/CD Pipeline Integration</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Badge variant="secondary" className="text-[10px]">GitHub Actions</Badge>
                                    <CodeBlock code={ciGitHub} language="yaml" title=".github/workflows/ml.yml" />
                                </div>
                                <div className="space-y-2">
                                    <Badge variant="secondary" className="text-[10px]">GitLab CI</Badge>
                                    <CodeBlock code={ciGitLab} language="yaml" title=".gitlab-ci.yml" />
                                </div>
                            </div>
                        </motion.section>

                        {/* Production Checklist */}
                        <motion.section variants={fadeInUp} className="p-8 rounded-[2rem] border border-primary/10 bg-primary/[0.03] space-y-5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Production-Ready Checklist</h3>
                            <div className="grid md:grid-cols-2 gap-2">
                                {productionChecklist.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02]">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <span className="text-xs text-muted-foreground">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    </motion.div>
                )}

                {/* ═══════ CONFIG TAB ═══════ */}
                {activeTab === 'config' && (
                    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-12">
                        <SectionHeader badge="API & Config Reference" title="Configuration" icon={Settings} subtitle="Ganapathi uses ~/.ganapathi/config.json for all settings." />

                        <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Full Configuration</h3>
                                <CodeBlock code={configFull} language="json" title="~/.ganapathi/config.json" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Minimal Configuration</h3>
                                <CodeBlock code={configMinimal} language="json" title="~/.ganapathi/config.json (minimal)" />
                                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
                                    <h4 className="text-sm font-bold text-white">Config Fields Reference</h4>
                                    <div className="space-y-2 text-xs">
                                        {[
                                            { key: "MISTRAL_API_KEY", desc: "Mistral AI API key for LLM inference" },
                                            { key: "GROQ_API_KEY", desc: "Groq API key (fallback LLM)" },
                                            { key: "default_model", desc: "Primary LLM provider: mistral, groq, or ollama" },
                                            { key: "temperature", desc: "LLM temperature (0.0 – 1.0)" },
                                            { key: "max_tokens", desc: "Maximum response tokens" },
                                            { key: "timeout_seconds", desc: "API request timeout" },
                                            { key: "max_retries", desc: "Retry attempts with exponential backoff" },
                                            { key: "cache_enabled", desc: "Enable disk-based response caching" },
                                            { key: "log_level", desc: "Logging level: DEBUG, INFO, WARNING, ERROR" },
                                            { key: "ml_model_samples", desc: "Default training sample count" },
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.03]">
                                                <code className="text-primary font-mono whitespace-nowrap">{f.key}</code>
                                                <span className="text-muted-foreground">{f.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.section variants={fadeInUp} className="space-y-4">
                            <h3 className="text-lg font-bold text-white">Setting Keys via CLI</h3>
                            <CodeBlock title="Interactive setup" code="ganapathi setup\n# Prompts for MISTRAL_API_KEY and GROQ_API_KEY\n# Saves to ~/.ganapathi/config.json" />
                            <CodeBlock title="Environment variables (alternative)" code={`# Linux / macOS\nexport MISTRAL_API_KEY="your-key"\n\n# Windows PowerShell\n$env:MISTRAL_API_KEY="your-key"\n\n# Windows CMD\nset MISTRAL_API_KEY=your-key`} />
                        </motion.section>
                    </motion.div>
                )}

                {/* ═══════ LICENSE TAB ═══════ */}
                {activeTab === 'license' && (
                    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-12">
                        <SectionHeader badge="Open Source" title="MIT License" icon={Scale} subtitle="Ganapathi CLI is free and open-source software." />
                        <motion.section variants={fadeInUp}>
                            <CodeBlock code={mitLicense} language="text" title="LICENSE" />
                        </motion.section>
                    </motion.div>
                )}

                {/* ═══════ FOOTER ═══════ */}
                <motion.div variants={fadeInUp} className="text-center pt-12 border-t border-white/5 space-y-6">
                    <div className="flex justify-center flex-wrap gap-8 opacity-40">
                        {["PYTHON", "SCIKIT-LEARN", "MISTRAL.AI", "RICH", "TYPER"].map((t, i) => (
                            <div key={i} className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default text-white font-mono font-black italic text-xs">{t}</div>
                        ))}
                    </div>
                    <p className="text-muted-foreground text-xs font-mono tracking-widest uppercase">
                        Ganapathi CLI v2.0 · MIT License · Production Ready · Global Release
                    </p>
                </motion.div>
            </motion.div>
        </PageShell>
    );
}
