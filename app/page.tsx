import type { Metadata } from 'next';
import { ErrorBoundary } from '@/components/landing/ErrorBoundary';
import ParticleBackground from '@/components/landing/ParticleBackground';
import Navbar from '@/components/landing/Navbar';
import NeuralLanding from '@/components/landing/NeuralLanding';
import Footer from '@/components/landing/Footer';

// ─── Page-level SEO metadata ─────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Ganapathi Mentor AI — Neural Code Symbiosis',
  description:
    'The AI Mentor that lives in your code, your terminal, and your career. Unifying deep learning paths, real-time WebSocket local syncing, voice interview simulations, and an elite global CLI.',
  keywords: [
    'AI mentor',
    'developer upskilling',
    'AWS Bedrock',
    'code review',
    'websocket code sync',
    'Mistral AI',
    'Claude',
    'GPT-4o',
    'Groq',
  ],
  openGraph: {
    title:       'Ganapathi Mentor AI — Neural Code Symbiosis',
    description: 'The AI Mentor that lives in your code, your terminal, and your career.',
    type:        'website',
    siteName:    'Ganapathi Mentor AI',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Ganapathi Mentor AI — Neural Code Symbiosis',
    description: 'The AI Mentor that lives in your code, your terminal, and your career.',
  },
  robots: {
    index:  true,
    follow: true,
  },
};

export default function Home() {
  return (
    <main
      className="w-full overflow-x-hidden relative bg-[#030712] text-white"
    >
      <ErrorBoundary>
        <ParticleBackground />
      </ErrorBoundary>

      <Navbar />

      <ErrorBoundary>
        <NeuralLanding />
      </ErrorBoundary>

      <div className="snap-start">
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </main>
  );
}

