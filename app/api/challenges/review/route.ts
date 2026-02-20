import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';
import { verifyToken } from '@/lib/auth';

const REVIEW_SYSTEM_PROMPT = `You are Ganapathi AI — a world-class senior software engineer and code reviewer built by G R Harsha.

Analyze the submitted code for a competitive programming problem. Provide a structured review with these sections:

## ✅ Correctness
Is the solution logically correct? Does it handle edge cases?

## ⏱️ Time Complexity
What is the Big-O time complexity? Is it optimal?

## 💾 Space Complexity
What is the space complexity? Can it be reduced?

## 🔧 Code Quality
Is the code clean, readable, and well-structured?

## 🚀 Optimization Suggestions
Provide 1-3 specific improvements with code snippets.

## 📊 Score
Rate the solution from 1-10 (1 = poor, 10 = optimal).

Keep the review concise, actionable, and educational. Use markdown formatting. Be encouraging but honest.`;

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { code, language, problemTitle, problemDescription } = await req.json();

        if (!code || !language) {
            return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
        }

        const userMessage = `Review this ${language} solution for the problem "${problemTitle || 'Unknown Problem'}":

Problem Description:
${problemDescription || 'Not provided'}

Submitted Code:
\`\`\`${language}
${code}
\`\`\`

Provide a thorough code review with correctness analysis, complexity analysis, code quality assessment, and optimization suggestions.`;

        const review = await chatCompletion(
            [{ role: 'user', content: userMessage }],
            REVIEW_SYSTEM_PROMPT
        );

        return NextResponse.json({ review });
    } catch (error: any) {
        console.error('AI Review error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate review' }, { status: 500 });
    }
}
