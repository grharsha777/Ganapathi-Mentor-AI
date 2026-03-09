"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shellTools = void 0;
exports.shell_run = shell_run;
const child_process_1 = require("child_process");
// Dangerous commands that we prevent Mistral from running directly
const DANGEROUS_COMMANDS = ['rm -rf /', 'rm -rf *', 'mkfs', 'drop database'];
exports.shellTools = [
    {
        type: "function",
        function: {
            name: "shell_run",
            description: "Run safe shell commands (tests, lint, build)",
            parameters: {
                type: "object",
                properties: {
                    command: { type: "string", description: "The shell command to execute" }
                },
                required: ["command"]
            }
        }
    }
];
function shell_run(command) {
    // Simple safety check
    if (DANGEROUS_COMMANDS.some(cmd => command.includes(cmd))) {
        return `Error: execution of "${command}" was blocked for safety. Ask the user to run it manually.`;
    }
    try {
        const output = (0, child_process_1.execSync)(command, { encoding: 'utf-8', stdio: 'pipe' });
        return output || 'Command ran successfully but produced no output.';
    }
    catch (err) {
        // execSync throws if exit code is non-zero. The stdout/stderr are sometimes on the error object
        const stderr = err.stderr ? err.stderr.toString() : '';
        const stdout = err.stdout ? err.stdout.toString() : '';
        return `Command failed with exit code ${err.status}.\n${stdout}\n${stderr}\nMessage: ${err.message}`;
    }
}
