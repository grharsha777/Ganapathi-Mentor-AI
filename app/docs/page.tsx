import { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ErrorBoundary } from '@/components/landing/ErrorBoundary';
import { Terminal, Settings, Wrench, GitPullRequest, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CLI Documentation | Ganapathi Mentor AI',
  description: 'Enterprise documentation for the Ganapathi Mentor AI Command Line Interface.',
};

export default function CliDocsPage() {
  return (
    <main
      className="min-h-screen overflow-x-hidden flex flex-col bg-[#050505] text-white"
    >
      <Navbar />

      <section className="flex-grow pt-32 pb-24 px-6 md:px-10 lg:px-16 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-16 border-b border-white/[0.05] pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <Terminal className="w-4 h-4" />
            <span>Developer Tooling</span>
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black uppercase tracking-[-0.03em] mb-4 text-white">
            Enterprise CLI <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Reference</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
            Integrate Ganapathi Mentor AI directly into your local terminal workflow. 
            Designed for high-performance engineering teams, the CLI offers real-time architectural guidance, automated remediation, and infrastructure planning without leaving your IDE.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* 1. Installation */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-cyan-400 font-mono text-sm">01.</span> Global Installation
              </h2>
              <p className="text-slate-400 leading-relaxed">
                The CLI is distributed securely via PyPI. For enterprise environments with strict package management policies, ensure your internal artifact repository proxies the public registry.
              </p>
              <div className="bg-[#0F172A]/40 border border-white/[0.05] rounded-xl p-6 backdrop-blur-xl font-mono text-sm text-cyan-300">
                pip install ganapathi-mentor-ai
              </div>
              <div className="flex items-start gap-3 mt-4 text-sm text-slate-500">
                <Settings className="w-5 h-5 text-slate-400 shrink-0" />
                <p>
                  <strong className="text-slate-300">Prerequisites:</strong> Node.js 18.0 or higher is strictly required for optimal V8 engine performance. A valid Mistral API key must be provisioned in your environment variables.
                </p>
              </div>
            </div>

            {/* 2. Core Invocation */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-cyan-400 font-mono text-sm">02.</span> Standard Invocation
              </h2>
              <p className="text-slate-400 leading-relaxed">
                By default, invoking the CLI evaluates your current workspace context. The agent parses your repository architecture and dependencies to deliver context-aware mentorship.
              </p>
              <div className="bg-[#0F172A]/40 border border-white/[0.05] rounded-xl p-6 backdrop-blur-xl font-mono text-sm text-cyan-300">
                ganapathi "Explain the architecture of this project"
              </div>
            </div>

            {/* 3. Operational Modes */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-cyan-400 font-mono text-sm">03.</span> Specialized Operational Modes
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                The CLI engine features specialized sub-agents trained on distinct engineering workflows. Target your queries using the designated operational flags.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                
                {/* Mode: Mentor */}
                <div className="p-6 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">Mentor Mode</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Best for high-level system design, architectural reviews, and best-practice validation.
                  </p>
                  <code className="text-xs font-mono bg-black/50 text-indigo-300 px-3 py-1.5 rounded-md border border-indigo-500/20">
                    ganapathi mentor &quot;&lt;prompt&gt;&quot;
                  </code>
                </div>

                {/* Mode: Fix */}
                <div className="p-6 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <Wrench className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold text-white">Remediation Mode (Fix)</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Triggers the debugging pipeline. Analyzes stack traces, locates logic faults, and proposes exact diffs for remediation.
                  </p>
                  <code className="text-xs font-mono bg-black/50 text-amber-300 px-3 py-1.5 rounded-md border border-amber-500/20">
                    ganapathi fix &quot;&lt;prompt&gt;&quot;
                  </code>
                </div>

                {/* Mode: Plan */}
                <div className="p-6 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <GitPullRequest className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">Planning Mode</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Transforms conceptual feature ideas into deterministic implementation roadmaps and task breakdowns.
                  </p>
                  <code className="text-xs font-mono bg-black/50 text-emerald-300 px-3 py-1.5 rounded-md border border-emerald-500/20">
                    ganapathi plan &quot;&lt;prompt&gt;&quot;
                  </code>
                </div>

                {/* Mode: Ops */}
                <div className="p-6 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="w-5 h-5 text-rose-400" />
                    <h3 className="text-lg font-bold text-white">Ops & Infrastructure</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Specialized for DevOps tasks, Dockerfile generation, CI/CD pipeline configuration, and cloud resource provisioning.
                  </p>
                  <code className="text-xs font-mono bg-black/50 text-rose-300 px-3 py-1.5 rounded-md border border-rose-500/20">
                    ganapathi ops &quot;&lt;prompt&gt;&quot;
                  </code>
                </div>

              </div>
            </div>

          </div>

          {/* Sidebar / Quick Links */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 p-6 rounded-2xl border border-white/[0.05] bg-[#0F172A]/20 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/[0.05] pb-4">
                Quick Reference
              </h3>
              <ul className="space-y-4 text-sm font-mono">
                <li>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-between group">
                    <span>Installation</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-between group">
                    <span>Standard Invocation</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-between group">
                    <span>Mentor Mode</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-between group">
                    <span>Remediation (Fix)</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-between group">
                    <span>Ops Configuration</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </main>
  );
}
