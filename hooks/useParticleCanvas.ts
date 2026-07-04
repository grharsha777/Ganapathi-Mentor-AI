'use client';

import { useEffect, useRef } from 'react';
import type { Particle, ParticleConfig } from '@/types/landing';

// ─── Aurora Glow Palette ─────────────────────────────────────────────────────
const GLOW_PALETTE = [
  { r: 59,  g: 130, b: 246 }, // Blue
  { r: 139, g: 92,  b: 246 }, // Violet
  { r: 6,   g: 182, b: 212 }, // Cyan
  { r: 16,  g: 185, b: 129 }, // Emerald
  { r: 168, g: 85,  b: 247 }, // Purple
] as const;

const DEFAULTS: Required<ParticleConfig> = {
  gridSpacing: 80,
  warpRadius:  180,
  warpForce:   35,
  minSize:     1.2,
  maxSize:     2.4,
  minOpacity:  0.20,
  maxOpacity:  0.50,
  timeStep:    0.01,
};

/**
 * useParticleCanvas
 *
 * High-performance glowing particle system with pre-rendered glow textures.
 * Each particle has a radial glow halo and a bright core dot.
 * Mouse warp deflects particles smoothly. Aurora-inspired color palette.
 */
export function useParticleCanvas(config: ParticleConfig = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfgRef = useRef({ ...DEFAULTS, ...config });
  cfgRef.current = { ...DEFAULTS, ...config };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cfg = cfgRef.current;

    // ─── Pre-render glow textures (1 per color) for performance ──────────
    const TEX_SIZE = 64;
    const glowTextures = GLOW_PALETTE.map(({ r, g, b }) => {
      const off = document.createElement('canvas');
      off.width = TEX_SIZE;
      off.height = TEX_SIZE;
      const oc = off.getContext('2d')!;
      const c = TEX_SIZE / 2;
      const grad = oc.createRadialGradient(c, c, 0, c, c, c);
      grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
      grad.addColorStop(0.15, `rgba(${r},${g},${b},0.5)`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},0.1)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      oc.fillStyle = grad;
      oc.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
      return off;
    });

    let particles: Particle[] = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let time = 0;
    let raf = 0;

    // ─── Build Particle Grid ─────────────────────────────────────────────
    const buildGrid = (w: number, h: number) => {
      const cols = Math.max(2, Math.ceil(w / cfg.gridSpacing));
      const rows = Math.max(2, Math.ceil(h / cfg.gridSpacing));
      particles = [];
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const baseX = (col / (cols - 1)) * w;
          const baseY = (row / (rows - 1)) * h;
          particles.push({
            baseX, baseY,
            x: baseX, y: baseY,
            colorIndex: (col + row) % GLOW_PALETTE.length,
            phaseOffset: (col * 0.4 + row * 0.3) % (Math.PI * 2),
            amplitude: 8 + Math.random() * 14,
            speed: 0.3 + Math.random() * 0.35,
            size: cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize),
            opacity: cfg.minOpacity + Math.random() * (cfg.maxOpacity - cfg.minOpacity),
          });
        }
      }
    };

    // ─── Resize Handler ──────────────────────────────────────────────────
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      buildGrid(w, h);
    };

    // ─── Render Loop ─────────────────────────────────────────────────────
    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      time += cfg.timeStep;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      for (const p of particles) {
        // Sine-wave trajectory
        const waveX = Math.sin(time * p.speed + p.phaseOffset) * p.amplitude;
        const waveY = Math.cos(time * p.speed * 0.7 + p.phaseOffset * 1.3) * (p.amplitude * 0.55);
        let targetX = p.baseX + waveX;
        let targetY = p.baseY + waveY;

        // Mouse warp — particles deflect away from cursor
        const dx = targetX - mouseX;
        const dy = targetY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cfg.warpRadius && dist > 0) {
          const strength = (1 - dist / cfg.warpRadius) * cfg.warpForce;
          targetX += (dx / dist) * strength;
          targetY += (dy / dist) * strength;
        }

        // Smooth lerp
        p.x += (targetX - p.x) * 0.08;
        p.y += (targetY - p.y) * 0.08;

        // Draw glow halo using pre-rendered texture
        const tex = glowTextures[p.colorIndex];
        const drawSize = p.size * 10;
        ctx.globalAlpha = p.opacity;
        ctx.drawImage(tex, p.x - drawSize / 2, p.y - drawSize / 2, drawSize, drawSize);
        ctx.globalAlpha = 1;

        // Draw bright core dot
        const { r, g, b } = GLOW_PALETTE[p.colorIndex];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, p.opacity + 0.35)})`;
        ctx.fill();
      }

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    // ─── Initialize ──────────────────────────────────────────────────────
    resize();
    raf = requestAnimationFrame(render);

    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    const onLeave = () => { mouseX = -9999; mouseY = -9999; };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return canvasRef;
}
