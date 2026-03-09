import { execSync } from 'child_process';

export const gitTools = [
    {
        type: "function",
        function: {
            name: "git_status",
            description: "Get the current git status",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "git_diff",
            description: "Get the current git diff of unstaged changes",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    }
];

export function git_status(): string {
    try {
        return execSync('git status', { encoding: 'utf-8', stdio: 'pipe' });
    } catch (err: any) {
        return `Git status error: ${err.message}`;
    }
}

export function git_diff(): string {
    try {
        return execSync('git diff', { encoding: 'utf-8', stdio: 'pipe' });
    } catch (err: any) {
        return `Git diff error: ${err.message}`;
    }
}
