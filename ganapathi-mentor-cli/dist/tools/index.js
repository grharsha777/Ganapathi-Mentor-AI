"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolHandlers = exports.allTools = void 0;
const fs_1 = require("./fs");
const git_1 = require("./git");
const shell_1 = require("./shell");
const web_1 = require("./web");
exports.allTools = [
    ...fs_1.fsTools,
    ...git_1.gitTools,
    ...shell_1.shellTools,
    ...web_1.webTools
];
exports.toolHandlers = {
    fs_read: fs_1.fs_read,
    fs_write: fs_1.fs_write, // exported as fs_write from fs.ts
    fs_list: // exported as fs_write from fs.ts
    fs_1.fs_list,
    fs_search: fs_1.fs_search,
    git_status: git_1.git_status,
    git_diff: git_1.git_diff,
    shell_run: shell_1.shell_run,
    web_search: web_1.web_search
};
