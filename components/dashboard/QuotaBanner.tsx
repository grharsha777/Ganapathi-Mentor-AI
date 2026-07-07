'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuotaBanner() {
    const [quota, setQuota] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Fetch quota status on mount
        fetch('/api/quota')
            .then(res => res.json())
            .then(data => {
                if (data?.quota) {
                    setQuota(data.quota);
                }
            })
            .catch(err => console.error('Failed to fetch quota:', err));
    }, []);

    if (!quota || !isVisible) return null;

    // Find the feature with the highest usage percentage
    let maxFeature = { name: '', percent: 0, limit: 0, used: 0 };
    Object.entries(quota).forEach(([name, data]: [string, any]) => {
        if (data.percent > maxFeature.percent) {
            maxFeature = { name, ...data };
        }
    });

    if (maxFeature.percent < 50) return null; // Only show if any feature is >= 50%

    const isCritical = maxFeature.percent >= 100;
    const isWarning = maxFeature.percent >= 90;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`w-full text-white px-4 py-3 flex items-center justify-between text-sm shadow-md z-50 relative ${isCritical ? 'bg-red-600' : isWarning ? 'bg-orange-500' : 'bg-amber-500 text-amber-950'}`}
            >
                <div className="flex items-center gap-3">
                    {isCritical ? <XCircle className="w-5 h-5 text-white" /> : isWarning ? <AlertTriangle className="w-5 h-5 text-white" /> : <Info className="w-5 h-5 text-amber-950" />}
                    <div>
                        <span className="font-semibold">
                            {isCritical ? 'Quota Exceeded' : isWarning ? 'Approaching Limit' : 'Usage Update'}
                        </span>
                        <span className="mx-2 hidden sm:inline">•</span>
                        <span className={`hidden sm:inline ${!isCritical && !isWarning ? 'text-amber-900' : 'text-white/90'}`}>
                            You have used {maxFeature.percent}% of your monthly {maxFeature.name} quota ({maxFeature.used}/{maxFeature.limit}).
                        </span>
                    </div>
                </div>
                {!isCritical && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsVisible(false)}
                        className={`h-8 px-3 rounded-full hover:bg-white/20 ${!isCritical && !isWarning ? 'text-amber-950 hover:text-amber-950' : 'text-white'}`}
                    >
                        Dismiss
                    </Button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
