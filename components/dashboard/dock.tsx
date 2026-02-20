'use client'

import { useRef, useState, memo, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    AnimatePresence,
    type MotionValue,
} from 'framer-motion'
import {
    LayoutDashboard, BookOpen, Code, Lightbulb, CheckCircle, FileText,
    Github, Activity, AlertTriangle, Users, Search, Image as ImageIcon,
    Zap, GraduationCap, Trophy, Mic, Users2, ScrollText, Settings,
    Menu, X, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Navigation items with gradients
const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, bg: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #6366F1 100%)', shadow: '#7C3AED', color: '#7C3AED' },
    { name: 'Learning', href: '/dashboard/learning', icon: BookOpen, bg: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #FB923C 100%)', shadow: '#F97316', color: '#F97316' },
    { name: 'Review', href: '/dashboard/code-review', icon: Code, bg: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 50%, #38BDF8 100%)', shadow: '#0EA5E9', color: '#0EA5E9' },
    { name: 'Concepts', href: '/dashboard/concepts', icon: Lightbulb, bg: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #FCD34D 100%)', shadow: '#F59E0B', color: '#FBBF24' },
    { name: 'Tasks', href: '/dashboard/tools/productivity', icon: CheckCircle, bg: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #34D399 100%)', shadow: '#10B981', color: '#10B981' },
    { name: 'Docs', href: '/dashboard/tools/docs', icon: FileText, bg: 'linear-gradient(135deg, #EC4899 0%, #DB2777 50%, #F472B6 100%)', shadow: '#EC4899', color: '#EC4899' },
    { name: 'GitHub', href: '/dashboard/github', icon: Github, bg: 'linear-gradient(135deg, #374151 0%, #111827 50%, #4B5563 100%)', shadow: '#374151', color: '#9CA3AF' },
    { name: 'Analytics', href: '/dashboard/analytics/performance', icon: Activity, bg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #60A5FA 100%)', shadow: '#3B82F6', color: '#3B82F6' },
    { name: 'Anomalies', href: '/dashboard/analytics/anomalies', icon: AlertTriangle, bg: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 50%, #F87171 100%)', shadow: '#EF4444', color: '#EF4444' },
    { name: 'Collab', href: '/dashboard/collaboration', icon: Users, bg: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #C084FC 100%)', shadow: '#A855F7', color: '#A855F7' },
    { name: 'Research', href: '/dashboard/research', icon: Search, bg: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #2DD4BF 100%)', shadow: '#14B8A6', color: '#14B8A6' },
    { name: 'Studio', href: '/dashboard/media/studio', icon: ImageIcon, bg: 'linear-gradient(135deg, #D946EF 0%, #A21CAF 50%, #E879F9 100%)', shadow: '#D946EF', color: '#D946EF' },
    { name: 'Challenges', href: '/dashboard/challenges', icon: Trophy, bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #FBBF24 100%)', shadow: '#F59E0B', color: '#F59E0B' },
    { name: 'Interview', href: '/dashboard/interview', icon: Mic, bg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #A78BFA 100%)', shadow: '#8B5CF6', color: '#8B5CF6' },
    { name: 'CodeCollab', href: '/dashboard/collab', icon: Users2, bg: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #22D3EE 100%)', shadow: '#06B6D4', color: '#06B6D4' },
    { name: 'Portfolio', href: '/dashboard/portfolio', icon: ScrollText, bg: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 50%, #FB7185 100%)', shadow: '#F43F5E', color: '#F43F5E' },
    { name: 'Quick Prep', href: '/dashboard/last-minute', icon: Zap, bg: 'linear-gradient(135deg, #EAB308 0%, #CA8A04 50%, #FDE047 100%)', shadow: '#EAB308', color: '#EAB308' },
    { name: 'Training', href: '/dashboard/specialized', icon: GraduationCap, bg: 'linear-gradient(135deg, #0284C7 0%, #0369A1 50%, #38BDF8 100%)', shadow: '#0284C7', color: '#0284C7' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, bg: 'linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #9CA3AF 100%)', shadow: '#6B7280', color: '#9CA3AF' },
] as const

// Hook: detect small screen (< 1024px)
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024)
        check()
        window.addEventListener('resize', check, { passive: true })
        return () => window.removeEventListener('resize', check)
    }, [])
    return isMobile
}

// ─── DESKTOP Dock Icon (with magnification) ────────────────────────────
const DesktopDockIcon = memo(function DesktopDockIcon({
    item, mouseX, isActive,
}: {
    item: (typeof navigation)[number]; mouseX: MotionValue<number>; isActive: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null)
    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
        return val - bounds.x - bounds.width / 2
    })
    const widthSync = useTransform(distance, [-150, 0, 150], [50, 80, 50])
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 260, damping: 18 })
    const [isHovered, setIsHovered] = useState(false)
    const Icon = item.icon

    return (
        <Link href={item.href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex flex-col items-center justify-end mb-[2px]"
            role="menuitem" aria-label={item.name}>
            <motion.div ref={ref} style={{ width, height: width }}
                className={cn(
                    'flex items-center justify-center rounded-[22%] aspect-square relative overflow-hidden will-change-transform',
                    isActive ? '-translate-y-2' : 'hover:-translate-y-1'
                )}
                whileTap={{ scale: 0.88 }} layout={false}>
                <div className="absolute inset-0" style={{ background: item.bg, opacity: isActive ? 1 : 0.92 }} />
                <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)' }} />
                <div className="absolute inset-x-0 bottom-0 h-[30%] pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 100%)' }} />
                {isActive && <div className="absolute inset-0 rounded-[22%] pointer-events-none"
                    style={{ boxShadow: `0 0 20px 4px ${item.shadow}60, inset 0 0 8px 1px rgba(255,255,255,0.15)` }} />}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        boxShadow: isActive
                            ? `0 8px 24px -4px ${item.shadow}50, 0 4px 10px -2px ${item.shadow}30`
                            : `0 4px 14px -3px ${item.shadow}35, 0 2px 6px -2px rgba(0,0,0,0.25)`
                    }} />
                <Icon className="relative z-10 w-[46%] h-[46%] text-white" strokeWidth={2}
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
            </motion.div>
            <AnimatePresence>
                {isHovered && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.85 }} animate={{ opacity: 1, y: -24, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.9 }} transition={{ duration: 0.15 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <div className="px-3 py-1.5 rounded-lg shadow-2xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(15,15,25,0.96), rgba(25,25,40,0.96))',
                                border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)'
                            }}>
                            <span className="text-[11px] font-semibold text-white whitespace-nowrap tracking-wide">{item.name}</span>
                        </div>
                        <div className="w-2 h-2 mx-auto -mt-1 rotate-45"
                            style={{
                                background: 'rgba(20,20,35,0.96)', border: '1px solid rgba(255,255,255,0.12)',
                                borderTop: 'none', borderLeft: 'none'
                            }} />
                    </motion.div>
                )}
            </AnimatePresence>
            {isActive && (
                <motion.div layoutId="dock-active-dot" className="absolute -bottom-2 w-1.5 h-1.5 rounded-full"
                    style={{
                        background: `radial-gradient(circle, white 30%, ${item.shadow} 100%)`,
                        boxShadow: `0 0 6px 1px ${item.shadow}80`
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
            )}
        </Link>
    )
})

