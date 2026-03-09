"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitTools = void 0;
exports.git_status = git_status;
exports.git_diff = git_diff;
const child_process_1 = require("child_process");
exports.gitTools = [
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
function git_status() {
    try {
        return (0, child_process_1.execSync)('git status', { encoding: 'utf-8', stdio: 'pipe' });
    }
    catch (err) {
        return `Git status error: ${err.message}`;
    }
}
function git_diff() {
    try {
        return (0, child_process_1.execSync)('git diff', { encoding: 'utf-8', stdio: 'pipe' });
    }
    catch (err) {
        return `Git diff error: ${err.message}`;
    }
}
