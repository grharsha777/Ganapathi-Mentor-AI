import { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ErrorBoundary } from '@/components/landing/ErrorBoundary';
import { Terminal, Settings, Wrench, GitPullRequest, Activity, Zap, Shield, Code2, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CLI Documentation | Ganapathi Mentor AI',
  description: 'Complete reference guide for the Ganapathi Mentor AI Command Line Interface — installation, login, hive-mind, and all commands.',
};

const CodeBlock = ({ children, color = 'text-cyan-300' }: { children: React.ReactNode, color?: string }) => (
  <div className={`bg-[#0a0f1e] border border-white/[0.06] rounded-xl p-4 font-mono text-sm ${color} overflow-x-auto`}>
    <pre className="whitespace-pre-wrap">{children}</pre>
  </div>
);

const Step = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <div className="flex gap-4">
    <div className="shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-sm">
      {num}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-white font-bold mb-2">{title}</h3>
      {children}
    </div>
  </div>
);

export default function CliDocsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden flex flex-col bg-[#050505] text-white">
      <Navbar />

      <section className="flex-grow pt-32 pb-24 px-6 md:px-10 lg:px-16 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-16 border-b border-white/[0.05] pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <Terminal className="w-4 h-4" />
            <span>Developer Tooling — v2.0</span>
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black uppercase tracking-[-0.03em] mb-4 text-white">
            CLI <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Reference</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
            Integrate Ganapathi Mentor AI directly into your local terminal. ML code predictions, 
            AI mentor chat, security audits, and the Hive Mind IDE bridge — all from your command line.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">

            {/* 1. Installation */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-cyan-400 font-mono text-sm">01.</span> Installation
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Install the package via pip. Python 3.9+ is required.
              </p>
              <CodeBlock>pip install ganapathi-mentor-ai</CodeBlock>
              <div className="flex items-start gap-3 mt-4 text-sm text-slate-500 p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                <Settings className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-amber-300">Windows PATH Note:</strong> After install, if{' '}
                  <code className="text-amber-400 bg-black/30 px-1 rounded">ganapathi</code> is not recognized, 
                  always use <code className="text-amber-400 bg-black/30 px-1 rounded">python -m ganapathi</code> as 
                  the universal, always-working alternative.
                </p>
              </div>
            </div>

            {/* 2. Login */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-cyan-400 font-mono text-sm">02.</span> Authentication (Login)
              </h2>
              <p className="text-slate-400 leading-relaxed">
                You must login before using any feature. This opens your browser to a secure token page.
              </p>
              <CodeBlock color="text-emerald-300">python -m ganapathi login</CodeBlock>
              <div className="space-y-3 text-sm text-slate-400 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                <p>The command will:</p>
                <ol className="list-decimal list-inside space-y-1.5 ml-2">
                  <li>Open <code className="text-cyan-400">ganapathi-mentor-ai.vercel.app/auth/cli</code> in your browser</li>
                  <li>Sign in to your Ganapathi account if prompted</li>
                  <li>Copy the token shown on the page</li>
                  <li>Paste it back in your terminal when asked</li>
                </ol>
              </div>
            </div>

            {/* 3. Hive Mind */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-cyan-400 font-mono text-sm">03.</span> Hive Mind Bridge (IDE Sync)
              </h2>
              <p className="text-slate-400 leading-relaxed">
                The Hive Mind creates a secure WebSocket bridge between your local terminal and the Ganapathi 
                web dashboard, giving you a full IDE experience in your browser with live file sync.
              </p>

              <div className="space-y-4">
                <Step num="1" title="Install & Login (see above)">
                  <CodeBlock>{`pip install ganapathi-mentor-ai
python -m ganapathi login`}</CodeBlock>
                </Step>
                <Step num="2" title="Navigate to your project folder">
                  <CodeBlock color="text-slate-400">cd /path/to/your/project</CodeBlock>
                </Step>
                <Step num="3" title="Start the bridge">
                  <CodeBlock color="text-amber-300">python -m ganapathi hive-mind start --path ./</CodeBlock>
                  <p className="text-xs text-slate-500 mt-2">
                    Optional flags: <code className="text-slate-400">--port 8765</code> (default){' '}
                    <code className="text-slate-400">--host 127.0.0.1</code> (default, use 0.0.0.0 for network access)
                  </p>
                </Step>
                <Step num="4" title="Connect in the Web Dashboard">
                  <p className="text-sm text-slate-400">
                    Copy the <strong className="text-white">Token</strong> and <strong className="text-white">WebSocket URL</strong>{' '}
                    from your terminal output, then go to{' '}
                    <a href="/dashboard/tools/hive-mind" className="text-cyan-400 hover:underline">
                      Dashboard → Tools → Hive Mind
                    </a>{' '}
                    and paste them into the connection form.
                  </p>
                </Step>
              </div>
            </div>

            {/* 4. All Commands */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-cyan-400 font-mono text-sm">04.</span> All Commands
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Use <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">python -m ganapathi</code> as 
                the universal prefix if the <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">ganapathi</code> shortcut doesn&apos;t work.
              </p>

              <div className="grid grid-cols-1 gap-4">

                <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-white font-bold">Login / Auth</h3>
                  </div>
                  <code className="text-xs font-mono bg-black/50 text-emerald-300 px-3 py-2 rounded-md border border-emerald-500/20 block">
                    python -m ganapathi login
                  </code>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-white font-bold">AI Mentor Chat</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">
                    Start an interactive AI mentor session with streaming responses.
                  </p>
                  <code className="text-xs font-mono bg-black/50 text-indigo-300 px-3 py-2 rounded-md border border-indigo-500/20 block">
                    python -m ganapathi chat
                  </code>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-white font-bold">ML Code Prediction</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">
                    ML-powered analysis: bug risk, performance, quality, career fit scores.
                  </p>
                  <CodeBlock color="text-cyan-300">{`python -m ganapathi predict --file main.py --type all\npython -m ganapathi predict --code "def add(a,b): return a+b" --type bug`}</CodeBlock>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <h3 className="text-white font-bold">Code Audit (Security)</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">
                    Deep security scan + ML scoring + AI review of your code or directory.
                  </p>
                  <CodeBlock color="text-amber-300">{`python -m ganapathi audit .                # audit whole project\npython -m ganapathi audit src/api.py      # audit single file`}</CodeBlock>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Code2 className="w-5 h-5 text-violet-400" />
                    <h3 className="text-white font-bold">Architecture Explain</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">
                    AI architecture review — explains your project structure & patterns.
                  </p>
                  <CodeBlock color="text-violet-300">python -m ganapathi explain .</CodeBlock>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Wrench className="w-5 h-5 text-rose-400" />
                    <h3 className="text-white font-bold">Agent (Autonomous AI)</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">
                    Give the AI an autonomous task to execute in your project.
                  </p>
                  <CodeBlock color="text-rose-300">{`python -m ganapathi agent "Add unit tests for the auth module"`}</CodeBlock>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <h3 className="text-white font-bold">Hive Mind (IDE Bridge)</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">
                    Start the real-time WebSocket bridge to the Ganapathi web dashboard.
                  </p>
                  <CodeBlock color="text-amber-300">{`python -m ganapathi hive-mind start --path ./\npython -m ganapathi hive-mind start --path ./ --port 8765 --host 0.0.0.0`}</CodeBlock>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <GitPullRequest className="w-5 h-5 text-orange-400" />
                    <h3 className="text-white font-bold">Other Commands</h3>
                  </div>
                  <CodeBlock color="text-slate-300">{`python -m ganapathi setup           # configure API keys
python -m ganapathi doctor          # system diagnostic scan
python -m ganapathi history         # view query history
python -m ganapathi version         # show version info
python -m ganapathi ml train        # train the ML model
python -m ganapathi ml info         # show ML model info
python -m ganapathi ml benchmark    # benchmark ML speed
python -m ganapathi docker build    # auto-generate Dockerfile
python -m ganapathi docker deploy   # deploy with docker-compose
python -m ganapathi k8s generate    # generate K8s manifests
python -m ganapathi k8s deploy      # apply K8s manifests`}</CodeBlock>
                </div>

              </div>
            </div>

          </div>

          {/* Sidebar Quick Reference */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 p-6 rounded-2xl border border-white/[0.05] bg-[#0F172A]/20 backdrop-blur-xl space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/[0.05] pb-4">
                Quick Reference
              </h3>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { label: 'Install', cmd: 'pip install ganapathi-mentor-ai', color: 'text-slate-400' },
                  { label: 'Login', cmd: 'python -m ganapathi login', color: 'text-emerald-400' },
                  { label: 'Chat', cmd: 'python -m ganapathi chat', color: 'text-indigo-400' },
                  { label: 'Predict', cmd: 'python -m ganapathi predict --file app.py', color: 'text-cyan-400' },
                  { label: 'Audit', cmd: 'python -m ganapathi audit .', color: 'text-amber-400' },
                  { label: 'Explain', cmd: 'python -m ganapathi explain .', color: 'text-violet-400' },
                  { label: 'Agent', cmd: 'python -m ganapathi agent "<task>"', color: 'text-rose-400' },
                  { label: 'Hive Mind', cmd: 'python -m ganapathi hive-mind start --path ./', color: 'text-amber-300' },
                  { label: 'Doctor', cmd: 'python -m ganapathi doctor', color: 'text-slate-400' },
                ].map(({ label, cmd, color }) => (
                  <div key={label} className="group">
                    <span className="text-white/30 text-[10px] uppercase tracking-wider">{label}</span>
                    <div className={`${color} bg-black/30 p-2 rounded-lg border border-white/[0.04] text-[10px] break-all mt-0.5`}>
                      {cmd}
                    </div>
                  </div>
                ))}
              </div>
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
