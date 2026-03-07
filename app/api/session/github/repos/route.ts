import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import UserIntegration from '@/models/UserIntegration';
import { verifyToken } from '@/lib/auth';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        let ghToken: string | null = null;
        const conn = await connectSafe();
        if (conn) {
            const integration = await UserIntegration.findOne({ user_id: decoded.userId });
            ghToken = integration?.github_token || null;
        }
        if (!ghToken) ghToken = GITHUB_TOKEN || null;

        if (!ghToken) {
            return NextResponse.json({ error: 'No GitHub token. Add GITHUB_TOKEN to .env.local or connect in Settings.' }, { status: 400 });
        }

        const headers = {
            'Authorization': `Bearer ${ghToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Ganapathi-Mentor-AI'
        };

        // Fetch user profile, repos, starred repos, followers, and following in parallel
        const [userRes, reposRes, starredRes, followersRes, followingRes] = await Promise.all([
            fetch('https://api.github.com/user', { headers }),
            fetch('https://api.github.com/user/repos?sort=updated&per_page=100&visibility=all', { headers }),
            fetch('https://api.github.com/user/starred?per_page=100', { headers }),
            fetch('https://api.github.com/user/followers?per_page=100', { headers }),
            fetch('https://api.github.com/user/following?per_page=100', { headers }),
        ]);

        if (!reposRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch repos from GitHub' }, { status: 500 });
        }

        const repos = await reposRes.json();
        const user = userRes.ok ? await userRes.json() : null;
        const starredRepos = starredRes.ok ? await starredRes.json() : [];
        const followers = followersRes.ok ? await followersRes.json() : [];
        const following = followingRes.ok ? await followingRes.json() : [];

        // Transform repos
        const transformedRepos = repos.map((repo: any) => ({
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            open_issues: repo.open_issues_count || 0,
            size: repo.size || 0,
            updated_at: repo.updated_at,
            created_at: repo.created_at,
            html_url: repo.html_url,
            default_branch: repo.default_branch,
            is_fork: repo.fork || false,
            has_wiki: repo.has_wiki || false,
            license: repo.license?.spdx_id || null,
            topics: repo.topics || [],
        }));

        // Transform user profile
        const profile = user ? {
            login: user.login,
            avatar_url: user.avatar_url,
            name: user.name,
            bio: user.bio,
            company: user.company,
            location: user.location,
            blog: user.blog,
            twitter_username: user.twitter_username,
            public_repos: user.public_repos,
            public_gists: user.public_gists,
            followers: user.followers,
            following: user.following,
            created_at: user.created_at,
            html_url: user.html_url,
        } : null;

        // Transform starred repos
        const transformedStarred = Array.isArray(starredRepos) ? starredRepos.map((repo: any) => ({
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            html_url: repo.html_url,
            owner: {
                login: repo.owner?.login,
                avatar_url: repo.owner?.avatar_url,
            }
        })) : [];

        // Transform followers
        const transformedFollowers = Array.isArray(followers) ? followers.map((u: any) => ({
            login: u.login,
            avatar_url: u.avatar_url,
            html_url: u.html_url,
        })) : [];

        // Transform following
        const transformedFollowing = Array.isArray(following) ? following.map((u: any) => ({
            login: u.login,
            avatar_url: u.avatar_url,
            html_url: u.html_url,
        })) : [];

        return NextResponse.json({
            repos: transformedRepos,
            profile,
            starred: transformedStarred,
            followers: transformedFollowers,
            following: transformedFollowing,
        });
    } catch (error) {
        console.error('GitHub repos fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

