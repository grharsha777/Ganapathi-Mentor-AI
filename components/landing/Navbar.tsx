'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useId } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Menu } from 'lucide-react';
import type { NavbarProps, NavLinkItem } from '@/types/landing';

// ─── Default nav links ────────────────────────────────────────────────────────
const DEFAULT_LINKS: NavLinkItem[] = [
  { label: 'Features',      href: '#features'    },
  { label: 'How It Works',  href: '#how-it-works' },
  { label: 'Enterprise',    href: '#enterprise'   },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function DesktopNavLink({ href, label }: NavLinkItem) {
  return (
    <a
      href={href}
      className="relative px-4 py-2 text-[11px] font-semibold uppercase tracking-widest
                 text-[#9CA3AF] hover:text-[#FFFFFF] transition-colors duration-200 group"
      aria-label={`Navigate to ${label} section`}
    >
      {label}
      {/* Underline reveal on hover — brutalist 1px bar */}
      <span
        className="absolute bottom-0 left-4 right-4 h-px bg-[#FFFFFF]
                   scale-x-0 group-hover:scale-x-100 transition-transform
                   duration-200 origin-left"
      />
    </a>
  );
}

function MobileNavLink({
  href,
  label,
  onClick,
}: NavLinkItem & { onClick: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block py-3 text-sm font-semibold uppercase tracking-widest
                 text-[#9CA3AF] hover:text-[#FFFFFF] transition-colors duration-200
                 border-b border-[#1F1F1F] last:border-b-0"
    >
      {label}
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * Navbar
 *
 * Fixed top navigation with:
 * – Ultra-thin glassmorphism backdrop on scroll (backdrop-blur + saturate)
 * – Kinetic logo: full "Ganapathi Mentor AI" text morphs/compresses into "GMA"
 *   monogram as the user scrolls down (Framer Motion useTransform)
 * – Fully accessible: aria-expanded, aria-label, keyboard navigable
 * – Mobile menu: AnimatePresence height animation, focus trap via close on Escape
 */
export default function Navbar({ links = DEFAULT_LINKS }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const mobileMenuId = useId();

  const { scrollY } = useScroll();

  // ─── Kinetic logo transforms ──────────────────────────────────────────────
  const logoTextOpacity  = useTransform(scrollY, [0, 55],  [1, 0]);
  const logoTextMaxWidth = useTransform(scrollY, [0, 55],  [200, 0]);
  const monogramOpacity  = useTransform(scrollY, [25, 80], [0, 1]);

  // ─── Scroll state for glassmorphism trigger ───────────────────────────────
  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 20));
    return unsub;
  }, [scrollY]);

  // ─── Escape key closes mobile menu ───────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, handleKeyDown]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ─── Main bar ──────────────────────────────────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Primary navigation"
        className={`transition-all duration-500 ${
          scrolled 
            ? 'bg-[rgba(5,5,5,0.88)] backdrop-blur-[16px] border-b border-[#1F1F1F]' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-10 lg:px-16 h-14">

          {/* ─── Logo ────────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none
                       focus-visible:ring-1 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2
                       focus-visible:ring-offset-[#050505]"
            aria-label="Ganapathi Mentor AI — return to homepage"
          >
            {/* ── Logo mark: always visible ─── */}
            <div
              className="relative flex-shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-sm overflow-hidden border border-[#FF6B00]/30 shadow-[0_0_10px_rgba(255,107,0,0.3)] bg-[#0D0D0D]"
            >
              <img src="/logo.png" alt="Ganapathi Mentor AI Logo" className="w-full h-full object-cover" />
            </div>

            {/* ── Full brand name — fades + collapses out on scroll ─── */}
            <motion.span
              style={{ opacity: logoTextOpacity, maxWidth: logoTextMaxWidth }}
              className="overflow-hidden whitespace-nowrap text-[13px] font-bold
                         text-[#FFFFFF] tracking-tight leading-none select-none"
            >
              Ganapathi Mentor AI
            </motion.span>

            {/* ── Compressed monogram — fades in on scroll ─── */}
            <motion.span
              style={{ opacity: monogramOpacity }}
              className="text-[10px] font-black text-[#9CA3AF] uppercase
                         tracking-[0.25em] leading-none select-none"
              aria-hidden="true"
            >
              GMA
            </motion.span>
          </Link>

          {/* ─── Desktop nav links ───────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-0">
            {links.map((link) => (
              <DesktopNavLink key={link.href} {...link} />
            ))}
          </div>

          {/* ── Right: Auth / Action / GitHub ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://github.com/grharsha777/Ganapathi-Mentor-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 
                         font-mono text-[10px] uppercase tracking-[0.2em] font-bold
                         text-[#9CA3AF] hover:text-[#FFFFFF] transition-all
                         focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB]
                         border border-[#1F1F1F] bg-[#0D0D0D]"
              aria-label="Star on GitHub"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" className="opacity-80 group-hover:opacity-100 group-hover:text-[#00FF00] transition-colors">
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
              </svg>
              Star Repo
            </a>
            <Link
              href="/auth/login"
              className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold
                         text-[#9CA3AF] hover:text-[#FFFFFF] transition-colors
                         px-4 py-2 focus-visible:outline-none focus-visible:text-[#FFFFFF]"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="relative group inline-flex items-center justify-center px-6 py-2.5
                         font-mono text-[10px] uppercase tracking-[0.2em] font-bold
                         text-[#FFFFFF] transition-all duration-200
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]
                         bg-[#2563EB]"
            >
              {/* Button Hover Shine */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
                   aria-hidden="true" />
              Get Started
            </Link>
          </div>

          {/* ─── Mobile hamburger ────────────────────────────────────────── */}
          <button
            className="flex md:hidden items-center justify-center w-9 h-9
                       text-[#9CA3AF] hover:text-[#FFFFFF] transition-colors
                       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB]"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen
              ? <X className="w-5 h-5" aria-hidden="true" />
              : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* ─── Mobile slide-down menu ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id={mobileMenuId}
            role="dialog"
            aria-label="Mobile navigation menu"
            aria-modal="false"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden md:hidden bg-[rgba(5,5,5,0.97)] backdrop-blur-[20px] border-b border-[#1F1F1F]"
          >
            <div className="px-6 py-6 flex flex-col gap-0">
              {links.map((link) => (
                <MobileNavLink key={link.href} {...link} onClick={closeMobile} />
              ))}
              <div className="pt-5 flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  onClick={closeMobile}
                  className="text-center py-3 text-[11px] font-semibold uppercase tracking-widest
                             text-[#9CA3AF] hover:text-[#FFFFFF] transition-colors
                             border border-[#1F1F1F] hover:border-[#3F3F3F]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={closeMobile}
                  className="text-center py-3 text-[11px] font-bold uppercase tracking-widest
                             text-[#050505] bg-[#FFFFFF] hover:bg-[#E5E7EB] transition-colors"
                  aria-label="Get started free — create your account"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
