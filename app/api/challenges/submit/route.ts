import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import Challenge from '@/models/Challenge';
import Submission from '@/models/Submission';
import { wrapCode } from '../../../../lib/execution-wrapper';

// Wandbox API configuration
const WANDBOX_API_URL = 'https://wandbox.org/api/compile.json';

// Mapping language name -> Wandbox compiler name
const LANGUAGE_MAP: Record<string, string> = {
    python: 'cpython-3.14.0',
    javascript: 'nodejs-20.17.0',
    cpp: 'gcc-13.2.0',
    java: 'openjdk-jdk-22+36',
};

async function executeCode(sourceCode: string, language: string, stdin: string): Promise<{
    stdout: string; stderr: string; status: string; time: string; memory: number;
}> {
    const compiler = LANGUAGE_MAP[language];

    if (!compiler) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const response = await fetch(WANDBOX_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code: sourceCode,
            compiler: compiler,
            stdin: stdin
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Wandbox API failed: ${errorText}`);
    }

    const result = await response.json();

    // Wandbox returns status "0" for success, non-zero for error
    const isError = result.status !== "0";

    return {
        stdout: (result.program_message || '').trim(),
        stderr: (result.program_error || result.compiler_error || '').trim(),
        status: isError ? (result.compiler_error ? 'Compilation Error' : 'Runtime Error') : 'Accepted',
        time: '0',
        memory: 0,
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

        const testCases = challenge.testCases || [];
        let passedTests = 0;
        const totalTests = testCases.length;
        let lastOutput = '';
        let overallStatus = 'Accepted';
        let totalTime = 0;
        let maxMemory = 0;

        for (const tc of testCases) {
            try {
                const wrappedCode = wrapCode(challenge.slug, language, code);
                const result = await executeCode(wrappedCode, language, tc.input);

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

        const userId = decoded.userId || decoded.id;

        const submission = await Submission.create({
            user_id: userId,
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

        // Award XP and update metrics if Accepted
        if (overallStatus === 'Accepted') {
            try {
                const { awardChallengeXP, updateUserMetrics } = await import('@/lib/metrics');

                // Check if this is the first time the user solves this specific challenge
                const previousAccepted = await Submission.findOne({
                    user_id: userId,
                    challenge_id: challengeId,
                    status: 'Accepted',
                    _id: { $ne: submission._id }
                });

                if (!previousAccepted) {
                    await awardChallengeXP(userId, challenge.difficulty);
                }

                // Always update streak/last_active
                await updateUserMetrics(userId);
            } catch (metricsErr) {
                console.error('Failed to update metrics:', metricsErr);
            }
        }

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
