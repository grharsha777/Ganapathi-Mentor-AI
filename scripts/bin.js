#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'ganapathi.ts');

// We use spawnSync to ensure the terminal output isn't mangled by asynchronous interleaving
const result = spawnSync('npx', ['tsx', `"${scriptPath}"`, ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
});

process.exit(result.status);
