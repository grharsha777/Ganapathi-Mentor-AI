import { fsTools, fs_read, fs_write, fs_list, fs_search } from './fs';
import { gitTools, git_status, git_diff } from './git';
import { shellTools, shell_run } from './shell';
import { webTools, web_search } from './web';

export const allTools = [
    ...fsTools,
    ...gitTools,
    ...shellTools,
    ...webTools
];

export const toolHandlers: Record<string, Function> = {
    fs_read,
    fs_write, // exported as fs_write from fs.ts
    fs_list,
    fs_search,
    git_status,
    git_diff,
    shell_run,
    web_search
};
