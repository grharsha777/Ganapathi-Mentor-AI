
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Interview from '@/models/Interview';
import { verifyToken } from '@/lib/auth';
import { getAIModel } from '@/lib/ai';
import { generateObject } from 'ai';
import { z } from 'zod';

const interviewSchema = z.object({
    questions: z.array(z.object({
        question: z.string(),
        hint: z.string(),
        topic: z.string(),
        difficulty: z.enum(['Easy', 'Medium', 'Hard'])
    }))
});

const walkthroughSchema = z.object({
    steps: z.array(z.object({
        title: z.string().describe("Short title for this step"),
        explanation: z.string().describe("Detailed explanation of what this part of the code does"),
        file: z.string().describe("The filename or module being discussed"),
        lines: z.string().describe("Line range being discussed, e.g. '1-10'"),
        quiz: z.object({
            question: z.string(),
            options: z.array(z.string()).describe("4 multiple choice options"),
            correctIndex: z.number().describe("Index of the correct option (0-3)")
        })
    }))
});

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;

        await connectToDatabase();
        const { type, context } = await req.json();

        if (type === 'interview') {
            const prompt = `Generate 5 interview questions for a ${context} role.`;
            const model = getAIModel();

            const { object } = await generateObject({
                model: model as any,
                schema: interviewSchema,
                prompt: prompt
            });

            const interviewSession = await Interview.create({
                user_id: decoded.userId,
                topic: context,
                questions: object.questions.map(q => ({
                    question: q.question,
                }))
            });

            return NextResponse.json({ success: true, result: object, sessionId: interviewSession._id });
        }

        if (type === 'walkthrough') {
            const model = getAIModel();

            const prompt = `You are a senior developer explaining code step-by-step to a learner.
Analyze the following code and break it into 3-5 logical steps. For each step, explain what the code does, which file/section it belongs to, the relevant line range, and include a quiz question with 4 multiple-choice options.

Code to analyze:
\`\`\`
${context}
\`\`\`

Make the explanations educational, clear, and progressively building understanding.`;

            const { object } = await generateObject({
                model: model as any,
                schema: walkthroughSchema,
                prompt: prompt,
            });

            return NextResponse.json({ success: true, result: object });
        }

        return NextResponse.json({ error: "Unknown type. Use 'interview' or 'walkthrough'." }, { status: 400 });

    } catch (error: any) {
        console.error("Specialized Gen Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
