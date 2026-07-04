'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Copy, Check, ExternalLink, ImageIcon, Zap, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface LogoMeta {
    ticker: string;
    name: string;
    image: string;
}

const googleFavicon = (domain: string) => `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`;

const DEFAULT_BRANDS: LogoMeta[] = [
    { name: 'Apple', ticker: 'AAPL', image: googleFavicon('apple.com') },
    { name: 'Microsoft', ticker: 'MSFT', image: googleFavicon('microsoft.com') },
    { name: 'Google', ticker: 'GOOGL', image: googleFavicon('google.com') },
    { name: 'Amazon', ticker: 'AMZN', image: googleFavicon('amazon.com') },
    { name: 'Meta', ticker: 'META', image: googleFavicon('meta.com') },
    { name: 'OpenAI', ticker: 'AI', image: googleFavicon('openai.com') },
    { name: 'Stripe', ticker: 'STRIPE', image: googleFavicon('stripe.com') },
    { name: 'Nvidia', ticker: 'NVDA', image: googleFavicon('nvidia.com') },
    { name: 'Tesla', ticker: 'TSLA', image: googleFavicon('tesla.com') },
    { name: 'Netflix', ticker: 'NFLX', image: googleFavicon('netflix.com') },
    { name: 'Spotify', ticker: 'SPOT', image: googleFavicon('spotify.com') },
    { name: 'Vercel', ticker: 'VERCEL', image: googleFavicon('vercel.com') },
];

export function BrandAssets() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [logos, setLogos] = useState<LogoMeta[]>(DEFAULT_BRANDS);
    const [searched, setSearched] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) {
            setLogos(DEFAULT_BRANDS);
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/assets/logo?name=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            // API Ninjas typically returns array of matches
            setLogos(Array.isArray(data) ? data : (data.image ? [data] : []));
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch logos');
            setLogos([]);
        } finally {
            setLoading(false);
        }
    };

    const copyMarkdown = (logo: LogoMeta, idx: number) => {
        const md = `![${logo.name} Logo](${logo.image})`;
        navigator.clipboard.writeText(md);
        setCopiedIdx(idx);
        toast.success('Copied Markdown snippet');
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const copyUrl = (logo: LogoMeta, idx: number) => {
        navigator.clipboard.writeText(logo.image);
        setCopiedIdx(idx + 1000);
        toast.success('Copied Image URL');
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    return (
        <div className="space-y-10 animate-fade-in pb-16">
            {/* Cinematic Search Header Zone */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#09090b] border border-white/10 p-8 sm:p-16 text-center shadow-2xl">
                {/* Background Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-cyan-500/20 blur-[100px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />
                
                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    <div className="mx-auto w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.4)] border border-white/20 mb-6 group hover:scale-105 transition-transform">
                        <Zap className="h-10 w-10 text-white fill-white/20 group-hover:fill-white/40 transition-colors" />
                    </div>
                    
                    <div className="space-y-4">
                        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 tracking-tight">
                            Global Brand Assets
                        </h1>
                        <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto font-medium">
                            Instantly source high-resolution, production-ready logos for any enterprise entity, SaaS framework, or global corporation.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-10 relative">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-20 group-focus-within:opacity-40 transition-opacity" />
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                                <Input
                                    placeholder="Search 'Stripe', 'AWS', 'Spotify'..."
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        if (e.target.value === '') {
                                            setLogos(DEFAULT_BRANDS);
                                            setSearched(false);
                                        }
                                    }}
                                    className="pl-14 h-16 w-full bg-[#111113]/90 backdrop-blur-xl border-white/10 text-xl font-medium rounded-2xl focus-visible:ring-1 focus-visible:ring-cyan-500/50 shadow-inner text-white placeholder:text-white/30 transition-all hover:bg-[#111113]"
                                />
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={loading || !query.trim()}
                            className="h-16 px-10 bg-white text-black hover:bg-white/90 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all font-bold text-lg relative overflow-hidden group/btn disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Retrieve'}
                            </span>
                        </Button>
                    </form>
                    
                    {/* Status trust bar */}
                    <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-white/5 opacity-60">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-semibold tracking-widest uppercase text-white/80">Clearbit & API Ninjas Powered</span>
                    </div>
                </div>
            </div>

            {/* Results Status Header */}
            <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    {searched ? (
                        <>Search Results <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-semibold text-white/60">{logos.length} found</span></>
                    ) : (
                        <>Trending Examples <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-semibold border border-cyan-500/20">Hot</span></>
                    )}
                </h3>
            </div>
            
            {/* Massive Grid System */}
            <div className="relative min-h-[400px]">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-slate-900/50 rounded-3xl h-[280px] border border-white/5" />
                        ))}
                    </div>
                ) : logos.length > 0 ? (
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.05 }
                            }
                        }}
                        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                    >
                        {logos.map((logo, i) => (
                            <LogoCard key={i + logo.ticker} logo={logo} i={i} copiedIdx={copiedIdx} copyMarkdown={copyMarkdown} copyUrl={copyUrl} />
                        ))}
                    </motion.div>
                ) : (
                    searched && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 bg-[#09090b] rounded-[2rem] border border-white/5 shadow-inner"
                        >
                            <div className="w-24 h-24 mb-6 rounded-3xl bg-slate-800/50 flex items-center justify-center border border-white/10">
                                <Search className="w-10 h-10 text-white/20" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Asset Not Found</h3>
                            <p className="text-muted-foreground text-center max-w-sm">We couldn't locate an official vector or asset for <span className="text-white font-medium">"{query}"</span>. Ensure the spelling or ticker is exact.</p>
                        </motion.div>
                    )
                )}
            </div>
        </div>
    );
}

