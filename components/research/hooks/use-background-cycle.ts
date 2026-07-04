'use client';

import { useEffect, useMemo, useState } from 'react';

export interface ResearchTheme {
  name: string;
  image: string;
  overlay: string;
}

const THEMES: ResearchTheme[] = [
  {
    name: 'Space',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1800&q=80',
    overlay: 'from-cyan-900/30 via-slate-900/45 to-black/80',
  },
  {
    name: 'Ocean',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1800&q=80',
    overlay: 'from-teal-900/40 via-sky-900/35 to-black/80',
  },
  {
    name: 'Forest',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1800&q=80',
    overlay: 'from-emerald-900/35 via-zinc-900/45 to-black/85',
  },
  {
    name: 'Neon',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1800&q=80',
    overlay: 'from-fuchsia-900/35 via-indigo-900/40 to-black/85',
  },
  {
    name: 'Minimal',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80',
    overlay: 'from-zinc-900/40 via-neutral-900/40 to-black/80',
  },
  {
    name: 'Gradient',
    image: 'https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=1800&q=80',
    overlay: 'from-violet-900/35 via-slate-900/40 to-black/85',
  },
];

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

export function useBackgroundCycle() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      const target = (currentIndex + 1) % THEMES.length;
      await preloadImage(THEMES[target].image);
      setNextIndex(target);
      window.setTimeout(() => {
        setCurrentIndex(target);
        setNextIndex(null);
      }, 500);
    }, 30000);

    return () => window.clearInterval(timer);
  }, [currentIndex]);

  const current = useMemo(() => THEMES[currentIndex], [currentIndex]);
  const next = useMemo(() => (nextIndex === null ? null : THEMES[nextIndex]), [nextIndex]);

  return {
    current,
    next,
    themes: THEMES,
  };
}
