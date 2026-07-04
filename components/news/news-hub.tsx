'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Cpu, Code, Globe, Activity, HeartPulse, Loader2, ArrowUpRight, Zap, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// --- Types ---

interface NewsArticle {
    id: string;
    title: string;
    description: string;
    url: string;
    imageUrl: string | null;
    source: string;
    author: string | null;
    publishedAt: string;
    apiSource: string;
    hasVideo?: boolean;
    videoThumbnailId?: string;
}

const CATEGORIES = [
    { id: 'all', label: 'All News', icon: Compass, color: 'from-blue-500 to-indigo-600' },
    { id: 'technology', label: 'Technology', icon: Zap, color: 'from-cyan-500 to-blue-600' },
    { id: 'ai', label: 'AI & ML', icon: Cpu, color: 'from-purple-500 to-fuchsia-600' },
    { id: 'developer', label: 'Developer', icon: Code, color: 'from-emerald-500 to-teal-600' },
    { id: 'science', label: 'Science', icon: Globe, color: 'from-orange-500 to-red-600' },
    { id: 'movies', label: 'Movies & Ent.', icon: Activity, color: 'from-pink-500 to-rose-600' },
    { id: 'cricket', label: 'Cricket / Sports', icon: Activity, color: 'from-amber-500 to-orange-600' },
    { id: 'god_stories', label: 'God Stories', icon: HeartPulse, color: 'from-yellow-500 to-amber-600' },
];