function LogoCard({ logo, i, copiedIdx, copyMarkdown, copyUrl }: { logo: LogoMeta, i: number, copiedIdx: number | null, copyMarkdown: (l: LogoMeta, i: number) => void, copyUrl: (l: LogoMeta, i: number) => void }) {
    const [imgError, setImgError] = useState(false);

    return (
        <motion.div 
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            className="group relative bg-[#111113] hover:bg-[#161618] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-6 transition-all duration-300 flex flex-col items-center justify-between gap-5 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 focus-within:ring-2 focus-within:ring-cyan-500 focus-within:outline-none"
        >
            <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/40 text-[11px] font-mono font-bold text-white/60 tracking-wider border border-white/10 backdrop-blur-md z-10 truncate max-w-[50%]">
                {logo.ticker || 'N/A'}
            </div>
            
            <div className="w-full aspect-square flex items-center justify-center p-6 bg-gradient-to-b from-[#1a1a1c] to-[#09090b] rounded-[1.5rem] border border-white/[0.02] shadow-inner mt-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {!imgError && logo.image ? (
                    <div className="relative w-28 h-28 flex items-center justify-center p-2 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={logo.image} 
                            alt={logo.name} 
                            className="max-w-full max-h-full object-contain filter drop-shadow-2xl rounded-lg" 
                            onError={() => setImgError(true)}
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center relative z-10">
                        <span className="text-6xl font-black text-white/10 group-hover:text-white/20 transition-colors drop-shadow-xl select-none">
                            {logo.name?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="w-full text-center space-y-4 relative z-10">
                <h4 className="font-bold text-white text-lg w-full truncate leading-tight group-hover:text-cyan-400 transition-colors">{logo.name}</h4>
                
                <div className="w-full grid grid-cols-2 gap-2">
                    <Button 
                        size="sm" 
                        onClick={() => copyMarkdown(logo, i)}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-10 transition-colors"
                        title="Copy Markdown"
                    >
                        {copiedIdx === i ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-white/60" />}
                        <span className="sr-only sm:not-sr-only sm:ml-2">Markdown</span>
                    </Button>
                    <Button 
                        size="sm"
                        onClick={() => copyUrl(logo, i)}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-10 transition-colors"
                        title="Copy URL"
                    >
                        {copiedIdx === (i + 1000) ? <Check className="h-4 w-4 text-emerald-400" /> : <ExternalLink className="h-4 w-4 text-white/60" />}
                        <span className="sr-only sm:not-sr-only sm:ml-2">URL</span>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
