import { Octokit } from 'octokit';
import { decrypt } from './encryption';

// We will use Octokit to interact with GitHub API.
// The user provides their Personal Access Token (PAT), which we store encrypted.

export async function getGitHubClient(token: string, isEncrypted = true) {
    let authToken = token;
    if (isEncrypted) {
        const decrypted = decrypt(token);
        if (!decrypted) throw new Error("Invalid GitHub Token");
        authToken = decrypted;
    }

    return new Octokit({ auth: authToken });
}

export interface RepoSummary {
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
    stars: number;
    updated_at: string;
    default_branch: string;
}

export async function getUserRepos(token: string, isEncrypted = true): Promise<RepoSummary[]> {
    const octokit = await getGitHubClient(token, isEncrypted);
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 20,
        visibility: 'all' // or 'public' depend on need, 'all' is safer for private code review
    });

    return data.map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count ?? 0,
        updated_at: repo.updated_at ?? new Date().toISOString(),
        default_branch: repo.default_branch
    }));
}

export async function getRepoReadme(token: string, owner: string, repo: string, isEncrypted = true) {
    const octokit = await getGitHubClient(token, isEncrypted);
    try {
        const { data } = await octokit.rest.repos.getReadme({
            owner,
            repo,
            mediaType: {
                format: 'raw',
            },
        });
        return data as unknown as string; // in raw mode it returns string
    } catch (error) {
        console.error("Failed to fetch README", error);
        return null;
    }
}

export async function getRepoLanguages(token: string, owner: string, repo: string, isEncrypted = true) {
    const octokit = await getGitHubClient(token, isEncrypted);
    const { data } = await octokit.rest.repos.listLanguages({
        owner,
        repo,
    });
    return data;
}

// Fetch recent commit messages to understand activity/skills
export async function getRecentCommits(token: string, owner: string, repo: string, limit = 10, isEncrypted = true) {
    const octokit = await getGitHubClient(token, isEncrypted);
    try {
        const { data } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            per_page: limit
        });
        return data.map(commit => ({
            message: commit.commit.message,
            author: commit.commit.author?.name,
            date: commit.commit.author?.date,
            sha: commit.sha
        }));
    } catch (error) {
        console.warn("Failed to fetch commits", error);
        return [];
    }
}
