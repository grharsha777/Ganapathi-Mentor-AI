'use client';

export function ResearchBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
      {/* Deep base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(0,212,170,0.09) 0%, transparent 40%),' +
            'radial-gradient(circle at 80% 10%, rgba(59,130,246,0.07) 0%, transparent 35%),' +
            'radial-gradient(circle at 45% 85%, rgba(139,92,246,0.07) 0%, transparent 38%),' +
            'radial-gradient(circle at 85% 80%, rgba(0,212,170,0.05) 0%, transparent 30%),' +
            'linear-gradient(160deg, #05050a 0%, #0d0d14 50%, #05050a 100%)',
        }}
      />

      {/* Floating blobs */}
      <div
        className="rh-blob-a absolute -left-20 top-16 h-72 w-72 rounded-full opacity-60"
        style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div
        className="rh-blob-b absolute right-12 top-20 h-56 w-56 rounded-full opacity-50"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div
        className="rh-blob-c absolute bottom-24 left-1/3 h-64 w-64 rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div
        className="rh-blob-a absolute bottom-12 right-1/4 h-40 w-40 rounded-full opacity-35"
        style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 70%)', filter: 'blur(32px)', animationDelay: '8s' }}
      />

      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top vignette */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,170,0.3), rgba(59,130,246,0.3), transparent)' }}
      />
    </div>
  );
}
