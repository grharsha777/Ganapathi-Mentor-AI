"use client"

import { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Flame, Target, BookOpen, Star, ArrowUpRight, Crown, Medal, Award, Zap, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GridContainer } from '@/components/layout/GridContainer';
import { Section } from '@/components/layout/Section';

interface UserStats {
    streak: number;
    skillsMastered: number;
    weeklyGoal: number;
    xpPoints: number;
    level: string;
}

interface LeaderboardUser {
    id: string;
    name: string;
    xp: number;
    avatar?: string;
    rank: number;
}

interface Activity {
    id: string;
    title: string;
    type: string;
    xpEarned: number;
    timeAgo: string;
}

// Memoized stat card for performance
const StatCard = memo(({ title, value, icon: Icon, gradient, index }: {
    title: string;
    value: string | number;
    icon: any;
    gradient: string;
    index: number;
}) => (
    <Card className={`relative overflow-hidden border-0 shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-in fade-in fill-mode-forwards opacity-0`} style={{ animationDelay: `${index * 100}ms` }}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
        <CardContent className="relative pt-8 pb-8 px-6 flex items-center justify-between z-10 text-white">
            <div>
                <p className="opacity-90 font-medium text-lg uppercase tracking-wider">{title}</p>
                <h3 className="text-5xl lg:text-6xl font-black mt-2 tracking-tight drop-shadow-md">{value}</h3>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-lg">
                <Icon className="h-12 w-12 lg:h-14 lg:w-14 text-white drop-shadow-sm" />
            </div>
        </CardContent>
    </Card>
));
StatCard.displayName = 'StatCard';

