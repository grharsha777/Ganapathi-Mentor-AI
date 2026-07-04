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
    Menu, X, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
// High-fidelity SVG Logos for real app experience
const AppIcons = {
    Dashboard: () => (
        <div className="w-full h-full relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(0,122,255,0.4)]">
                <defs>
                    <linearGradient id="ios-home-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1DA1F2" />
                        <stop offset="100%" stopColor="#007AFF" />
                    </linearGradient>
                    <filter id="white-glow">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feComponentTransfer><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
                        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#ios-home-grad)" />
                <path d="M512 220L212 460v344h200v-240h200v240h200V460L512 220z" fill="#fff" filter="url(#white-glow)" />
                <path d="M512 220l300 240H212z" fill="rgba(255,255,255,0.3)" />
            </svg>
        </div>
    ),
    Learning: () => (
        <div className="w-full h-full relative group">
             <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(255,149,0,0.4)]">
                <defs>
                    <linearGradient id="learn-grad-vibrant" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFCC00" />
                        <stop offset="100%" stopColor="#FF9500" />
                    </linearGradient>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#learn-grad-vibrant)" />
                <path d="M512 280L162 455l350 175 350-175L512 280z" fill="#fff" />
                <path d="M162 530v140l350 175 350-175v-140l-350 175L162 530z" fill="rgba(255,255,255,0.85)" />
            </svg>
        </div>
    ),
    VSCode: () => (
        <div className="w-full h-full p-1 relative group">
            <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_12px_24px_rgba(0,101,169,0.5)] transform scale-110">
                <path d="M78.6,83.4L64.2,71.2L42.5,88L20.8,81.4L6.9,71.4V28.6l13.9-10l21.7-6.5l21.7,16.8l14.4-12.2l8.4,5V78.4L78.6,83.4z M20.8,61.4l21.7,9.8V28.8L20.8,38.6V61.4z" fill="#007ACC" />
                <path d="M78.6,83.4V16.6l14.4,12.2v42.4L78.6,83.4z" fill="#0065A9" />
                <path d="M64.2,71.2V28.8l14.4-12.2v66.8L64.2,71.2z" fill="#1F9CF0" />
            </svg>
        </div>
    ),
    Notion: () => (
        <div className="w-full h-full p-0 relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-2xl">
                <rect width="1024" height="1024" rx="220" fill="#fff" stroke="#000" strokeWidth="10" />
                <path d="M256 256h512v512H256V256zm64 64v384h384V320H320zm64 64h256v64H384v-64zm0 128h256v64H384v-64zm0 128h128v64H384v-64z" fill="#000" />
            </svg>
        </div>
    ),
    Linear: () => (
        <div className="w-full h-full p-0 relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(94,106,210,0.5)]">
                <defs>
                    <linearGradient id="linear-grad-vibrant" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8795FF" />
                        <stop offset="100%" stopColor="#4B51C1" />
                    </linearGradient>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#linear-grad-vibrant)" />
                <path d="M300 500l150 150 300-300" stroke="#fff" strokeWidth="120" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    ),
    GoogleDocs: () => (
        <div className="w-full h-full p-0 relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-xl">
                <rect width="1024" height="1024" rx="220" fill="#4285F4" />
                <path d="M300 200h350l150 150v474H300V200z" fill="#fff" />
                <path d="M650 200v150h150L650 200z" fill="#ADCEFA" />
                <path d="M400 480h250v60H400v-60zM400 600h250v60H400v-60zM400 720h150v60H400v-60z" fill="#4285F4" fillOpacity="0.8" />
            </svg>
        </div>
    ),
    GitHub: () => (
        <div className="w-full h-full p-0 relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 fill-white drop-shadow-[0_15px_30px_rgba(255,255,255,0.25)]">
                <defs>
                    <linearGradient id="github-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#333" />
                        <stop offset="100%" stopColor="#000" />
                    </linearGradient>
                </defs>
                <circle cx="512" cy="512" r="480" fill="url(#github-grad)" />
                <path d="M512 128C300.2 128 128 300.2 128 512c0 169.5 110.1 313.2 262.2 363.8 19.2 3.5 26.2-8.3 26.2-18.5 0-9.1-.4-33.1-.6-65-106.8 23.2-129.3-51.5-129.3-51.5-17.5-44.4-42.7-56.2-42.7-56.2-34.9-23.8 2.6-23.3 2.6-23.3 38.6 2.7 58.9 39.6 58.9 39.6 34.3 58.7 89.9 41.7 111.8 31.9 3.5-24.8 13.4-41.7 24.4-51.3-85.3-9.7-175-42.7-175-189.9 0-41.9 14.9-76.3 39.5-103.1-4-9.7-17.1-48.8 3.8-101.7 0 0 32.2-10.3 105.6 39.4 30.6-8.5 63.4-12.8 96-12.9 32.6 0 65.4 4.4 96 12.9 73.3-49.7 105.5-39.4 105.5-39.4 20.9 52.9 7.8 92 3.8 101.7 24.6 26.8 39.5 61.2 39.5 103.1 0 147.6-90 179.9-175.7 189.4 13.8 11.9 26.1 35.5 26.1 71.5 0 51.6-.5 93.2-.5 105.9 0 10.3 6.9 22.2 26.4 18.4C785.9 825.1 896 681.4 896 512c0-211.8-172.2-384-384-384z" />
            </svg>
        </div>
    ),
    Research: () => (
        <div className="w-full h-full relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(45,212,191,0.4)]">
                <defs>
                    <linearGradient id="res-grad-vibrant" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4ADE80" />
                        <stop offset="100%" stopColor="#0D9488" />
                    </linearGradient>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#res-grad-vibrant)" />
                <circle cx="450" cy="450" r="180" stroke="#fff" strokeWidth="80" fill="none" />
                <line x1="600" y1="600" x2="800" y2="800" stroke="#fff" strokeWidth="120" strokeLinecap="round" />
            </svg>
        </div>
    ),
    News: () => (
        <div className="w-full h-full relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(239,68,68,0.4)]">
                <defs>
                    <linearGradient id="news-grad-vibrant" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF4B4B" />
                        <stop offset="100%" stopColor="#B91C1C" />
                    </linearGradient>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#news-grad-vibrant)" />
                <rect x="200" y="300" width="624" height="424" rx="40" fill="#fff" />
                <path d="M280 420h464v40H280v-40zm0 100h464v40H280v-40zm0 100h300v40H280v-40z" fill="#333" />
            </svg>
        </div>
    ),
    Studio: () => (
        <div className="w-full h-full relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(168,85,247,0.4)]">
                <defs>
                    <linearGradient id="studio-grad-vibrant" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#D946EF" />
                        <stop offset="100%" stopColor="#7E22CE" />
                    </linearGradient>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#studio-grad-vibrant)" />
                <path d="M350 320l380 192-380 192V320z" fill="#fff" />
            </svg>
        </div>
    ),
    LeetCode: () => (
        <div className="w-full h-full p-1 relative group">
            <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_15px_35px_rgba(255,161,22,0.5)]">
                <rect width="100" height="100" rx="22" fill="#2c2c2c" />
                <path d="M42.5 83.5L25 66l17.5-17.5 10.5 10.5-7 7L42.5 69.5l10.5 10.5 14-14L56.5 55.5l7-7L81 66 42.5 104.5V83.5zM25 66L7.5 48.5 25 31l10.5 10.5L25 52l10.5 10.5-7 7L25 66z" fill="#FFA116" />
                <path d="M42.5 48.5L25 31l17.5-17.5L81 51.5l-17.5 17.5L42.5 48.5z" fill="#FFA116" />
            </svg>
        </div>
    ),
    Interview: () => (
        <div className="w-full h-full relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(139,92,246,0.4)]">
                <defs>
                    <linearGradient id="int-grad-vibrant" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#C084FC" />
                        <stop offset="100%" stopColor="#6D28D9" />
                    </linearGradient>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#int-grad-vibrant)" />
                <rect x="250" y="380" width="350" height="264" rx="40" fill="#fff" />
                <path d="M600 512l150-100v200L600 512z" fill="#fff" />
            </svg>
        </div>
    ),
    Collab: () => (
        <div className="w-full h-full relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(6,182,212,0.4)]">
                <defs>
                    <linearGradient id="coll-grad-vibrant" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22D3EE" />
                        <stop offset="100%" stopColor="#0891B2" />
                    </linearGradient>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#coll-grad-vibrant)" />
                <circle cx="380" cy="420" r="120" fill="#fff" />
                <circle cx="644" cy="420" r="120" fill="#fff" fillOpacity="0.75" />
                <path d="M220 750c0-100 80-180 160-180s160 80 160 180H220zm260-180c40 0 76 15 106 40 40-100 120-160 198-160s158 60 198 160H480z" fill="#fff" />
            </svg>
        </div>
    ),
    Portfolio: () => (
        <div className="w-full h-full relative group shadow-2xl">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(244,63,94,0.4)]">
                <defs>
                    <linearGradient id="port-grad-vibrant" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FB7185" />
                        <stop offset="100%" stopColor="#E11D48" />
                    </linearGradient>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#port-grad-vibrant)" />
                <circle cx="512" cy="512" r="280" fill="none" stroke="#fff" strokeWidth="80" />
                <circle cx="512" cy="512" r="120" fill="#fff" />
            </svg>
        </div>
    ),
    QuickPrep: () => (
        <div className="w-full h-full relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(250,204,21,0.5)]">
                <defs>
                    <linearGradient id="zap-grad-vibrant" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FDE047" />
                        <stop offset="100%" stopColor="#EAB308" />
                    </linearGradient>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#zap-grad-vibrant)" />
                <path d="M600 150L250 580h250v294l350-430H600V150z" fill="#fff" />
            </svg>
        </div>
    ),
    Training: () => (
        <div className="w-full h-full relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(14,165,233,0.4)]">
                <defs>
                    <linearGradient id="train-grad-vibrant" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#7DD3FC" />
                        <stop offset="100%" stopColor="#0369A1" />
                    </linearGradient>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#train-grad-vibrant)" />
                <path d="M512 300l-300 150 300 150 300-150-300-150z" fill="#fff" />
                <path d="M212 550v100l300 150 300-150v-100l-300 150-300-150z" fill="rgba(255,255,255,0.8)" />
            </svg>
        </div>
    ),
    Docker: () => (
        <div className="w-full h-full p-0 relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_15px_30px_rgba(36,150,237,0.5)] transform scale-105">
                <rect width="1024" height="1024" rx="220" fill="#2496ED" />
                <path d="M960 460c-12-12-28-15-45-15h-5C890 360 815 315 725 315c-8 0-15 0-20 2-15-65-68-112-135-112h-30v140c0 8 8 15 15 15h15l15-15v-100h15c45 0 85 35 95 80 0 5-2 12-5 15l-15 15h30c70 0 135 32 165 95C925 455 950 452 960 460z M35 515h110v-110h-110v110z M165 515h110v-110h-110v110z M295 515h110v-110h-110v110z M425 515h110v-110h-110v110z M165 645h110v-110h-110v110z M295 645h110v-110h-110v110z M425 645h110v-110h-110v110z M555 645h110v-110h-110v110z M555 515h110v-110h-110v110z" fill="#fff" />
                <circle cx="925" cy="637" r="122" fill="#fff" />
                <path d="M1024 0L0 1024" stroke="rgba(255,255,255,0.05)" strokeWidth="40" />
            </svg>
        </div>
    ),
    SystemSettings: () => (
        <div className="w-full h-full relative group">
            <svg viewBox="0 0 1024 1024" className="w-full h-full relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
                <defs>
                    <linearGradient id="ios-gear-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#E5E7EB" />
                        <stop offset="100%" stopColor="#9CA3AF" />
                    </linearGradient>
                </defs>
                <rect width="1024" height="1024" rx="220" fill="url(#ios-gear-grad)" />
                <circle cx="512" cy="512" r="320" fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.2)" strokeWidth="40" />
                <circle cx="512" cy="512" r="120" fill="#4B5563" />
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
                    <rect key={deg} x="472" y="180" width="80" height="150" rx="10" fill="#6B7280" transform={`rotate(${deg}, 512, 512)`} />
                ))}
                <path d="M1024 0L0 1024" stroke="rgba(255,255,255,0.1)" strokeWidth="40" />
            </svg>
        </div>
    )
};