export function NewsHub() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Carousel state
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch news
    const fetchNews = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            const url = new URL('/api/news', window.location.origin);
            if (activeCategory !== 'all') url.searchParams.set('category', activeCategory);
            if (debouncedQuery) url.searchParams.set('q', debouncedQuery);

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('Failed to fetch news');

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setArticles(data.articles || []);
        } catch (err: any) {
            console.error('Error in NewsHub:', err);
            setError(err.message || 'An unexpected error occurred while fetching news.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [activeCategory, debouncedQuery]);

    // Trigger fetch when category or debounced query changes
    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // Derived state for Carousel & Grid
    const heroArticles = articles.slice(0, Math.min(5, articles.length));
    const gridArticles = articles.slice(heroArticles.length);

    // Reset carousel index when articles change
    useEffect(() => {
        setCurrentHeroIndex(0);
    }, [articles]);

    // Auto-advance carousel
    useEffect(() => {
        if (heroArticles.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroArticles.length);
        }, 8000); // 8 second rotation
        return () => clearInterval(timer);
    }, [heroArticles.length]);

    // Format relative time helper
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    };

    return (
        <div className="w-full flex-1 flex flex-col space-y-6 sm:space-y-8 animate-fade-in relative">

            {/* Top Controls: Search & Live Badge */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full relative z-20">
                <div className="relative w-full sm:max-w-md group">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search the globe..."
                        className="pl-10 sm:pl-12 pr-4 h-12 w-full bg-card/60 border-white/10 backdrop-blur-xl rounded-2xl shadow-inner focus-visible:ring-primary/50 text-sm sm:text-base transition-all duration-300 hover:bg-card/80"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-xs text-muted-foreground hover:text-foreground bg-white/5 rounded-full px-2 py-1 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchNews(true)}
                        disabled={isRefreshing || isLoading}
                        className="flex items-center justify-center p-2 rounded-xl bg-card/60 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
                        title="Refresh News"
                    >
                        <RefreshCw className={cn("w-5 h-5 text-muted-foreground", isRefreshing && "animate-spin text-primary")} />
                    </button>
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                        <span className="relative flex h-2 sm:h-3 w-2 sm:w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 sm:h-3 w-2 sm:w-3 bg-red-500"></span>
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-red-500 tracking-wider">LIVE</span>
                    </div>
                </div>
            </div>

            {/* Category Pills (Scrollable horizontally) */}
            <div className="w-full overflow-x-auto pb-4 pt-1 scrollbar-none snap-x relative z-20" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 px-1 min-w-max mx-auto">
                    {CATEGORIES.map((category) => {
                        const isActive = activeCategory === category.id;
                        const Icon = category.icon;
                        return (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={cn(
                                    "relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 border rounded-2xl transition-all duration-300 snap-center touch-manipulation group",
                                    isActive
                                        ? "text-white border-transparent bg-white/10 shadow-lg"
                                        : "bg-card/40 border-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                )}
                                style={isActive ? {
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                                    boxShadow: `0 8px 20px -8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)`
                                } : {}}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeCategory"
                                        className={cn("absolute inset-0 rounded-2xl bg-gradient-to-r opacity-20", category.color)}
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 relative z-10", isActive && "drop-shadow-md", !isActive && "group-hover:scale-110 transition-transform")} />
                                <span className="text-xs sm:text-sm font-semibold whitespace-nowrap relative z-10 tracking-wide">{category.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Trusted Sources Indicator */}
            <div className="flex items-center justify-center gap-2 sm:gap-6 py-2 z-20">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest hidden sm:inline-block">Powering Global News:</span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-white/80">MediaStack</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                        <span className="text-xs font-medium text-white/80">NewsAPI</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '600ms' }} />
                        <span className="text-xs font-medium text-white/80">SerpAPI</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '900ms' }} />
                        <span className="text-xs font-medium text-white/80">NewsData</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '1200ms' }} />
                        <span className="text-xs font-medium text-white/80">Bing News</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '1500ms' }} />
                        <span className="text-xs font-medium text-white/80">GNews</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative min-h-[400px]">
                {error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center glass rounded-3xl z-10">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/30">
                            <RefreshCw className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Connection Error</h3>
                        <p className="text-muted-foreground max-w-md">{error}</p>
                        <button
                            onClick={() => fetchNews(false)}
                            className="mt-6 px-6 py-2.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl font-semibold transition-colors border border-primary/30"
                        >
                            Try Again
                        </button>
                    </div>
                ) : isLoading ? (
                    <LoadingSkeleton />
                ) : articles.length === 0 ? (
                    <EmptyState query={searchQuery || activeCategory} />
                ) : (
                    <div className="space-y-6 sm:space-y-8 pb-10">

                        {/* Hero Article Spotlight Carousel */}
                        {heroArticles.length > 0 && (
                            <div className="relative w-full rounded-[2rem] overflow-hidden bg-card border border-white/10 shadow-2xl group min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex items-end">
                                <AnimatePresence mode="wait">
                                    <motion.a
                                        key={currentHeroIndex}
                                        href={heroArticles[currentHeroIndex].url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, scale: 1.02 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="absolute inset-0 block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background"
                                    >
                                        {/* Background Image Setup */}
                                        <div className="absolute inset-0 w-full h-full">
                                            {heroArticles[currentHeroIndex].imageUrl ? (
                                                <img
                                                    src={heroArticles[currentHeroIndex].imageUrl}
                                                    alt={heroArticles[currentHeroIndex].title}
                                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />
                                            )}
                                            {/* Heavy dark gradient overlay for text readability */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
                                        </div>

                                        {/* Content */}
                                        <div className="absolute bottom-0 left-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14 w-full md:w-4/5 lg:w-3/4">
                                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs sm:text-sm font-bold backdrop-blur-md">
                                                    {heroArticles[currentHeroIndex].source}
                                                </span>
                                                <span className="text-sm font-medium text-white/60 flex items-center gap-1.5">
                                                    <Activity className="w-3.5 h-3.5" />
                                                    {getRelativeTime(heroArticles[currentHeroIndex].publishedAt)}
                                                </span>
                                            </div>

                                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight mb-4 group-hover:text-primary-foreground transition-colors drop-shadow-lg text-balance">
                                                {heroArticles[currentHeroIndex].title}
                                            </h2>

                                            <p className="text-sm sm:text-base lg:text-lg pl-0.5 text-white/70 line-clamp-2 md:line-clamp-3 mb-6 sm:mb-8 font-medium max-w-2xl leading-relaxed drop-shadow">
                                                {heroArticles[currentHeroIndex].description}
                                            </p>

                                            <div className="flex items-center gap-2 text-primary group-hover:text-primary-foreground font-bold text-sm sm:text-base transition-colors">
                                                Read Full Story
                                                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </div>
                                        </div>
                                    </motion.a>
                                </AnimatePresence>

                                {/* Carousel Controls */}
                                {heroArticles.length > 1 && (
                                    <>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); setCurrentHeroIndex((prev) => (prev - 1 + heroArticles.length) % heroArticles.length); }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 shadow-2xl backdrop-blur-md z-30 focus:opacity-100"
                                            aria-label="Previous article"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); setCurrentHeroIndex((prev) => (prev + 1) % heroArticles.length); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 shadow-2xl backdrop-blur-md z-30 focus:opacity-100"
                                            aria-label="Next article"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                        
                                        {/* Pagination Dots */}
                                        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 flex items-center gap-2.5 z-30">
                                            {heroArticles.map((_, i) => (
                                                <button 
                                                    key={i} 
                                                    onClick={(e) => { e.preventDefault(); setCurrentHeroIndex(i); }}
                                                    className={cn("transition-all duration-500 rounded-full opacity-80 hover:opacity-100",
                                                        i === currentHeroIndex ? "w-10 h-2 bg-primary shadow-[0_0_12px_rgba(124,58,237,0.9)]" : "w-2 h-2 bg-white/40 hover:bg-white/80"
                                                    )}
                                                    aria-label={`Go to slide ${i + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Grid Articles (BENTO LAYOUT) */}
                        {gridArticles.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 auto-rows-[300px]">
                                {gridArticles.map((article, index) => {
                                    // Bento Grid sizing logic: make every 5th or 8th item larger
                                    const isLarge = index === 0 || index % 7 === 0;
                                    const isTall = index % 5 === 2;
                                    const colSpan = isLarge ? "md:col-span-2 lg:col-span-2" : "col-span-1";
                                    const rowSpan = isLarge ? "row-span-1" : isTall ? "row-span-2" : "row-span-1";
                                    
                                    return (
                                        <div key={article.id} className={cn(colSpan, rowSpan, "h-full")}>
                                            <ArticleCard 
                                                article={article} 
                                                index={index} 
                                                getRelativeTime={getRelativeTime} 
                                                isLarge={isLarge}
                                                isTall={isTall}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* End of results */}
                        <div className="flex justify-center mt-12 mb-8">
                            <div className="h-1 w-12 bg-white/10 rounded-full" />
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

// --- Sub Components ---

function ArticleCard({ article, index, getRelativeTime, isLarge = false, isTall = false }: { article: NewsArticle; index: number; getRelativeTime: (d: string) => string; isLarge?: boolean; isTall?: boolean }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: "easeOut" }}
            className="group relative flex flex-col h-full bg-[#111113] border border-white/10 rounded-[2rem] overflow-hidden hover:border-white/20 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full shadow-lg"
            style={{ zIndex: isHovered ? 50 : 1 }}
        >
            <motion.div 
                animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col h-full w-full"
            >
                <div className={cn("relative w-full overflow-hidden bg-black shrink-0", isLarge ? "h-48" : isTall ? "h-64" : "h-40")}>
                    {article.hasVideo && isHovered && article.videoThumbnailId ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${article.videoThumbnailId}?autoplay=1&mute=1&controls=0&modestbranding=1&showinfo=0`}
                            className="absolute top-0 left-0 w-full h-[150%] -translate-y-[15%] pointer-events-none scale-110"
                            allow="autoplay; encrypted-media"
                        />
                    ) : (
                        article.imageUrl ? (
                            <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(article.source)}&background=111113&color=fff&size=400`;
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-indigo-950">
                                <Compass className="w-10 h-10 text-white/20" />
                            </div>
                        )
                    )}

                    {article.hasVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                            <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1"><path d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" /></svg>
                            </div>
                        </div>
                    )}

                    {/* Source Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full backdrop-blur-xl bg-black/60 border border-white/20 text-xs font-bold text-white max-w-[calc(100%-24px)] truncate shadow-lg">
                        {article.source}
                    </div>
                </div>

                <div className="flex flex-col flex-1 p-5 sm:p-6 bg-gradient-to-b from-[#111113] to-[#09090b]">
                    <h3 className={cn("font-bold text-white leading-tight mb-3 group-hover:text-cyan-400 transition-colors", isLarge ? "text-xl sm:text-2xl line-clamp-2" : "text-[17px] line-clamp-3")}>
                        {article.title}
                    </h3>

                    <p className={cn("text-muted-foreground mb-4 mt-auto", isLarge ? "text-sm line-clamp-3" : "text-xs line-clamp-2")}>
                        {article.description || "In-depth global coverage and realtime updates."}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                        <span className="text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" />
                            {getRelativeTime(article.publishedAt)}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 text-white transition-colors border border-white/10 shadow-lg">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.a>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6 sm:space-y-8 animate-pulse">
            {/* Hero Skeleton */}
            <div className="w-full h-[400px] sm:h-[500px] bg-slate-800/40 rounded-[2rem] border border-white/5" />

            {/* Grid Skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="flex flex-col h-[380px] bg-slate-800/20 rounded-3xl border border-white/5 overflow-hidden">
                        <div className="w-full aspect-[16/9] bg-slate-700/30" />
                        <div className="p-5 flex flex-col flex-1 gap-3">
                            <div className="w-3/4 h-5 bg-slate-700/30 rounded-md" />
                            <div className="w-full h-5 bg-slate-700/30 rounded-md" />
                            <div className="w-full h-16 bg-slate-700/20 rounded-md mt-auto" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmptyState({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="relative w-24 h-24 mb-6 text-slate-700">
                <Compass className="w-full h-full drop-shadow-xl" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Search className="w-8 h-8 text-primary" strokeWidth={2.5} />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No transmissions found</h3>
            <p className="text-lg text-muted-foreground max-w-md mx-auto text-balance">
                We couldn&apos;t find any news articles matching <span className="text-white font-medium">&quot;{query}&quot;</span> at this moment.
            </p>
        </div>
    );
}
