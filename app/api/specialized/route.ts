
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
        const body = await req.json();
        const { type, context, topic, difficulty, questionCount: rawQC } = body;

        if (type === 'interview') {
            const topicName = topic || context || 'General Software Engineering';
            const diffLevel = difficulty || 'Medium';
            const qCount = Math.min(20, Math.max(3, rawQC || 5));

            const prompt = `You are an expert technical interviewer. Generate ${qCount} interview questions for a ${topicName} interview at ${diffLevel} difficulty level.

Requirements:
- Questions should be practical and commonly asked in real interviews
- Include a mix of conceptual and problem-solving questions
- For ${diffLevel} difficulty: ${diffLevel === 'Easy' ? 'focus on fundamentals and basic concepts' : diffLevel === 'Hard' ? 'include system design, edge cases, and advanced patterns' : 'balance between concepts and practical application'}
- Each question should have a helpful hint
- Include an ideal brief answer for each question
- Topics must be specifically about ${topicName}
- Generate exactly ${qCount} diverse, non-repeating questions`;

            const model = getAIModel();

            const { object } = await generateObject({
                model: model as any,
                schema: interviewSchema,
                prompt: prompt
            });

            try {
                await Interview.create({
                    user_id: decoded.userId,
                    topic: topicName,
                    questions: object.questions.map(q => ({
                        question: q.question,
                    }))
                });
            } catch (saveErr) {
                console.warn('Could not save interview session:', saveErr);
            }

            return NextResponse.json({ success: true, result: object });
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
