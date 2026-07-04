'use client';

import { useParticleCanvas } from '@/hooks/useParticleCanvas';
import type { ParticleBackgroundProps } from '@/types/landing';

/**
 * ParticleBackground
 *
 * Full-viewport HTML5 Canvas particle system.
 * – Grid of anti-aliased floating nodes propagating along a 3D sine-wave
 * – Three enterprise colors: Quantum Blue, Silicon Violet, Acid Emerald
 * – Mouse hover deflects dots; they snap back smoothly when idle
 * – HiDPI (devicePixelRatio) aware for crisp rendering on Retina displays
 * – Locked 60fps via requestAnimationFrame (managed in useParticleCanvas)
 * – Pointer-events none — never blocks user interaction
 */
export default function ParticleBackground({
  config,
  className = '',
}: ParticleBackgroundProps) {
  const canvasRef = useParticleCanvas(config);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
      role="presentation"
      style={{ imageRendering: 'auto' }}
    />
  );
}