// ─── MOBILE SIDEBAR (Slide-out drawer navigation) ──────────────────────
function MobileSidebar({ pathname }: { pathname: string }) {
    const [isOpen, setIsOpen] = useState(false)

    // Close on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <>
            {/* Hamburger Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 z-50 h-12 w-12 rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-transform touch-manipulation"
                style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                    boxShadow: '0 8px 25px -4px rgba(124,58,237,0.5), 0 4px 12px -2px rgba(0,0,0,0.3)',
                }}
                aria-label="Open navigation menu"
            >
                <Menu className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                        className="fixed top-0 left-0 bottom-0 z-[70] w-[280px] sm:w-[320px] flex flex-col"
                        style={{
                            background: 'linear-gradient(180deg, rgba(12,12,20,0.98) 0%, rgba(6,6,14,0.99) 100%)',
                            borderRight: '1px solid rgba(255,255,255,0.06)',
                            boxShadow: '8px 0 40px -8px rgba(0,0,0,0.6)',
                        }}
                    >
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white leading-tight">Ganapathi AI</h2>
                                    <p className="text-[10px] text-white/40 font-medium">Navigation</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 active:scale-90 transition-all touch-manipulation"
                                aria-label="Close navigation"
                            >
                                <X className="w-4 h-4 text-white/70" />
                            </button>
                        </div>

                        {/* Navigation List */}
                        <nav className="flex-1 overflow-y-auto py-2 px-3 overscroll-y-contain" role="navigation" aria-label="Main navigation"
                            style={{ WebkitOverflowScrolling: 'touch' }}>
                            <div className="space-y-0.5">
                                {navigation.map((item) => {
                                    const isActive = item.href === '/dashboard'
                                        ? pathname === '/dashboard'
                                        : pathname.startsWith(item.href);
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 touch-manipulation active:scale-[0.97] group',
                                                isActive
                                                    ? 'bg-white/10 shadow-md'
                                                    : 'hover:bg-white/5 active:bg-white/8'
                                            )}
                                            style={isActive ? { boxShadow: `0 2px 12px -3px ${item.shadow}40` } : undefined}
                                        >
                                            {/* Icon with gradient */}
                                            <div
                                                className={cn(
                                                    'flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 relative overflow-hidden',
                                                    isActive ? 'shadow-md' : 'opacity-80 group-hover:opacity-100 group-active:opacity-100'
                                                )}
                                                style={{ background: item.bg }}
                                            >
                                                <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
                                                    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%)' }} />
                                                <Icon className="relative z-10 w-4 h-4 text-white" strokeWidth={2} />
                                            </div>

                                            {/* Label */}
                                            <span className={cn(
                                                'text-[13px] font-semibold flex-1 truncate',
                                                isActive ? 'text-white' : 'text-white/65 group-hover:text-white/85'
                                            )}>
                                                {item.name}
                                            </span>

                                            {/* Active indicator */}
                                            {isActive && (
                                                <ChevronRight className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="px-4 py-3 border-t border-white/6">
                            <p className="text-[10px] text-white/30 text-center font-medium">
                                Built by G R Harsha
                            </p>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    )
}

// ─── Main Dock Component ───────────────────────────────────────────────
export function DashboardDock() {
    const mouseX = useMotionValue(Infinity)
    const pathname = usePathname()
    const isMobile = useIsMobile()

    const onMouseMove = useCallback((e: React.MouseEvent) => { mouseX.set(e.pageX) }, [mouseX])
    const onMouseLeave = useCallback(() => { mouseX.set(Infinity) }, [mouseX])

    // Mobile / Tablet: slide-out sidebar with hamburger
    if (isMobile) {
        return <MobileSidebar pathname={pathname} />
    }

    // Desktop: full magnification dock at the bottom
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-full max-w-full pointer-events-none">
            <motion.nav onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
                className="pointer-events-auto flex items-end gap-[6px] px-3 pb-3 pt-3 mx-4 rounded-[20px] overflow-x-auto scrollbar-none"
                style={{
                    background: 'linear-gradient(180deg, rgba(30,30,45,0.75) 0%, rgba(10,10,20,0.85) 100%)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 20px 60px -12px rgba(0,0,0,0.6), 0 4px 20px -4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
                role="menubar" aria-label="Main navigation dock"
                initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.05 }}>
                {navigation.map((item) => {
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href);
                    return <DesktopDockIcon key={item.href} item={item} mouseX={mouseX} isActive={isActive} />
                })}
            </motion.nav>
        </div>
    )
}
