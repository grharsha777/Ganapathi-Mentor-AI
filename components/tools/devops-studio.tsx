"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    Server,
    Terminal,
    ShieldAlert,
    ShieldCheck,
    Zap,
    Activity,
    Code2,
    Cpu,
    RefreshCw,
    Copy,
    CheckCircle2,
    AlertTriangle,
    Info
} from "lucide-react";

interface DevOpsAnalysis {
    securityScore: number;
    issues: {
        id: string;
        severity: "critical" | "warning" | "info";
        category: string;
        title: string;
        description: string;
        recommendation: string;
        lineRef?: string;
    }[];
    optimizations: string[];
    fixedCode: string;
    explanation: string;
}

const DEFAULT_DOCKERFILE = `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD [\"node\", \"app.js\"]`;

const DEFAULT_KUBERNETES = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        ports:
        - containerPort: 8080`;

export default function DevOpsStudio() {
    const [code, setCode] = useState(DEFAULT_DOCKERFILE);
    const [language, setLanguage] = useState<"dockerfile" | "yaml">("dockerfile");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<DevOpsAnalysis | null>(null);
    const [activeTab, setActiveTab] = useState<"audit" | "fix">("audit");
    const [copied, setCopied] = useState(false);

    const handleLanguageChange = (val: "dockerfile" | "yaml") => {
        setLanguage(val);
        setCode(val === "dockerfile" ? DEFAULT_DOCKERFILE : DEFAULT_KUBERNETES);
        setAnalysis(null);
    };

    const handleAnalyze = async () => {
        if (!code.trim()) {
            toast.error("Please enter some configuration code to analyze");
            return;
        }

        setIsAnalyzing(true);
        setAnalysis(null);
        setActiveTab("audit");

        try {
            const res = await fetch("/api/devops/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, type: language === "dockerfile" ? "docker" : "kubernetes" }),
            });

            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");

            setAnalysis(data.analysis);
            toast.success("Analysis complete!");
        } catch (err: any) {
            toast.error(err.message || "Failed to analyze configuration");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyFixedCode = () => {
        if (!analysis?.fixedCode) return;
        navigator.clipboard.writeText(analysis.fixedCode);
        setCopied(true);
        toast.success("Fixed code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case "critical": return "text-red-500 bg-red-500/10 border-red-500/20";
            case "warning": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case "info": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            default: return "text-gray-500 bg-gray-500/10";
        }
    };

    const getSeverityIcon = (sev: string) => {
        switch (sev) {
            case "critical": return <ShieldAlert className="w-5 h-5 text-red-500" />;
            case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case "info": return <Info className="w-5 h-5 text-blue-500" />;
            default: return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-12rem)] w-full">
            {/* Left Pane - Editor */}
            <Card className="w-full xl:w-1/2 flex flex-col glass border-0 shadow-2xl overflow-hidden rounded-2xl">
                <div className="flex items-center justify-between p-4 bg-black/40 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-semibold text-white tracking-wide">Config Pipeline</h3>
                    </div>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => handleLanguageChange("dockerfile")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === "dockerfile" ? "bg-cyan-500/20 text-cyan-400 shadow-sm" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Docker
                        </button>
                        <button
                            onClick={() => handleLanguageChange("yaml")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === "yaml" ? "bg-emerald-500/20 text-emerald-400 shadow-sm" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Kubernetes
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(val) => setCode(val || "")}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "var(--font-mono)",
                            lineHeight: 24,
                            padding: { top: 20, bottom: 20 },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            cursorSmoothCaretAnimation: "on",
                            formatOnPaste: true,
                        }}
                        className="absolute inset-0"
                    />
                </div>

                <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end">
                    <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !code.trim()}
                        className={`h-12 px-8 rounded-xl font-bold shadow-lg transition-all ${isAnalyzing
                            ? "bg-disabled cursor-not-allowed"
                            : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] shadow-cyan-500/25"
                            }`}
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin" /> Analyzing Infrastructure...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Zap className="w-5 h-5" /> Run AI Audit
                            </span>
                        )}
                    </Button>
                </div>
            </Card>

            {/* Right Pane - Analysis HUD */}
            <Card className="w-full xl:w-1/2 flex flex-col glass border-0 shadow-2xl overflow-hidden rounded-2xl relative">
                <div className="p-6 bg-black/40 border-b border-white/5 relative overflow-hidden">
                    {/* Abstract Header Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                <Activity className="w-6 h-6 text-emerald-400" />
                                Audit Results
                            </h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                                AI-powered security, performance, and best-practice analysis.
                            </p>
                        </div>

                        {analysis && (
                            <div className="flex flex-col items-end">
                                <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Security Score</div>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-black ${analysis.securityScore >= 90 ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' :
                                        analysis.securityScore >= 70 ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' :
                                            'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]'
                                        }`}>
                                        {analysis.securityScore}
                                    </span>
                                    <span className="text-muted-foreground text-sm font-medium">/ 100</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col relative z-20 bg-background/50">
                    {!analysis && !isAnalyzing && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <div className="w-24 h-24 mb-6 rounded-3xl bg-white/5 flex items-center justify-center shadow-inner border border-white/10">
                                <ShieldCheck className="w-12 h-12 text-white/20" />
                            </div>
                            <p className="text-xl font-medium text-white/80">Awaiting Configuration</p>
                            <p className="mt-2 max-w-sm text-balance">
                                Paste your Dockerfile or Kubernetes YAML into the editor and click &quot;Run AI Audit&quot; to start the inspector.
                            </p>
                        </div>
                    )}

                    {isAnalyzing && (
                        <div className="flex-1 p-6 space-y-6">
                            <Skeleton className="h-8 w-1/3 bg-white/5" />
                            <div className="space-y-3">
                                <Skeleton className="h-24 w-full bg-white/5 rounded-xl" />
                                <Skeleton className="h-24 w-full bg-white/5 rounded-xl" />
                                <Skeleton className="h-24 w-full bg-white/5 rounded-xl" />
                            </div>
                        </div>
                    )}

                    {analysis && !isAnalyzing && (
                        <Tabs defaultValue={activeTab} onValueChange={(v: string) => setActiveTab(v as any)} className="w-full h-full flex flex-col">
                            <div className="px-6 pt-4">
                                <TabsList className="w-full grid grid-cols-2 bg-black/40 border border-white/10 p-1 rounded-xl">
                                    <TabsTrigger value="audit" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:shadow-lg py-2.5 transition-all">
                                        <ShieldAlert className="w-4 h-4 mr-2" /> Issues List
                                    </TabsTrigger>
                                    <TabsTrigger value="fix" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 py-2.5 transition-all">
                                        <Code2 className="w-4 h-4 mr-2" /> Fixed Code
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                <AnimatePresence mode="wait">
                                    <TabsContent value="audit" key="audit" forceMount className="m-0 space-y-6 data-[state=inactive]:hidden">
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                            {/* Explainer */}
                                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
                                                <div className="flex items-start gap-3">
                                                    <Cpu className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-semibold text-blue-100 flex items-center gap-2">
                                                            Architect&apos;s Summary
                                                        </h4>
                                                        <p className="text-sm text-blue-200/80 mt-1 leading-relaxed">
                                                            {analysis.explanation}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Issues */}
                                            <h4 className="font-semibold text-white/90 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                                Detected Vulnerabilities
                                                <Badge className="bg-white/10 text-white/70 hover:bg-white/20">{analysis.issues.length}</Badge>
                                            </h4>

                                            {analysis.issues.length === 0 ? (
                                                <div className="p-6 text-center border border-emerald-500/20 bg-emerald-500/5 rounded-xl">
                                                    <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                                                    <p className="text-emerald-300 font-medium">No major issues found! Outstanding configuration.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {analysis.issues.map((issue, i) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            key={issue.id}
                                                            className="group p-4 rounded-xl bg-black/40 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="shrink-0 mt-1 bg-background p-1.5 rounded-lg shadow-sm">
                                                                    {getSeverityIcon(issue.severity)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                                        <h5 className="font-bold text-white truncate text-base">{issue.title}</h5>
                                                                        <Badge variant="outline" className={`uppercase text-[10px] tracking-wider px-2 py-0.5 ${getSeverityColor(issue.severity)}"}`}>
                                                                            {issue.severity}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                                                        {issue.description}
                                                                    </p>

                                                                    <div className="bg-background rounded-lg p-3 border border-border/50">
                                                                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Recommendation
                                                                        </div>
                                                                        <p className="text-sm text-emerald-100/70">{issue.recommendation}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    </TabsContent>

                                    <TabsContent value="fix" key="fix" forceMount className="m-0 h-full flex flex-col data-[state=inactive]:hidden">
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full flex flex-col">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-sm text-muted-foreground">This is the <strong className="text-emerald-400">optimized and secured</strong> version generated by the AI.</p>
                                                <Button
                                                    onClick={copyFixedCode}
                                                    variant="secondary"
                                                    size="sm"
                                                    className={`transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : ''}`}
                                                >
                                                    {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                                    {copied ? "Copied!" : "Copy Fix"}
                                                </Button>
                                            </div>
                                            <div className="flex-1 rounded-xl overflow-hidden border border-emerald-500/20 relative shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[50px] rounded-full mix-blend-screen pointer-events-none z-10" />
                                                <Editor
                                                    height="100%"
                                                    language={language}
                                                    theme="vs-dark"
                                                    value={analysis.fixedCode}
                                                    options={{
                                                        minimap: { enabled: false },
                                                        readOnly: true,
                                                        fontSize: 13,
                                                        fontFamily: "var(--font-mono)",
                                                        lineHeight: 22,
                                                        padding: { top: 16, bottom: 16 },
                                                        scrollBeyondLastLine: false,
                                                    }}
                                                />
                                            </div>
                                        </motion.div>
                                    </TabsContent>
                                </AnimatePresence>
                            </div>
                        </Tabs>
                    )}
                </div>
            </Card>
        </div>
    );
}