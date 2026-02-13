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

        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20', {
            headers: {
                'Authorization': `Bearer ${ghToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Ganapathi-Mentor-AI'
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch repos from GitHub' }, { status: 500 });
        }

        const repos = await response.json();

        // Transform data
        const transformedRepos = repos.map((repo: any) => ({
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            updated_at: repo.updated_at,
            html_url: repo.html_url,
        }));

        return NextResponse.json({ repos: transformedRepos });
    } catch (error) {
        console.error('GitHub repos fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
