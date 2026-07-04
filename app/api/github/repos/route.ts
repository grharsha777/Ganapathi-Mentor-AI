import { NextRequest, NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════════
   GitHub Repos API — Privacy-first repo management
   
   - User's GitHub PAT is sent per-request, NEVER stored server-side
   - Actions: check-user, check-repo, create-repo
   ═══════════════════════════════════════════════════════════════ */

const GH_API = 'https://api.github.com';

function ghHeaders(token: string) {
    return {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
    };
}

export async function POST(req: NextRequest) {
    try {
        const { action, token, repoName, isPrivate, description } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'GitHub Personal Access Token is required.' }, { status: 400 });
        }

        const headers = ghHeaders(token);

        switch (action) {
            case 'check-user': {
                const res = await fetch(`${GH_API}/user`, { headers });
                if (!res.ok) {
                    return NextResponse.json({ error: 'Invalid GitHub token. Please check your Personal Access Token.' }, { status: 401 });
                }
                const user = await res.json();
                return NextResponse.json({
                    user: { login: user.login, name: user.name, avatar_url: user.avatar_url, public_repos: user.public_repos },
                });
            }

            case 'check-repo': {
                if (!repoName) return NextResponse.json({ error: 'Repository name is required.' }, { status: 400 });
                const res = await fetch(`${GH_API}/repos/${repoName}`, { headers });
                if (res.status === 404) return NextResponse.json({ exists: false });
                if (!res.ok) return NextResponse.json({ error: 'Failed to check repository.' }, { status: res.status });
                const repo = await res.json();
                return NextResponse.json({
                    exists: true,
                    repo: { full_name: repo.full_name, html_url: repo.html_url, private: repo.private, default_branch: repo.default_branch },
                });
            }

            case 'create-repo': {
                if (!repoName) return NextResponse.json({ error: 'Repository name is required.' }, { status: 400 });
                const name = repoName.includes('/') ? repoName.split('/')[1] : repoName;
                const res = await fetch(`${GH_API}/user/repos`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        name,
                        private: isPrivate ?? false,
                        description: description || `Created from Ganapathi Hive Mind IDE`,
                        auto_init: true,
                    }),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    return NextResponse.json({ error: err.message || 'Failed to create repository.' }, { status: res.status });
                }
                const repo = await res.json();
                return NextResponse.json({
                    created: true,
                    repo: { full_name: repo.full_name, html_url: repo.html_url, clone_url: repo.clone_url, ssh_url: repo.ssh_url },
                });
            }

            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
    } catch (error: any) {
        console.error('[GitHub API]', error);
        return NextResponse.json({ error: error.message || 'GitHub API request failed' }, { status: 500 });
    }
}
