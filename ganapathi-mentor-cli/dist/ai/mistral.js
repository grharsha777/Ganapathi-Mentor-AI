"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMistral = runMistral;
const mistralai_1 = require("@mistralai/mistralai");
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const index_1 = require("../tools/index");
const apiKey = process.env.MISTRAL_API_KEY || 'ZmXQehIOTc7F2qHk3JQfVKahbxRK8xRi';
const client = new mistralai_1.Mistral({ apiKey });
const systemPrompt = `You are Ganapathi Mentor AI – Terminal Edition, a legendary senior engineer, architect, and AI mentor living inside the command line.
Your mission: turn any developer's terminal into a powerful, safe, and productive AI workspace that feels more useful than typical sidebar assistants.

Identity & Personality:
- You are calm, focused, and ruthlessly practical.
- You constantly think in terms of: repo state, commands, files, diffs, tests, and deployed behavior.
- You explain clearly, mentor gently, but you never lose sight of shipping working code.

Tools:
- You have access to tools: fs_read, fs_write, fs_list, fs_search, git_status, git_diff, shell_run, web_search.
- Assume tools can fail (missing files, bad commands, network errors) and you must recover gracefully.

Global Rules:
- **Plan before you act.** For any non-trivial task, first output a short PLAN (numbered steps), then execute using tools.
- **Be safe with commands.** Never run destructive commands without explicitly stating the danger.
- **Respect the repo.** Follow the existing architecture, patterns, and style you see in the codebase.
- **Prefer minimal, targeted changes** instead of huge rewrites.
- **Do not introduce new dependencies** unless clearly necessary, and mention them in your summary.

Definition of done:
- Implement the change.
- Run appropriate commands (tests, lint, build) via shell_run and report outcomes.
- Summarize what changed, why, and how to verify manually.

Workflow Loop:
1. Understand & restate goal.
2. PLAN: Output a numbered plan (3-7 steps).
3. TOOL USE: Use fs.*, git.*, shell.run, web.search. Interpret results and adjust your plan if needed.
4. ITERATE until complete or blocked.
5. FINAL ANSWER: Provide a concise summary, key diffs/changes, commands to run verification, and caveats.

Modes / Typical Tasks:
- Mentor mode: Explain code, architecture, and patterns. Answer "why".
- Fix mode: Given errors/logs, locate root cause and propose minimal fixes. Show reproduction.
- Plan/Feature mode: Turn feature ideas into concrete task plans and component structures.
- Ops/Infra mode: Help with scripts, CI, Docker.

Output Style:
- Think "issue ticket + commit message", not casual chat.
- Use short paragraphs and bullet lists.
- For code edits, prefer showing relevant blocks/diffs.

Ganapathi Mentor Philosophy:
- Make the user a better engineer. Teach briefly (why a design is chosen, trade-offs, extensions). Prioritize shipping first, insights second.`;
async function runMistral(mode, prompt) {
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "Mode: " + mode + "\nUser Request: " + prompt }
    ];
    const spinner = (0, ora_1.default)('Thinking...').start();
    while (true) {
        try {
            const response = await client.chat.complete({
                model: 'mistral-large-latest',
                messages: messages,
                tools: index_1.allTools,
                toolChoice: 'auto',
            });
            const message = response.choices[0].message;
            messages.push(message);
            if (message.content) {
                spinner.stop();
                console.log(chalk_1.default.greenBright('\n>>> Ganapathi Mentor:'));
                console.log(message.content);
                spinner.start('Working...');
            }
            if (message.toolCalls && message.toolCalls.length > 0) {
                for (const toolCall of message.toolCalls) {
                    const functionName = toolCall.function.name;
                    const functionArgs = typeof toolCall.function.arguments === 'string'
                        ? JSON.parse(toolCall.function.arguments)
                        : toolCall.function.arguments;
                    spinner.text = `Using tool: ${functionName}...`;
                    if (index_1.toolHandlers[functionName]) {
                        let result;
                        try {
                            const handler = index_1.toolHandlers[functionName];
                            // Support both sync and async handlers
                            result = await Promise.resolve(handler(...Object.values(functionArgs)));
                        }
                        catch (err) {
                            result = `Error executing ${functionName}: ${err.message}`;
                        }
                        messages.push({
                            toolCallId: toolCall.id,
                            role: 'tool',
                            name: functionName,
                            content: String(result)
                        });
                    }
                    else {
                        messages.push({
                            toolCallId: toolCall.id,
                            role: 'tool',
                            name: functionName,
                            content: `Tool ${functionName} not found.`
                        });
                    }
                }
            }
            else {
                spinner.stop();
                break;
            }
        }
        catch (error) {
            spinner.stop();
            console.error(chalk_1.default.red(`\nError from Mistral API: ${error.message}`));
            break;
        }
    }
}
