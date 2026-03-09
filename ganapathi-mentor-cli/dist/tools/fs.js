"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsTools = void 0;
exports.fs_read = fs_read;
exports.fs_write = fs_write;
exports.fs_list = fs_list;
exports.fs_search = fs_search;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.fsTools = [
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
function fs_read(filePath) {
    try {
        return fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
    }
    catch (err) {
        return `Error reading file: ${err.message}`;
    }
}
function fs_write(filePath, content) {
    try {
        const fullPath = path.resolve(process.cwd(), filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
        return `Successfully wrote to ${filePath}`;
    }
    catch (err) {
        return `Error writing file: ${err.message}`;
    }
}
function fs_list(dirPath) {
    try {
        const files = fs.readdirSync(path.resolve(process.cwd(), dirPath));
        return files.join('\n');
    }
    catch (err) {
        return `Error listing directory: ${err.message}`;
    }
}
// Simple synchronous search
function fs_search(dirPath, pattern) {
    try {
        const fullDir = path.resolve(process.cwd(), dirPath);
        let results = [];
        const search = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            for (const item of items) {
                if (item === 'node_modules' || item === '.git')
                    continue;
                const itemPath = path.join(currentDir, item);
                const stat = fs.statSync(itemPath);
                if (stat.isDirectory()) {
                    search(itemPath);
                }
                else if (stat.isFile()) {
                    try {
                        // Basic text search. Realistically you'd use native tools, this is simplified.
                        const content = fs.readFileSync(itemPath, 'utf8');
                        if (content.includes(pattern) || new RegExp(pattern).test(content)) {
                            results.push(itemPath);
                        }
                    }
                    catch (e) { } // skip binary files
                }
            }
        };
        search(fullDir);
        return results.length > 0 ? results.join('\n') : "No matches found.";
    }
    catch (err) {
        return `Error searching: ${err.message}`;
    }
}