// Memoized leaderboard item
const LeaderboardItem = memo(({ user, currentUserId }: { user: LeaderboardUser; currentUserId?: string }) => {
    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500 drop-shadow-glow" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-300 fill-gray-300 drop-shadow-glow" />;
        if (rank === 3) return <Award className="h-6 w-6 text-amber-700 fill-amber-700 drop-shadow-glow" />;
        return <span className="w-8 text-center text-muted-foreground font-bold text-lg">{rank}</span>;
    };

    const isCurrentUser = user.id === currentUserId;

    return (
        <div className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${isCurrentUser ? 'bg-primary/20 border border-primary/50 shadow-lg scale-[1.01]' : 'hover:bg-muted/50 hover:translate-x-1'}`}>
            <div className="w-8 flex justify-center">{getRankIcon(user.rank)}</div>
            <Avatar className="h-12 w-12 border-2 border-white/10 ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                {user.avatar && <AvatarImage src={user.avatar} />}
                <AvatarFallback className={isCurrentUser ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground'}>
                    {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <div className="text-base lg:text-lg font-bold truncate flex items-center gap-2">
                    {user.name}
                    {isCurrentUser && <Badge className="text-[10px] px-2 py-0.5 bg-primary text-white shadow-neon">YOU</Badge>}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{user.xp.toLocaleString()} XP</div>
            </div>
        </div>
    );
});
LeaderboardItem.displayName = 'LeaderboardItem';

export default function PersonalDashboard() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    useEffect(() => {
        // Simulate fetching real user data (in production, this would be API calls)
        const fetchData = async () => {
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // In production, these would be real API calls:
                setStats({
                    streak: 12,
                    skillsMastered: 8,
                    weeklyGoal: 85,
                    xpPoints: 2450,
                    level: 'Senior Architect I'
                });

                // Weekly leaderboard data
                setLeaderboard([
                    { id: 'user1', name: 'G R Harsha', xp: 2450, rank: 1 },
                    { id: 'user2', name: 'Priya Sharma', xp: 2280, rank: 2 },
                    { id: 'user3', name: 'Rahul Kumar', xp: 2100, rank: 3 },
                    { id: 'user4', name: 'Sneha Patel', xp: 1950, rank: 4 },
                    { id: 'user5', name: 'Arjun Reddy', xp: 1820, rank: 5 },
                ]);

                setActivities([
                    { id: '1', title: 'Completed "Advanced TypeScript Patterns"', type: 'Milestone 2', xpEarned: 50, timeAgo: '2 hours ago' },
                    { id: '2', title: 'Solved React Hooks Challenge', type: 'Challenge', xpEarned: 30, timeAgo: '5 hours ago' },
                    { id: '3', title: 'Completed Code Review Session', type: 'Review', xpEarned: 25, timeAgo: 'Yesterday' },
                ]);

                setCurrentUserId('user1'); // Current logged in user

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 w-full">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
                <div className="lg:col-span-3 space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-64 rounded-2xl" />
                        ))}
                    </div>
                </div>
                <Skeleton className="h-[600px] rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 w-full">
            {/* Stats Cards - Full Width Grid */}
            <GridContainer cols={4} className="gap-8">
                <StatCard index={0} title="Learning Streak" value={`${stats?.streak || 0} Days`} icon={Flame} gradient="from-orange-500 via-red-500 to-pink-500" />
                <StatCard index={1} title="Skills Mastered" value={stats?.skillsMastered || 0} icon={Trophy} gradient="from-blue-500 via-indigo-600 to-violet-600" />
                <StatCard index={2} title="Weekly Goal" value={`${stats?.weeklyGoal || 0}%`} icon={Target} gradient="from-emerald-400 via-green-500 to-teal-600" />
                <StatCard index={3} title="XP Points" value={stats?.xpPoints?.toLocaleString() || '0'} icon={Star} gradient="from-purple-500 via-fuchsia-600 to-pink-600" />
            </GridContainer>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Micro Challenges Section */}
                    <Section
                        title="Daily Micro-Challenges"
                        description="Quick exercises to keep your skills sharp."
                        action={<Zap className="h-6 w-6 text-yellow-500 fill-yellow-500 animate-pulse" />}
                    >
                        <GridContainer cols={2} className="gap-6">
                            <Card className="group relative overflow-hidden glass-card border-0">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/80 group-hover:w-2 transition-all duration-300" />
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20">React Hooks</Badge>
                                        <span className="text-sm text-muted-foreground font-semibold flex items-center bg-card/50 px-2 py-1 rounded-full"><TrendingUp className="h-3 w-3 mr-1" /> 5 min</span>
                                    </div>
                                    <CardTitle className="text-2xl mt-4 group-hover:text-primary transition-colors">Explain `useCallback` vs `useMemo`</CardTitle>
                                    <CardDescription className="text-lg mt-2">Explain the difference to a junior dev.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button size="lg" className="w-full group-hover:bg-primary/90 text-lg h-12 rounded-xl shadow-lg shadow-indigo-500/10">
                                        Start Challenge
                                        <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="group relative overflow-hidden glass-card border-0">
                                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/80 group-hover:w-2 transition-all duration-300" />
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/5">System Design</Badge>
                                        <span className="text-sm text-muted-foreground font-semibold flex items-center bg-card/50 px-2 py-1 rounded-full"><TrendingUp className="h-3 w-3 mr-1" /> 10 min</span>
                                    </div>
                                    <CardTitle className="text-2xl mt-4 group-hover:text-yellow-500 transition-colors">Design a Rate Limiter</CardTitle>
                                    <CardDescription className="text-lg mt-2">Sketch out a distributed rate limiting algorithm.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button size="lg" variant="secondary" className="w-full hover:bg-yellow-500/10 hover:text-yellow-500 text-lg h-12 rounded-xl border border-yellow-500/20">
                                        Start Challenge
                                        <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </GridContainer>
                    </Section>

                    {/* Recent Activity Section */}
                    <Section
                        title="Recent Activity"
                        description="Track your progress across all modules."
                        action={<BookOpen className="h-6 w-6 text-primary" />}
                    >
                        <Card className="glass-card border-0 overflow-hidden">
                            <CardContent className="p-0">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-6 p-6 border-b border-border/40 last:border-0 hover:bg-white/5 transition-colors group">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <BookOpen className="h-7 w-7" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-lg group-hover:text-primary transition-colors">{activity.title}</p>
                                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                                <span className="bg-primary/10 px-2 py-0.5 rounded text-primary text-xs font-semibold uppercase">{activity.type}</span>
                                                <span>• {activity.timeAgo}</span>
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 text-sm font-bold">
                                            +{activity.xpEarned} XP
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </Section>
                </div>

                {/* Right Column - Leaderboard */}
                <div className="lg:col-span-1">
                    <Section
                        title="Leaderboard"
                        description="This Week's Top Performers"
                        action={<Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500" />}
                    >
                        <Card className="h-[600px] glass border-0 shadow-2xl flex flex-col">
                            <CardContent className="flex-1 space-y-3 pt-6 overflow-y-auto custom-scrollbar p-6">
                                {leaderboard.map((user) => (
                                    <LeaderboardItem
                                        key={user.id}
                                        user={user}
                                        currentUserId={currentUserId}
                                    />
                                ))}
                            </CardContent>
                            <div className="p-6 border-t border-white/10 mt-auto bg-black/20">
                                <Button variant="default" className="w-full text-lg h-12 shadow-neon transition-all hover:scale-[1.02]">
                                    View All Rankings
                                </Button>
                            </div>
                        </Card>
                    </Section>
                </div>
            </div>
        </div>
    );
}
