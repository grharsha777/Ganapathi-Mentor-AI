import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import readline from 'readline';

// Support .env.local for Next.js consistency
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { generateText, getAIModelOrNull } from '../lib/ai';

// Colors for the terminal
const COLORS = {
    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    MAGENTA: '\x1b[35m',
    CYAN: '\x1b[36m',
    WHITE: '\x1b[37m',
};

const LOGO = `
${COLORS.CYAN}${COLORS.BRIGHT}
   ____                               _   _     _ 
  / ___| __ _ _ __   __ _ _ __   __ _| |_| |__ (_)
 | |  _ / _' | '_ \\ / _' | '_ \\ / _' | __| '_ \\| |
 | |_| | (_| | | | | (_| | |_) | (_| | |_| | | | |
  \\____|\\__,_|_| |_|\\__,_| .__/ \\__,_|\\__|_| |_|_|
                         |_|                       
   ${COLORS.RESET}${COLORS.MAGENTA}${COLORS.BRIGHT}Ganapathi Neural CLI v2.0.0${COLORS.RESET}
   ${COLORS.BLUE}Advanced AI Mentor for High-Performance Coding${COLORS.RESET}
`;

/**
 * Main entrance
 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === '--help' || command === '-h') {
        showHelp();
        return;
    }

    console.log(LOGO);

    const model = getAIModelOrNull();
    if (!model) {
        console.error(`${COLORS.RED}Error: AI model not configured. Check your .env.local file.${COLORS.RESET}`);
        return;
    }

    switch (command) {
        case 'audit':
            await handleAudit(args[1]);
            break;
        case 'chat':
            await handleChat();
            break;
        case 'fix':
            await handleFix(args[1]);
            break;
        case 'doctor':
            await handleDoctor();
            break;
        case 'explain':
            await handleExplain(args[1] || '.');
            break;
        default:
            console.error(`${COLORS.RED}Unknown command: ${command}${COLORS.RESET}`);
            showHelp();
    }
}

function showHelp() {
    // Detect if running via the global 'bin.js' wrapper (check if current script is being run by tsx)
    // Or if running via npm.
    const isGlobal = !process.env.npm_lifecycle_event && process.argv[1].includes('bin.js');
    const runCmd = isGlobal ? 'ganapathi' : 'npm run ganapathi';

    console.log(LOGO);
    console.log(`${COLORS.BRIGHT}USAGE:${COLORS.RESET}`);
    console.log(`  ${runCmd} <command> [options]\n`);

    console.log(`${COLORS.BRIGHT}COMMANDS:${COLORS.RESET}`);
    console.log(`  ${COLORS.CYAN}doctor${COLORS.RESET}             Pulse check: scan project health, configuration & errors`);
    console.log(`  ${COLORS.CYAN}explain <dir>${COLORS.RESET}      AI architecture review: explains folder structure & purpose`);
    console.log(`  ${COLORS.CYAN}audit <file/dir>${COLORS.RESET}   Deep deep-dive: audit code for bugs and security risks`);
    console.log(`  ${COLORS.CYAN}fix <file>${COLORS.RESET}         Auto-surgeon: analyze file and suggest/apply AI corrections`);
    console.log(`  ${COLORS.CYAN}chat${COLORS.RESET}               Mentor session: start an interactive AI brainstorm session`);
    console.log(`  ${COLORS.CYAN}--help / -h${COLORS.RESET}        Show this help message\n`);

    console.log(`${COLORS.BRIGHT}EXAMPLES:${COLORS.RESET}`);
    console.log(`  ${runCmd} doctor`);
    console.log(`  ${runCmd} explain app/dashboard`);
    console.log(`  ${runCmd} chat`);
}

/**
 * Audit command handler
 */
async function handleAudit(target: string) {
    if (!target) {
        console.error(`${COLORS.RED}Error: Target file or directory required.${COLORS.RESET}`);
        return;
    }

    const absPath = path.resolve(process.cwd(), target);
    try {
        const stats = await fs.stat(absPath);
        if (stats.isDirectory()) {
            await auditDirectory(absPath);
        } else {
            await auditFile(absPath);
        }
    } catch (e: any) {
        console.error(`${COLORS.RED}Error: ${e.message}${COLORS.RESET}`);
    }
}

