import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export interface PythonWikiResult {
    title: string;
    summary: string;
    url: string;
    exists: boolean;
    error?: string;
}

export async function searchWikipediaPython(query: string): Promise<PythonWikiResult> {
    try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'wiki_service.py');
        // Using 'python' or 'python3' depending on environment
        const { stdout } = await execPromise(`python "${scriptPath}" "${query.replace(/"/g, '\\"')}"`);
        return JSON.parse(stdout);
    } catch (error: any) {
        console.error('Python Wiki Bridge Error:', error);
        return { title: query, summary: '', url: '', exists: false, error: error.message };
    }
}
