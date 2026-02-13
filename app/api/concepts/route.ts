
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Concept from '@/models/Concept';
import { verifyToken } from '@/lib/auth';
import { getAIModel } from '@/lib/ai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Schema for AI generation
const conceptSchema = z.object({
    explanation: z.string().describe("Clear, concise explanation of the concept"),
    tags: z.array(z.string()).describe("Relevant tags (e.g. 'React', 'Hooks')"),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe("Estimated difficulty level")
});

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        await connectToDatabase();
        const { title, context } = await req.json();

        if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

        // Generate explanation using AI
        const prompt = `
            Explain the concept: "${title}".
            Context: ${context || 'General software engineering context'}.
            Keep it simple and educational.
        `;

        const model = getAIModel();

        let aiResult;
        try {
            const { object } = await generateObject({
                model: model as any,
                schema: conceptSchema,
                prompt: prompt,
            });
            aiResult = object;
        } catch (e) {
            console.error("AI Generation failed", e);
            aiResult = {
                explanation: "Failed to generate explanation. Please try again.",
                tags: ["Error"],
                difficulty: "Beginner"
            };
        }

        // Save to DB
        const newConcept = await Concept.create({
            user_id: decoded.userId,
            title: title,
            explanation: aiResult.explanation,
            tags: aiResult.tags,
            difficulty: aiResult.difficulty
        });

        return NextResponse.json({ success: true, concept: newConcept });

    } catch (error: any) {
        console.error("Concept Creation Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to create concept' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;

        await connectToDatabase();

        const concepts = await Concept.find({ user_id: decoded.userId }).sort({ created_at: -1 });

        return NextResponse.json({ success: true, concepts });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
