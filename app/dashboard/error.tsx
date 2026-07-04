'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Dashboard Enterprise Error Boundary Catch:", error);
    }, [error]);

    return (
        <div className="min-h-[80vh] w-full flex items-center justify-center p-6 contain-strict relative">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative z-10 max-w-lg w-full"
            >
                <div className="bg-background/40 backdrop-blur-3xl border border-destructive/20 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-red-500/10 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 border border-destructive/20 shadow-inner">
                        <AlertCircle className="w-10 h-10 text-destructive animate-pulse" />
                    </div>
                    
                    <h2 className="text-3xl font-black tracking-tight mb-3">System Exception</h2>
                    <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                        A critical interruption occurred within the workspace module. 
                        Our systems have logged the anomaly. Please re-sync or return to base.
                    </p>

                    <div className="w-full bg-black/40 rounded-xl p-4 mb-8 text-left border border-white/5 overflow-x-auto">
                        <code className="text-xs text-red-300/80 font-mono">
                            {error.message || "Unknown rendering exception"}
                            {error.digest && <span className="block mt-2 text-white/30 text-[10px]">Digest: {error.digest}</span>}
                        </code>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                        <Button 
                            variant="default" 
                            size="lg" 
                            onClick={() => reset()}
                            className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 rounded-xl h-12 px-8 font-bold"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Attempt Recovery
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={() => router.push('/dashboard')}
                            className="w-full sm:w-auto rounded-xl h-12 px-8 border-white/10 hover:bg-white/5 font-bold"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Return Home
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