const navigation = [
    { name: 'Dashboard', href: '/dashboard', renderIcon: AppIcons.Dashboard, shadow: '#007AFF' },
    { name: 'Learning', href: '/dashboard/learning', renderIcon: AppIcons.Learning, shadow: '#F97316' },
    { name: 'Review', href: '/dashboard/code-review', renderIcon: AppIcons.VSCode, shadow: '#007ACC' },
    { name: 'Concepts', href: '/dashboard/concepts', renderIcon: AppIcons.Notion, shadow: '#ffffff' },
    { name: 'Tasks', href: '/dashboard/tools/productivity', renderIcon: AppIcons.Linear, shadow: '#5E6AD2' },
    { name: 'Docs', href: '/dashboard/tools/docs', renderIcon: AppIcons.GoogleDocs, shadow: '#4285F4' },
    { name: 'GitHub', href: '/dashboard/github', renderIcon: AppIcons.GitHub, shadow: '#ffffff' },
    { name: 'Research', href: '/dashboard/research', renderIcon: AppIcons.Research, shadow: '#14B8A6' },
    { name: 'News', href: '/dashboard/news', renderIcon: AppIcons.News, shadow: '#EF4444' },
    { name: 'Studio', href: '/dashboard/media/studio', renderIcon: AppIcons.Studio, shadow: '#D946EF' },
    { name: 'Challenges', href: '/dashboard/challenges', renderIcon: AppIcons.LeetCode, shadow: '#FFA116' },
    { name: 'Interview', href: '/dashboard/interview', renderIcon: AppIcons.Interview, shadow: '#8B5CF6' },
    { name: 'CodeCollab', href: '/dashboard/collab', renderIcon: AppIcons.Collab, shadow: '#06B6D4' },
    { name: 'Portfolio', href: '/dashboard/portfolio', renderIcon: AppIcons.Portfolio, shadow: '#F43F5E' },
    { name: 'Quick Prep', href: '/dashboard/last-minute', renderIcon: AppIcons.QuickPrep, shadow: '#EAB308' },
    { name: 'Training', href: '/dashboard/specialized', renderIcon: AppIcons.Training, shadow: '#0284C7' },
    { name: 'DevOps', href: '/dashboard/devops-studio', renderIcon: AppIcons.Docker, shadow: '#2496ED' },
    { name: 'Settings', href: '/dashboard/settings', renderIcon: AppIcons.SystemSettings, shadow: '#9CA3AF' },
] as const;


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
    const widthSync = useTransform(distance, [-150, 0, 150], [42, 90, 42])
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 260, damping: 18 })
    const [isHovered, setIsHovered] = useState(false)
    const IconRender = item.renderIcon

    return (
        <Link href={item.href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex flex-col items-center justify-end mb-[4px] px-0.5"
            role="menuitem" aria-label={item.name}>
            <motion.div ref={ref} style={{ width, height: width }}
                className={cn(
                    'flex items-center justify-center relative will-change-transform transition-transform duration-300',
                    isActive ? '-translate-y-4' : 'hover:-translate-y-2'
                )}
                whileTap={{ scale: 0.85 }} layout={false}>
                
                {/* Free Floating Shape Renderer */}
                <div className={cn(
                    "w-full h-full transition-all duration-500 ease-out flex items-center justify-center",
                    (isActive || isHovered) ? "drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] scale-110" : "drop-shadow-[0_5px_10px_rgba(0,0,0,0.2)]"
                )}>
                    <IconRender />
                </div>

                {/* Active Indicator Pulse */}
                {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse" />
                )}
            </motion.div>

            {/* Enterprise Minimalist Tooltip (Feature Text) */}
            <AnimatePresence mode="wait">
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                        animate={{ opacity: 1, y: -52, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }} 
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute left-1/2 -translate-x-1/2 z-[1000] pointer-events-none"
                    >
                        <div className="relative px-3 py-1.5 rounded-xl border border-white/10 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.6)]"
                            style={{
                                background: 'rgba(5, 5, 10, 0.85)',
                                backdropFilter: 'blur(20px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            }}>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                            <span className="relative z-10 text-[11px] font-semibold text-white/95 whitespace-nowrap tracking-[0.18em] uppercase">
                                {item.name}
                            </span>
                        </div>
                        {/* Subtler Triangle */}
                        <div className="w-2.5 h-2.5 bg-white/5 mx-auto -mt-1 rotate-45 border-r border-b border-white/10 backdrop-blur-3xl" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Active Dot & Glass Reflection Floor */}
            {isActive && (
                <>
                    {/* Reflection */}
                    <div className="absolute -bottom-8 w-full h-4 bg-white/5 blur-md rounded-full scale-y-50 pointer-events-none" />
                    <motion.div layoutId="dock-active-dot" className="absolute -bottom-2 w-1.5 h-1.5 rounded-full"
                        style={{
                            background: `radial-gradient(circle, #fff 20%, ${item.shadow} 100%)`,
                            boxShadow: `0 0 10px 2px ${item.shadow}80, 0 0 20px ${item.shadow}40`
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
                </>
            )}
        </Link>
    )
})

// ─── MOBILE SIDEBAR (Slide-out drawer navigation) ──────────────────────
function MobileSidebar({ pathname }: { pathname: string }) {
    const [isOpen, setIsOpen] = useState(false)

    // Close on route change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
                                    const IconRender = item.renderIcon;

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
                                                    'flex items-center justify-center w-11 h-11 rounded-[22%] flex-shrink-0 relative transition-transform duration-300',
                                                    isActive ? 'shadow-lg ring-1 ring-white/30 scale-105' : 'opacity-85 group-hover:opacity-100'
                                                )}
                                            >
                                                <div className="w-[85%] h-[85%] flex items-center justify-center">
                                                    <IconRender />
                                                </div>
                                            </div>

                                            {/* Label */}
                                            <span className={cn(
                                                'text-[14px] font-bold flex-1 truncate tracking-tight',
                                                isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                                            )}>
                                                {item.name}
                                            </span>

                                            {/* Active indicator */}
                                            {isActive && (
                                                <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
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
    const [isHoveredBottom, setIsHoveredBottom] = useState(false)
    const isHiveIDE = pathname?.includes('/dashboard/tools/hive-mind')

    const onMouseMove = useCallback((e: React.MouseEvent) => { mouseX.set(e.pageX) }, [mouseX])
    const onMouseLeave = useCallback(() => { mouseX.set(Infinity) }, [mouseX])

    // Mobile / Tablet: slide-out sidebar with hamburger
    if (isMobile) {
        return <MobileSidebar pathname={pathname} />
    }

    // Desktop: full magnification dock at the bottom
    return (
        <div 
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none pb-4"
            onMouseEnter={() => setIsHoveredBottom(true)}
            onMouseLeave={() => setIsHoveredBottom(false)}
        >
            {/* Hover Trigger Zone (Invisible) */}
            <div className="absolute bottom-0 h-20 w-full pointer-events-auto z-[-1]" />

            <motion.nav 
                onMouseMove={onMouseMove} 
                onMouseLeave={onMouseLeave}
                className="pointer-events-auto flex items-end gap-[4px] px-3 pb-3 pt-3 mx-4 rounded-[24px] max-w-full relative"
                style={{
                    background: 'linear-gradient(180deg, rgba(30,30,45,0.75) 0%, rgba(10,10,20,0.85) 100%)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 20px 60px -12px rgba(0,0,0,0.6), 0 4px 20px -4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
                role="menubar" 
                aria-label="Main navigation dock"
                initial={false}
                animate={{ 
                    y: isHiveIDE && !isHoveredBottom ? 120 : 0,
                    opacity: isHiveIDE && !isHoveredBottom ? 0 : 1,
                    scale: isHiveIDE && !isHoveredBottom ? 0.95 : 1
                }}
                transition={{ 
                    type: 'spring', 
                    stiffness: 260, 
                    damping: 25,
                }}
            >
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
