/**
 * Productivity API - AI or template fallback
 * Required env for AI: OPENAI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, MISTRAL_API_KEY, or KIMI_API_KEY
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAIModelOrNull, isAIConfigured } from '@/lib/ai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';

const prioritizationSchema = z.object({
    prioritizedTasks: z.array(z.object({
        id: z.string(),
        title: z.string(),
        priority: z.enum(['High', 'Medium', 'Low']),
        score: z.number().describe("Complexity/Impact score 1-100"),
        reasoning: z.string().describe("Why this priority?"),
        suggestedDeadline: z.string().optional()
    }))
});

const agendaSchema = z.object({
    agendaItems: z.array(z.object({
        topic: z.string(),
        durationMinutes: z.number(),
        owner: z.string().optional(),
        talkingPoints: z.array(z.string())
    })),
    totalDuration: z.number(),
    summary: z.string()
});
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });


        const { action, inputData } = await req.json();

        const model = getAIModelOrNull();

        if (action === 'prioritize') {
            const tasks = Array.isArray(inputData) ? inputData : [];
            if (model && isAIConfigured()) {
                const prompt = `Rank the following tasks by urgency, impact, and complexity. Tasks: ${JSON.stringify(tasks)} Return a prioritized list with scores and reasoning.`;
                const { object } = await generateObject({
                    model,
                    schema: prioritizationSchema,
                    prompt,
                });
                return NextResponse.json({ result: object });
            }
            const prioritizedTasks = tasks.map((t: any, i: number) => ({
                id: t.id || String(i),
                title: typeof t === 'string' ? t : t.title || 'Task',
                priority: i < 2 ? 'High' : i < 4 ? 'Medium' : 'Low',
                score: Math.max(50 - i * 10, 10),
                reasoning: 'Configure an LLM API key for AI prioritization.',
            }));
            return NextResponse.json({ result: { prioritizedTasks }, aiDisabled: true });
        }

        if (action === 'agenda') {
            const context = typeof inputData === 'string' ? inputData : JSON.stringify(inputData || '');
            if (model && isAIConfigured()) {
                const prompt = `Create a meeting agenda based on this context (Slack threads / Jira tickets). Context: ${context} Suggest optimal times and breakdown.`;
                const { object } = await generateObject({
                    model,
                    schema: agendaSchema,
                    prompt,
                });
                return NextResponse.json({ result: object });
            }
            const agenda = {
                summary: 'Meeting agenda (configure LLM key for AI-generated agenda)',
                agendaItems: [
                    { topic: 'Discussion points from context', durationMinutes: 15, talkingPoints: ['Review input', 'Key decisions'] },
                    { topic: 'Action items', durationMinutes: 10, talkingPoints: ['Assign tasks', 'Follow-up'] },
                ],
                totalDuration: 25,
            };
            return NextResponse.json({ result: agenda, aiDisabled: true });
        }

        return NextResponse.json({ error: "Invalid action" });

    } catch (error: any) {
        console.error("Productivity API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
