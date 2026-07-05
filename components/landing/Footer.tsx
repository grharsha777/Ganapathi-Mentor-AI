'use client';

import Link from 'next/link';
import { Linkedin, Github, Mail, ArrowUpRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';
import type { FooterProps, FooterLink, FooterSocialLink } from '@/types/landing';
import { useIsMobile } from '@/hooks/use-mobile';

const DEFAULT_LINKS: FooterLink[] = [
  { label: 'Features',   href: '#features'     },
  { label: 'Enterprise', href: '#enterprise'    },
  { label: 'Sign In',    href: '/auth/login'    },
  { label: 'Get Started',href: '/auth/sign-up'  },
  { label: 'CLI Docs',   href: '/docs',          external: false },
  { label: 'Privacy Policy', href: '/privacy'    },
  { label: 'Terms & Conditions', href: '/terms' },
];

const DEFAULT_SOCIALS: FooterSocialLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/grharsha777/', icon: Linkedin },
  { label: 'GitHub',   href: 'https://github.com/grharsha777',           icon: Github  },
  { label: 'Email',    href: 'mailto:grharsha777@gmail.com',             icon: Mail    },
];

const COMPLIANCE_MARKS = ['SOC 2 Type II', 'AWS Architecture', 'GDPR Ready', 'TLS 1.3'];

export default function Footer({
  links   = DEFAULT_LINKS,
  socials = DEFAULT_SOCIALS,
}: FooterProps) {
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 100, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  const xTransform = useTransform(smoothX, [-0.5, 0.5], [-25, 25]);
  const yTransform = useTransform(smoothY, [-0.5, 0.5], [-15, 15]);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!footerRef.current) return;
      const rect = footerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    const el = footerRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      if (el) {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [mouseX, mouseY, isMobile]);

  return (
    <footer
      ref={footerRef}
      aria-label="Site footer"
      className="relative z-10 overflow-hidden pb-safe"
      style={{ borderTop: '1px solid #1F1F1F', background: '#030712' }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      {/* ─── Magnetic Giant Title ────────────────────────────────────────── */}
      <div className="relative pt-16 sm:pt-32 pb-10 sm:pb-20 px-6 flex flex-col items-center justify-center border-b border-white/[0.05] overflow-hidden">
        <motion.div
          style={isMobile ? undefined : { x: xTransform, y: yTransform }}
          className="text-center relative z-10 w-full max-w-full overflow-hidden"
        >
          <h1 className="text-[clamp(2.5rem,10vw,8rem)] font-black uppercase tracking-[-0.05em] text-white leading-none break-words pointer-events-none select-none overflow-hidden">
            GANAPATHI <span className="text-cyan-400">AI</span>
          </h1>
          <p className="mt-6 font-mono text-[clamp(12px,2vw,16px)] text-[#9CA3AF] uppercase tracking-[0.2em] font-bold break-words">
            Works on your code, terminal, web, etc.
          </p>
        </motion.div>
        
        {!isMobile && (
          <motion.div 
            style={{ x: xTransform, y: yTransform }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[50%] bg-cyan-500/5 blur-[100px] pointer-events-none"
          />
        )}
      </div>

      {/* ─── Links & Socials Grid ──────────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-between">
          
          {/* Links Column */}
          <div className="flex flex-col gap-6">
            <span className="font-mono text-[10px] text-[#4B5563] uppercase tracking-[0.3em] font-bold mb-2">Navigation</span>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {links.map((link) => {
                const isExternal = link.external !== false && (link.href.startsWith('http') || link.href.startsWith('mailto'));
                return isExternal ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[12px] text-[#9CA3AF] hover:text-cyan-400 transition-colors uppercase tracking-[0.1em] font-bold flex items-center gap-1 group w-max"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="font-mono text-[12px] text-[#9CA3AF] hover:text-cyan-400 transition-colors uppercase tracking-[0.1em] font-bold w-max"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Socials Column */}
          <div className="flex flex-col gap-6 md:items-end">
            <span className="font-mono text-[10px] text-[#4B5563] uppercase tracking-[0.3em] font-bold mb-2">Connect</span>
            <div className="flex flex-col gap-4 md:items-end">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[12px] text-[#9CA3AF] hover:text-emerald-400 transition-colors uppercase tracking-[0.1em] font-bold flex items-center gap-3 w-max group"
                    aria-label={`Visit our ${social.label}`}
                  >
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" aria-hidden="true" />
                    {social.label}
                  </a>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ─── Compliance & Copyright Bottom Bar ─────────────────────────── */}
      <div 
        className="w-full px-6 md:px-10 lg:px-16 py-8 flex flex-col md:flex-row items-center justify-center md:justify-between gap-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="font-mono text-[10px] text-[#6B7280] uppercase tracking-[0.2em] text-center">
          &copy; {year} Ganapathi Mentor AI. All rights reserved.
        </span>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {COMPLIANCE_MARKS.map((mark, i) => (
            <div key={mark} className="flex items-center gap-4">
              <span className="font-mono text-[9px] text-[#4B5563] font-bold uppercase tracking-[0.2em]">
                {mark}
              </span>
              {i < COMPLIANCE_MARKS.length - 1 && (
                <div className="hidden sm:block w-[1px] h-3 bg-white/[0.05]" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
