'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLoading() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl">
            {/* Cinematic Background Artifacts */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col items-center z-10"
            >
                {/* Enterprise Glass Loader */}
                <div className="relative w-24 h-24 mb-8">
                    {/* Outer Rotating Ring */}
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500/40"
                    />
                    <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-400/60"
                    />
                    
                    {/* Inner Glowing Core */}
                    <div className="absolute inset-6 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.6)] animate-pulse" style={{ animationDuration: '2s' }} />
                </div>

                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight mb-2">
                        Initializing Workspace
                    </h2>
                    <p className="text-sm font-medium tracking-widest uppercase text-indigo-300/60 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                        Syncing Neural Nodes
                    </p>
                </div>

                {/* Progress Line */}
                <div className="w-64 h-1 bg-white/5 rounded-full mt-8 overflow-hidden">
                    <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                    />
                </div>
            </motion.div>
        </div>
    );
}
