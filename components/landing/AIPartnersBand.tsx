'use client';

const PARTNERS = [
  'Mistral AI', 'Claude (Anthropic)', 'GPT (OpenAI)', 'Gemini (Google)',
  'Groq', 'AWS Bedrock', 'Grok (xAI)', 'Sarvam AI', 'Kling AI',
  'Runway ML', 'Freepik AI', 'NewsOrg API', 'Vercel', 'MongoDB Atlas',
  'NanoBanana', 'Supabase',
];

export default function AIPartnersBand() {
  const repeated = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section
      className="relative z-10 py-5 overflow-hidden"
      style={{ borderTop: '1px solid #1F1F1F', borderBottom: '1px solid #1F1F1F', background: '#0D0D0D' }}
      aria-label="AI infrastructure partners"
    >
      {/* Edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #0D0D0D, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #0D0D0D, transparent)' }} />

      {/* Label */}
      <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-[#9CA3AF] mb-4 opacity-60">
        Powered by World-Class AI Infrastructure
      </p>

      {/* Scrolling strip */}
      <div
        className="flex gap-10 whitespace-nowrap"
        style={{ animation: 'marquee-scroll 36s linear infinite' }}
      >
        {repeated.map((name, i) => (
          <span
            key={i}
            className="flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default select-none"
          >
            {name}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
