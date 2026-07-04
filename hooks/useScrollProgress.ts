'use client';

import { useRef } from 'react';
import { useScroll, useTransform, MotionValue } from 'framer-motion';
import type { ScrollProgressOptions } from '@/types/landing';

export interface UseScrollProgressReturn {
  scrollYProgress: MotionValue<number>;
  /** 0→1 clamped to [offset[0], offset[1]] range */
  progress: MotionValue<number>;
}

/**
 * useScrollProgress
 *
 * Thin wrapper around Framer Motion's useScroll.
 * Returns both the raw scrollYProgress and a normalized
 * progress value clamped to the supplied offset window.
 */
export function useScrollProgress(
  options: ScrollProgressOptions = {}
): UseScrollProgressReturn {
  const fallbackRef = useRef<HTMLElement>(null);
  const targetRef   = options.target ?? fallbackRef;
  const [start, end] = options.offset ?? [0, 1];

  const { scrollYProgress } = useScroll({
    target: targetRef as React.RefObject<HTMLElement>,
    offset: [`${start * 100}% start`, `${end * 100}% end`],
  });

  // Re-map raw progress to [0, 1] within the offset window
  const progress = useTransform(scrollYProgress, [start, end], [0, 1]);

  return { scrollYProgress, progress };
}