async function auditFile(filePath: string) {
    const fileName = path.basename(filePath);
    console.log(`${COLORS.BLUE}Auditing file: ${COLORS.RESET}${fileName}...`);

    const content = await fs.readFile(filePath, 'utf-8');
    const prompt = `
Analyze the following code for quality, performance, and security issues.
Perform a strict code review session.
File: ${fileName}

Code:
\`\`\`
${content.substring(0, 10000)}
\`\`\`

Format your response as a structured audit report in terminal colors (using standard markdown-like formatting).
Include sections for: 🚀 Summary, ❌ Bugs & Risks, 💡 Suggestions.
Keep it concise and professional.
    `;

    try {
        const { text } = await generateText(prompt, { system: "You are the Ganapathi CLI Mentor. You identify issues in local codebases." });
        console.log(`\n${COLORS.BRIGHT}AUDIT REPORT For ${fileName}${COLORS.RESET}\n`);
        process.stdout.write(text + '\n');
    } catch (e: any) {
        console.error(`${COLORS.RED}Audit failed: ${e.message}${COLORS.RESET}`);
    }
}

async function auditDirectory(dirPath: string) {
    console.log(`${COLORS.BLUE}Auditing directory: ${COLORS.RESET}${path.basename(dirPath)}...`);
    const files = await getFilesRecursive(dirPath);
    console.log(`Found ${files.length} files to review.\n`);

    for (const file of files) {
        if (['.ts', '.tsx', '.js', '.jsx', '.py', '.go'].includes(path.extname(file))) {
            await auditFile(file);
            console.log(`${COLORS.WHITE}${"-".repeat(40)}${COLORS.RESET}\n`);
        }
    }
}

/**
 * Fix command handler
 */
async function handleFix(target: string) {
    if (!target) {
        console.error(`${COLORS.RED}Error: Target file required for fix.${COLORS.RESET}`);
        return;
    }

    const absPath = path.resolve(process.cwd(), target);
    const content = await fs.readFile(absPath, 'utf-8');
    const fileName = path.basename(absPath);

    console.log(`${COLORS.YELLOW}Analyzing ${fileName} for fixes...${COLORS.RESET}`);

    const prompt = `
Analyze this file and provide a FIXED version.
Fix bugs, clarify logic, or improve performance.
File: ${fileName}

Input Code:
\`\`\`
${content.substring(0, 10000)}
\`\`\`

Your response MUST follow this format:
REASONING: [Explain what you fixed]
FIXED_CODE:
[The full code of the file after fixes]
    `;

    try {
        const { text } = await generateText(prompt, { system: "You are the Ganapathi Auto-Fix Agent. You provide full file replacements with fixes." });

        const reasoningMatch = text.match(/REASONING:\s*([\s\S]*?)\nFIXED_CODE:/i);
        const codeMatch = text.match(/FIXED_CODE:\s*\n?([\s\S]*)/i);

        if (reasoningMatch && codeMatch) {
            console.log(`\n${COLORS.GREEN}${COLORS.BRIGHT}SUGGESTED CHANGES:${COLORS.RESET}`);
            console.log(reasoningMatch[1].trim());
            console.log(`\n${COLORS.WHITE}${"=".repeat(20)} PROPOSED CODE ${"=".repeat(20)}${COLORS.RESET}\n`);

            // Just show snippet or instructions
            console.log(`${COLORS.CYAN}AI has prepared a fixed version of the code.${COLORS.RESET}`);

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question(`\n${COLORS.YELLOW}Apply changes to ${fileName}? (y/N): ${COLORS.RESET}`, async (answer) => {
                if (answer.toLowerCase() === 'y') {
                    const cleanCode = codeMatch[1].trim().replace(/^```[a-z]*\n|```$/g, '');
                    await fs.writeFile(absPath, cleanCode);
                    console.log(`\n${COLORS.GREEN}✔ Successfully applied fixes to ${fileName}!${COLORS.RESET}`);
                } else {
                    console.log(`\n${COLORS.RED}Skipped applying changes.${COLORS.RESET}`);
                }
                rl.close();
            });
        } else {
            console.log(`${COLORS.YELLOW}AI did not suggest any critical changes or output format was incorrect.${COLORS.RESET}`);
            console.log(text);
        }
    } catch (e: any) {
        console.error(`${COLORS.RED}Fix failed: ${e.message}${COLORS.RESET}`);
    }
}

/**
 * Pulse check: scan project health
 */
