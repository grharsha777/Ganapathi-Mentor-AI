import * as fs from 'fs';
import * as path from 'path';

export const fsTools = [
    {
        type: "function",
        function: {
            name: "fs_read",
            description: "Read the contents of a file",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Absolute or relative path to the file" }
                },
                required: ["path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "fs_write",
            description: "Write content to a file, creating directories if needed",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Absolute or relative path to the file" },
                    content: { type: "string", description: "The complete content to write to the file" }
                },
                required: ["path", "content"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "fs_list",
            description: "List the contents of a directory",
            parameters: {
                type: "object",
                properties: {
                    dir: { type: "string", description: "Absolute or relative path to the directory" }
                },
                required: ["dir"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "fs_search",
            description: "Search for a pattern in files within a directory (basic grep)",
            parameters: {
                type: "object",
                properties: {
                    dir: { type: "string", description: "Directory to search in" },
                    pattern: { type: "string", description: "Regex or string pattern to search for" }
                },
                required: ["dir", "pattern"]
            }
        }
    }
];

export function fs_read(filePath: string): string {
    try {
        return fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
    } catch (err: any) {
        return `Error reading file: ${err.message}`;
    }
}

export function fs_write(filePath: string, content: string): string {
    try {
        const fullPath = path.resolve(process.cwd(), filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
        return `Successfully wrote to ${filePath}`;
    } catch (err: any) {
        return `Error writing file: ${err.message}`;
    }
}

export function fs_list(dirPath: string): string {
    try {
        const files = fs.readdirSync(path.resolve(process.cwd(), dirPath));
        return files.join('\n');
    } catch (err: any) {
        return `Error listing directory: ${err.message}`;
    }
}

// Simple synchronous search
export function fs_search(dirPath: string, pattern: string): string {
    try {
        const fullDir = path.resolve(process.cwd(), dirPath);
        let results: string[] = [];
        const search = (currentDir: string) => {
            const items = fs.readdirSync(currentDir);
            for (const item of items) {
                if (item === 'node_modules' || item === '.git') continue;
                const itemPath = path.join(currentDir, item);
                const stat = fs.statSync(itemPath);
                if (stat.isDirectory()) {
                    search(itemPath);
                } else if (stat.isFile()) {
                    try {
                        // Basic text search. Realistically you'd use native tools, this is simplified.
                        const content = fs.readFileSync(itemPath, 'utf8');
                        if (content.includes(pattern) || new RegExp(pattern).test(content)) {
                            results.push(itemPath);
                        }
                    } catch (e) { } // skip binary files
                }
            }
        };
        search(fullDir);
        return results.length > 0 ? results.join('\n') : "No matches found.";
    } catch (err: any) {
        return `Error searching: ${err.message}`;
    }
}
