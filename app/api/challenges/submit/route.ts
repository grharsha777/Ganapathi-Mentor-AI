import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import Challenge from '@/models/Challenge';
import Submission from '@/models/Submission';

// Judge0 language IDs
const LANGUAGE_MAP: Record<string, number> = {
    python: 71,      // Python 3
    javascript: 63,  // Node.js
    cpp: 54,         // C++ (GCC)
    java: 62,        // Java
};

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_API_KEY || '';

async function executeCode(sourceCode: string, languageId: number, stdin: string): Promise<{
    stdout: string; stderr: string; status: string; time: string; memory: number;
}> {
    // If no Judge0 key, do a simple local comparison (mock execution)
    if (!JUDGE0_KEY) {
        return {
            stdout: '⚠ Judge0 API key not configured. Code was not executed.\nPlease add JUDGE0_API_KEY to .env.local',
            stderr: '',
            status: 'Pending',
            time: '0',
            memory: 0
        };
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    };

    // Submit code
    const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            source_code: sourceCode,
            language_id: languageId,
            stdin: stdin,
            cpu_time_limit: 5,
            memory_limit: 128000,
        })
    });

    if (!submitRes.ok) {
        const err = await submitRes.text();
        throw new Error(`Judge0 submission failed: ${err}`);
    }

    const result = await submitRes.json();
    return {
        stdout: (result.stdout || '').trim(),
        stderr: (result.stderr || result.compile_output || '').trim(),
        status: result.status?.description || 'Unknown',
        time: result.time || '0',
        memory: result.memory || 0,
    };
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        const { challengeId, language, code } = await req.json();

        if (!challengeId || !language || !code) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        const languageId = LANGUAGE_MAP[language];
        if (!languageId) {
            return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
        }

        const testCases = challenge.testCases || [];
        let passedTests = 0;
        let totalTests = testCases.length;
        let lastOutput = '';
        let overallStatus = 'Accepted';
        let totalTime = 0;
        let maxMemory = 0;

        for (const tc of testCases) {
            try {
                const result = await executeCode(code, languageId, tc.input);

                if (result.status === 'Pending') {
                    overallStatus = 'Pending';
                    lastOutput = result.stdout;
                    break;
                }

                totalTime += parseFloat(result.time) * 1000;
                maxMemory = Math.max(maxMemory, result.memory);

                if (result.stderr) {
                    overallStatus = result.status.includes('Compilation') ? 'Compilation Error' : 'Runtime Error';
                    lastOutput = result.stderr;
                    break;
                }

                if (result.status === 'Time Limit Exceeded') {
                    overallStatus = 'Time Limit Exceeded';
                    break;
                }

                const actual = result.stdout.trim();
                const expected = tc.expectedOutput.trim();

                if (actual === expected) {
                    passedTests++;
                } else {
                    overallStatus = 'Wrong Answer';
                    lastOutput = `Expected: ${expected}\nGot: ${actual}`;
                }
            } catch (execErr: any) {
                overallStatus = 'Runtime Error';
                lastOutput = execErr.message;
                break;
            }
        }

        if (passedTests === totalTests && totalTests > 0 && overallStatus !== 'Pending') {
            overallStatus = 'Accepted';
        }

        const submission = await Submission.create({
            user_id: decoded.userId || decoded.id,
            challenge_id: challengeId,
            language,
            code,
            status: overallStatus,
            runtime_ms: Math.round(totalTime),
            memory_kb: maxMemory,
            passed_tests: passedTests,
            total_tests: totalTests,
            output: lastOutput,
        });

        return NextResponse.json({
            submission: {
                _id: submission._id,
                status: submission.status,
                passed_tests: submission.passed_tests,
                total_tests: submission.total_tests,
                runtime_ms: submission.runtime_ms,
                memory_kb: submission.memory_kb,
                output: submission.output,
            }
        });

    } catch (error: any) {
        console.error('Submit error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