async function handleDoctor() {
    console.log(`${COLORS.YELLOW}🩺 Running Ganapathi Diagnostic Scan...${COLORS.RESET}\n`);

    const checks = [
        { name: 'Environment Configuration', check: async () => !!process.env.GROQ_API_KEY || !!process.env.MISTRAL_API_KEY },
        { name: 'Supabase URL Config', check: async () => !!process.env.NEXT_PUBLIC_SUPABASE_URL },
        { name: 'MongoDB URI Config', check: async () => !!process.env.MONGODB_URI },
        {
            name: 'Package Installation', check: async () => {
                const nodeModules = await fs.stat(path.resolve(process.cwd(), 'node_modules')).catch(() => null);
                return !!nodeModules;
            }
        },
        {
            name: 'Tailwind Configuration', check: async () => {
                const tw = await fs.stat(path.resolve(process.cwd(), 'tailwind.config.ts')).catch(() => null);
                return !!tw;
            }
        }
    ];

    let passed = 0;
    for (const c of checks) {
        try {
            const ok = await c.check();
            if (ok) {
                console.log(`${COLORS.GREEN}✔${COLORS.RESET} ${c.name}`);
                passed++;
            } else {
                console.log(`${COLORS.RED}✘${COLORS.RESET} ${c.name} - ${COLORS.YELLOW}Action required${COLORS.RESET}`);
            }
        } catch (e) {
            console.log(`${COLORS.RED}✘${COLORS.RESET} ${c.name} - Error: ${(e as any).message}`);
        }
    }

    console.log(`\n${COLORS.BRIGHT}Health Score: ${passed}/${checks.length}${COLORS.RESET}`);

    if (passed < checks.length) {
        console.log(`\n${COLORS.YELLOW}Advice: Run 'npm install' or check your .env.local settings.${COLORS.RESET}`);
    } else {
        console.log(`\n${COLORS.GREEN}Everything looks neural. You are ready to build!${COLORS.RESET}`);
    }
}

/**
 * AI Architecture review
 */
async function handleExplain(targetDir: string) {
    const absPath = path.resolve(process.cwd(), targetDir);
    console.log(`${COLORS.BLUE}Analyzing architecture: ${COLORS.RESET}${targetDir}...`);

    try {
        const stats = await fs.stat(absPath);
        if (!stats.isDirectory()) {
            console.error(`${COLORS.RED}Error: Target must be a directory.${COLORS.RESET}`);
            return;
        }

        const items = await fs.readdir(absPath);
        const folderStructure = items.slice(0, 50).join(', ');

        const prompt = `
Analyze the following folder structure and explain its purpose within a Next.js / TypeScript project.
Target Directory: ${targetDir}
Items: ${folderStructure}

Output format:
- 🔥 Core Purpose: [1-2 sentences]
- 🏗 Architecture: [Major patterns seen]
- 💡 Recommendation: [How to grow this part of the app]
        `;

        const { text } = await generateText(prompt, { system: "You are the Ganapathi Architectural Advisor. You explain complex codebases simply." });
        console.log(`\n${COLORS.BRIGHT}ARCHITECTURE INSIGHT: ${targetDir}${COLORS.RESET}\n`);
        console.log(text);
    } catch (e: any) {
        console.error(`${COLORS.RED}Explanation failed: ${e.message}${COLORS.RESET}`);
    }
}

/**
 * Chat command handler
 */
async function handleChat() {
    console.log(`${COLORS.GREEN}Starting neural interactive session...${COLORS.RESET}`);
    console.log(`${COLORS.WHITE}Type 'exit' or 'quit' to end session.${COLORS.RESET}\n`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const ask = () => {
        rl.question(`${COLORS.CYAN}${COLORS.BRIGHT}Mentor@Ganapathi > ${COLORS.RESET}`, async (input) => {
            if (['exit', 'quit', 'bye', 'stop'].includes(input.toLowerCase().trim())) {
                console.log(`\n${COLORS.MAGENTA}Keep building the future! Goodbye.${COLORS.RESET}`);
                rl.close();
                return;
            }

            try {
                process.stdout.write(`${COLORS.YELLOW}Synchronizing neurons...${COLORS.RESET}\r`);
                const { text } = await generateText(input, {
                    system: "You are Ganapathi Mentor AI v2.0. You are helping a developer in their terminal. You provide specialized, high-performance coding and debugging advice."
                });
                process.stdout.write(' '.repeat(25) + '\r');
                console.log(`\n${text}\n`);
            } catch (e: any) {
                console.error(`\n${COLORS.RED}Neural link interrupted: ${e.message}${COLORS.RESET}`);
            }
            ask();
        });
    };

    ask();
}

/**
 * Utils
 */
async function getFilesRecursive(dir: string): Promise<string[]> {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            if (['node_modules', '.git', '.next', 'dist', '.vercel'].includes(dirent.name)) return [];
            return getFilesRecursive(res);
        }
        return res;
    }));
    return files.flat();
}

main().catch(console.error);
