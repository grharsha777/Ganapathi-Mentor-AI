import { NextRequest, NextResponse } from 'next/server';
import { getAIModelOrNull, isAIConfigured } from '@/lib/ai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';

const devOpsAnalysisSchema = z.object({
    securityScore: z.number().describe('A score from 0 to 100 representing the security posture of the configuration.'),
    issues: z.array(z.object({
        id: z.string(),
        severity: z.enum(['critical', 'warning', 'info']),
        category: z.enum(['security', 'performance', 'best-practice', 'syntax']),
        title: z.string(),
        description: z.string(),
        recommendation: z.string(),
        lineRef: z.string().optional().describe('Approximate line of code or specific keyword related to the issue')
    })),
    optimizations: z.array(z.string()).describe('List of ways to optimize the image size, performance, or resource usage.'),
    fixedCode: z.string().describe('The complete, raw, fully fixed and optimized code file content. DO NOT wrap this in markdown backticks, just the raw text.'),
    explanation: z.string().describe('A short summary of what was fixed and why.')
});

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate user
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 2. Parse request
        const { code, type } = await req.json();
        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: 'Configuration code is required' }, { status: 400 });
        }

        // 3. Check AI configuration
        const model = getAIModelOrNull();
        if (!model || !isAIConfigured()) {
            return NextResponse.json({
                error: 'AI is not configured. Please add an API key (like GROQ_API_KEY) to your environment variables.'
            }, { status: 503 });
        }

        const fileTypeDesc = type === 'kubernetes' ? 'Kubernetes YAML manifest' : 'Dockerfile configuration';

        // 4. Construct the prompt
        const prompt = `
You are the Ganapathi DevOps Chief Architect.
Your task is to analyze the following ${fileTypeDesc} for security vulnerabilities, performance issues, and best practices.

IMPORTANT RULES IN YOUR FIXES:
- If Dockerfile: Check for 'USER root', missing multi-stage builds, 'latest' tags, hardcoded secrets, and large base images.
- If Kubernetes: Check for missing resource limits/requests, 'runAsRoot', missing health probes (liveness/readiness), and 'latest' container images.

Provide a comprehensive analysis and a COMPLETELY FIXED version of the code.

Configuration Code:
\`\`\`
${code.substring(0, 15000)}
\`\`\`
`;

        // 5. Generate Response
        const { object } = await generateObject({
            model,
            schema: devOpsAnalysisSchema,
            prompt,
        });

        return NextResponse.json({ success: true, analysis: object });

    } catch (error: any) {
        console.error('DevOps Analysis Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze configuration' },
            { status: 500 }
        );
    }
}
