"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, Star, GitFork, Clock, Code2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Repository {
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks?: number;
    updated_at: string;
    html_url?: string;
}

interface GitHubStats {
    totalRepos: number;
    totalStars: number;
    topLanguages: { name: string; count: number }[];
}

export default function GitHubDashboard() {
    const [repos, setRepos] = useState<Repository[]>([]);
    const [stats, setStats] = useState<GitHubStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasToken, setHasToken] = useState(false);

    const fetchGitHubData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Check if user has GitHub token
            const response = await fetch('/api/session/github');
            const data = await response.json();

            if (!data.hasToken) {
                setHasToken(false);
                setLoading(false);
                return;
            }

            setHasToken(true);

            // Fetch repos
            const reposResponse = await fetch('/api/session/github/repos');
            if (!reposResponse.ok) throw new Error('Failed to fetch repos');

            const reposData = await reposResponse.json();
            setRepos(reposData.repos || []);

            // Calculate stats
            const languages: Record<string, number> = {};
            let totalStars = 0;

            reposData.repos?.forEach((repo: Repository) => {
                totalStars += repo.stars || 0;
                if (repo.language) {
                    languages[repo.language] = (languages[repo.language] || 0) + 1;
                }
            });

            const topLanguages = Object.entries(languages)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setStats({
                totalRepos: reposData.repos?.length || 0,
                totalStars,
                topLanguages,
            });

        } catch (err: any) {
            console.error('GitHub fetch error:', err);
            setError(err.message || 'Failed to load GitHub data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGitHubData();
    }, []);

    const getLanguageColor = (language: string): string => {
        const colors: Record<string, string> = {
            TypeScript: 'bg-blue-500',
            JavaScript: 'bg-yellow-500',
            Python: 'bg-green-500',
            Java: 'bg-orange-500',
            Go: 'bg-cyan-500',
            Rust: 'bg-orange-600',
            Ruby: 'bg-red-500',
            PHP: 'bg-purple-500',
            'C++': 'bg-pink-500',
            C: 'bg-gray-500',
        };
        return colors[language] || 'bg-gray-400';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!hasToken) {
        return (
            <Card className="border-dashed border-2">
                <CardContent className="py-12 text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Github className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Connect Your GitHub</h3>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto">
                            Create a Personal Access Token in GitHub → Settings → Developer settings → Personal access tokens.
                            Use minimal scopes (read-only repo access) and either add it in Settings or set <code className="bg-muted px-1 rounded text-xs">GITHUB_TOKEN</code> in .env.local.
                        </p>
                    </div>
                    <Button asChild>
                        <a href="/dashboard/settings">
                            Go to Settings
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200 dark:border-red-900">
                <CardContent className="py-8 text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <div>
                        <h3 className="font-semibold text-lg">Failed to Load GitHub Data</h3>
                        <p className="text-muted-foreground text-sm">{error}</p>
                    </div>
                    <Button onClick={fetchGitHubData} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                            <p className="opacity-80 font-medium text-sm">Repositories</p>
                            <h3 className="text-4xl font-bold mt-1">{stats?.totalRepos || 0}</h3>
                        </div>
                        <Github className="h-10 w-10 opacity-80" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-none">
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                            <p className="opacity-80 font-medium text-sm">Total Stars</p>
                            <h3 className="text-4xl font-bold mt-1">{stats?.totalStars || 0}</h3>
                        </div>
                        <Star className="h-10 w-10 opacity-80" />
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none">
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                            <p className="opacity-80 font-medium text-sm">Languages</p>
                            <h3 className="text-4xl font-bold mt-1">{stats?.topLanguages.length || 0}</h3>
                        </div>
                        <Code2 className="h-10 w-10 opacity-80" />
                    </CardContent>
                </Card>
            </div>

            {/* Top Languages */}
            {stats && stats.topLanguages.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top Languages</CardTitle>
                        <CardDescription>Most used languages across your repositories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {stats.topLanguages.map((lang) => (
                                <div key={lang.name} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                                    <div className={`h-3 w-3 rounded-full ${getLanguageColor(lang.name)}`} />
                                    <span className="font-medium">{lang.name}</span>
                                    <Badge variant="secondary">{lang.count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Repositories */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Recent Repositories</h2>
                    <Button variant="ghost" size="sm" onClick={fetchGitHubData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {repos.slice(0, 6).map((repo) => (
                        <Card key={repo.full_name} className="hover:shadow-md transition-shadow group">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                                        {repo.name}
                                    </CardTitle>
                                    {repo.language && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <div className={`h-2 w-2 rounded-full ${getLanguageColor(repo.language)}`} />
                                            {repo.language}
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {repo.description || 'No description provided'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        {repo.stars}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {new Date(repo.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
