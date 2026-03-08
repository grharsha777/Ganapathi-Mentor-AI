/**
 * Learning path API - AI or template fallback
 * Supports custom durations from 1 week to 3 months
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

function generateTemplateMilestones(role: string, weeks: number) {
    const phases = [
        { title: 'Foundations & Setup', description: 'Core concepts, environment setup, and fundamentals' },
        { title: 'Core Skills', description: 'Build essential skills and practical knowledge' },
        { title: 'Intermediate Patterns', description: 'Design patterns, best practices, and architecture' },
        { title: 'Advanced Techniques', description: 'Performance optimization and advanced strategies' },
        { title: 'Real-World Projects', description: 'Build production-grade applications' },
        { title: 'System Design', description: 'Large-scale architecture and distributed systems' },
        { title: 'Testing & DevOps', description: 'CI/CD, testing strategies, and deployment' },
        { title: 'Leadership & Mentoring', description: 'Code reviews, tech leadership, and team growth' },
        { title: 'Specialization Deep Dive', description: 'Domain-specific expertise and cutting-edge tech' },
        { title: 'Portfolio & Career', description: 'Showcase work and interview preparation' },
        { title: 'Open Source & Community', description: 'Contributing to OSS and building reputation' },
        { title: 'Capstone Mastery', description: 'Final comprehensive project demonstrating all skills' },
    ];

    const milestones = [];
    for (let i = 0; i < weeks; i++) {
        const phase = phases[i % phases.length];
        milestones.push({
            week: i + 1,
            title: `Week ${i + 1}: ${phase.title}`,
            description: phase.description,
            resources: [
                { title: `${role} - ${phase.title} Tutorial`, url: 'https://youtube.com/results?search_query=' + encodeURIComponent(`${role} ${phase.title} tutorial 2025`), type: 'video' as const, is_completed: false },
                { title: `${phase.title} Guide`, url: 'https://google.com/search?q=' + encodeURIComponent(`${role} ${phase.title} guide`), type: 'article' as const, is_completed: false },
            ],
        });
    }
    return milestones;
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = (await verifyToken(token)) as { userId: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { role, repoUrl, focusAreas, durationWeeks = 4, level = 'Intermediate' } = await req.json();
        const roleStr = role || 'Developer';
        const weeks = Math.max(1, Math.min(12, durationWeeks));

        const model = getAIModelOrNull();
        let roadmap;

        if (model && isAIConfigured()) {
            try {
                const prompt = `Create a personalized ${weeks}-week learning roadmap for a ${level} level ${roleStr}.
Focus areas: ${focusAreas || 'General improvement'}.
CRITICAL REQUIREMENTS:
- Generate exactly ${weeks} milestones (1 per week).
- Each milestone MUST have 5-10 resources.
- Resources MUST include real YouTube video URLs (use format https://www.youtube.com/results?search_query=TOPIC).
- Mix resource types: at least 3 videos, 2 articles, 1 documentation link per milestone.
- Make titles descriptive and specific to the topic.
- Progress from fundamentals to advanced over the ${weeks} weeks.
- Tailor difficulty to ${level} level.`;
                const { object } = await generateObject({ model, schema: roadmapSchema, prompt });
                roadmap = object;
            } catch (e) {
                console.warn('AI roadmap failed, using template:', e);
                roadmap = {
                    title: `${roleStr} Mastery Path`,
                    description: `A ${weeks}-week journey to master ${roleStr}. Configure an LLM API key for AI-generated roadmaps.`,
                    milestones: generateTemplateMilestones(roleStr, weeks),
                };
            }
        } else {
            roadmap = {
                title: `${roleStr} Mastery Path`,
                description: `A ${weeks}-week journey to master ${roleStr}. Configure an LLM API key for AI-generated roadmaps.`,
                milestones: generateTemplateMilestones(roleStr, weeks),
            };
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
