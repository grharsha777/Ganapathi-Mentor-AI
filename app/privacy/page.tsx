import { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ErrorBoundary } from '@/components/landing/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Privacy Policy | Ganapathi Mentor AI',
  description: 'Privacy Policy and Data Processing Addendum for Ganapathi Mentor AI enterprise deployments.',
};

export default function PrivacyPolicyPage() {
  return (
    <main
      className="min-h-screen overflow-x-hidden flex flex-col bg-[#050505] text-white"
    >
      <Navbar />

      <section className="flex-grow pt-32 pb-24 px-6 md:px-10 lg:px-16 max-w-4xl mx-auto w-full">
        <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-black uppercase tracking-[-0.04em] mb-12">
          Privacy <span className="text-[#00FF00]">Policy</span>
        </h1>

        <div className="font-mono text-[13px] text-[#9CA3AF] leading-relaxed space-y-8">
          <p>
            Last updated: July 2026.
          </p>

          <h2 className="text-[16px] font-bold text-[#FFFFFF] uppercase tracking-[0.1em] mt-12 mb-4">
            1. Enterprise Data Processing
          </h2>
          <p>
            Ganapathi Mentor AI is designed for enterprise engineering teams. All code, prompts, and context injected into the platform are processed exclusively within secure AWS VPC environments. We do not use your proprietary codebase to train our foundational models.
          </p>

          <h2 className="text-[16px] font-bold text-[#FFFFFF] uppercase tracking-[0.1em] mt-12 mb-4">
            2. LLM Routing & Subprocessors
          </h2>
          <p>
            To provide multi-model capabilities (Claude 3, Mistral, GPT-4o, Gemini, Groq), queries are routed through AWS Bedrock or directly to the respective API providers via secure TLS 1.3 encrypted channels. Zero Data Retention (ZDR) agreements are in place with all sub-processors.
          </p>

          <h2 className="text-[16px] font-bold text-[#FFFFFF] uppercase tracking-[0.1em] mt-12 mb-4">
            3. Data Persistence
          </h2>
          <p>
            Chat sessions and learning paths are persisted in MongoDB Atlas using AES-256 encryption at rest. Enterprise customers may opt for Bring Your Own Key (BYOK) encryption via AWS KMS.
          </p>

          <h2 className="text-[16px] font-bold text-[#FFFFFF] uppercase tracking-[0.1em] mt-12 mb-4">
            4. Telemetry & Analytics
          </h2>
          <p>
            We collect anonymized usage telemetry to improve routing latency and platform stability. Strict RBAC (Role-Based Access Control) governs all internal access to aggregated analytics.
          </p>
        </div>
      </section>

      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </main>
  );
}
