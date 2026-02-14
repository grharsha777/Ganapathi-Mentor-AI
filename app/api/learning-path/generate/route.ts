/**
 * Learning path API - AI or template fallback
 * Required env for AI: OPENAI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, MISTRAL_API_KEY, or KIMI_API_KEY
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import LearningPath from '@/models/LearningPath';
import { verifyToken } from '@/lib/auth';
import { getAIModelOrNull, isAIConfigured } from '@/lib/ai';
import { generateObject } from 'ai';
import { z } from 'zod';

const roadmapSchema = z.object({
    title: z.string(),
    description: z.string(),
    milestones: z.array(z.object({
        title: z.string(),
        description: z.string(),
        week: z.number(),
        resources: z.array(z.object({
            title: z.string(),
            url: z.string(),
            type: z.enum(['video', 'article', 'doc', 'course']),
            is_completed: z.boolean().optional(),
        })),
    })),
});

const TEMPLATE_ROADMAP = (role: string) => ({
    title: `${role} Mastery Path`,
    description: `A 4-week journey to master ${role}. Configure an LLM API key for AI-generated roadmaps.`,
    milestones: [
        { week: 1, title: 'Foundations', description: 'Core concepts and setup', resources: [{ title: 'Getting Started', url: 'https://example.com', type: 'article' as const, is_completed: false }] },
        { week: 2, title: 'Intermediate Skills', description: 'Build on basics', resources: [{ title: 'Deep Dive', url: 'https://example.com', type: 'video' as const, is_completed: false }] },
        { week: 3, title: 'Advanced Topics', description: 'Master complex patterns', resources: [{ title: 'Advanced Guide', url: 'https://example.com', type: 'doc' as const, is_completed: false }] },
        { week: 4, title: 'Project Practice', description: 'Apply learning', resources: [{ title: 'Capstone', url: 'https://example.com', type: 'course' as const, is_completed: false }] },
    ],
});

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = (await verifyToken(token)) as { userId: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { role, repoUrl, focusAreas } = await req.json();
        const roleStr = role || 'Developer';

        const model = getAIModelOrNull();
        let roadmap;

        if (model && isAIConfigured()) {
            try {
                const prompt = `Create a personalized 4-week learning roadmap for a ${roleStr}. Focus: ${focusAreas || 'General improvement'}. Provide 4 milestones (1 per week) with resources (title, url, type: video|article|doc|course).`;
                const { object } = await generateObject({ model, schema: roadmapSchema, prompt });
                roadmap = object;
            } catch (e) {
                console.warn('AI roadmap failed, using template:', e);
                roadmap = TEMPLATE_ROADMAP(roleStr);
            }
        } else {
            roadmap = TEMPLATE_ROADMAP(roleStr);
        }

        const conn = await connectSafe();
        if (conn && decoded.userId) {
            try {
                await LearningPath.create({
                    user_id: decoded.userId,
                    title: roadmap.title,
                    description: roadmap.description,
                    role: roleStr,
                    generated_from_repo_url: repoUrl,
                    milestones: roadmap.milestones.map((m: { title: string; description: string; week: number; resources: { title: string; url: string; type: string; is_completed?: boolean }[] }, idx: number) => ({
                        title: m.title,
                        description: m.description,
                        week: m.week,
                        order_index: idx,
                        due_date: new Date(Date.now() + m.week * 7 * 24 * 60 * 60 * 1000),
                        resources: (m.resources || []).map((r: { title: string; url: string; type: string; is_completed?: boolean }) => ({ ...r, is_completed: r.is_completed ?? false })),
                    })),
                });
            } catch (e) {
                console.warn('LearningPath save failed:', e);
            }
        }

        return NextResponse.json({ success: true, roadmap });
    } catch (error: unknown) {
        console.error('Learning Path Generation Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate path' },
            { status: 500 }
        );
    }
}
