'use client'

import { useRef, useState, memo, useCallback } from 'react'
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
    LayoutDashboard,
    BookOpen,
    Code,
    Lightbulb,
    CheckCircle,
    FileText,
    Github,
    Activity,
    AlertTriangle,
    Users,
    Search,
    Image as ImageIcon,
    Zap,
    GraduationCap,
    Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, gradient: 'from-violet-600 to-indigo-600' },
    { name: 'Learning', href: '/dashboard/learning', icon: BookOpen, gradient: 'from-orange-500 to-amber-500' },
    { name: 'Review', href: '/dashboard/code-review', icon: Code, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Concepts', href: '/dashboard/concepts', icon: Lightbulb, gradient: 'from-yellow-400 to-orange-400' },
    { name: 'Tasks', href: '/dashboard/tools/productivity', icon: CheckCircle, gradient: 'from-emerald-500 to-green-600' },
    { name: 'Docs', href: '/dashboard/tools/docs', icon: FileText, gradient: 'from-pink-500 to-rose-500' },
    { name: 'GitHub', href: '/dashboard/github', icon: Github, gradient: 'from-gray-700 to-gray-900' },
    { name: 'Analytics', href: '/dashboard/analytics/performance', icon: Activity, gradient: 'from-blue-600 to-indigo-700' },
    { name: 'Anomalies', href: '/dashboard/analytics/anomalies', icon: AlertTriangle, gradient: 'from-red-500 to-rose-600' },
    { name: 'Collab', href: '/dashboard/collaboration', icon: Users, gradient: 'from-purple-500 to-fuchsia-500' },
    { name: 'Research', href: '/dashboard/research', icon: Search, gradient: 'from-teal-500 to-cyan-600' },
    { name: 'Studio', href: '/dashboard/media/studio', icon: ImageIcon, gradient: 'from-fuchsia-600 to-pink-600' },
    { name: 'Quick', href: '/dashboard/last-minute', icon: Zap, gradient: 'from-yellow-500 to-amber-600' },
    { name: 'Training', href: '/dashboard/specialized', icon: GraduationCap, gradient: 'from-sky-500 to-blue-600' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, gradient: 'from-slate-600 to-slate-800' },
] as const

// Memoized DockIcon to prevent unnecessary re-renders
const DockIcon = memo(function DockIcon({
    item,
    mouseX,
    isActive,
}: {
    item: (typeof navigation)[number]
    mouseX: MotionValue<number>
    isActive: boolean
}) {
    const ref = useRef<HTMLDivElement>(null)

    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
        return val - bounds.x - bounds.width / 2
    })

    // Ultra-smooth spring: high stiffness for snap, moderate damping for no oscillation
    const widthSync = useTransform(distance, [-150, 0, 150], [48, 80, 48])
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 260, damping: 18 })

    const [isHovered, setIsHovered] = useState(false)
    const Icon = item.icon

    const onEnter = useCallback(() => setIsHovered(true), [])
    const onLeave = useCallback(() => setIsHovered(false), [])

    return (
        <Link
            href={item.href}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="group relative flex flex-col items-center justify-end mb-[2px]"
            role="menuitem"
            aria-label={item.name}
        >
            <motion.div
                ref={ref}
                style={{ width, height: width }}
                className={cn(
                    'flex items-center justify-center rounded-[22%] aspect-square',
                    'shadow-lg relative overflow-hidden gpu-accelerated',
                    isActive ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1'
                )}
                whileTap={{ scale: 0.88 }}
                layout={false}
            >
                {/* Colorful gradient background */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br",
                    item.gradient,
                    isActive ? 'opacity-100 shadow-lg' : 'opacity-85 group-hover:opacity-100'
                )} />

                {/* iOS glossy shine overlay */}
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent" />

                <Icon
                    className="relative z-10 w-[50%] h-[50%] text-white drop-shadow-sm"
                    strokeWidth={1.8}
                />
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: -22, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-gray-900/95 border border-white/15 backdrop-blur-md shadow-xl z-50 pointer-events-none"
                    >
                        <span className="text-[11px] font-semibold text-white whitespace-nowrap">
                            {item.name}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active dot indicator */}
            {isActive && (
                <motion.div
                    layoutId="dock-active-dot"
                    className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-white/60"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
            )}
        </Link>
    )
})

export function DashboardDock() {
    const mouseX = useMotionValue(Infinity)
    const pathname = usePathname()

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        mouseX.set(e.pageX)
    }, [mouseX])

    const onMouseLeave = useCallback(() => {
        mouseX.set(Infinity)
    }, [mouseX])

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-full max-w-full pointer-events-none">
            <motion.nav
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                className={cn(
                    'pointer-events-auto',
                    'flex items-end gap-2 px-3 pb-2.5 pt-2.5 mx-4',
                    'bg-black/50 backdrop-blur-md border border-white/8',
                    'rounded-2xl shadow-2xl shadow-black/40',
                    'overflow-x-auto scrollbar-none',
                    'gpu-accelerated'
                )}
                role="menubar"
                aria-label="Main navigation dock"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.05 }}
            >
                {navigation.map((item) => {
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href);

                    return (
                        <DockIcon
                            key={item.href}
                            item={item}
                            mouseX={mouseX}
                            isActive={isActive}
                        />
                    )
                })}
            </motion.nav>
        </div>
    )
}
