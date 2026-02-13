import { NextRequest, NextResponse } from 'next/server';
import { getAIModel } from '@/lib/ai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';

const brandingSchema = z.object({
    name: z.string(),
    tagline: z.string(),
    colors: z.array(z.object({
        name: z.string(),
        hex: z.string()
    })),
    font: z.string()
});

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyToken(token);

    if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
        const { prompt } = await req.json();

        const { object } = await generateObject({
            model: getAIModel() as any,
            schema: brandingSchema,
            system: "You are an expert brand identity designer. Generate a creative name, tagline, color palette, and font suggestion based on user keywords.",
            prompt: `Generate branding for: ${prompt}`,
        });

        return NextResponse.json(object);

    } catch (error: any) {
        console.error("Branding Error:", error);
        return NextResponse.json({ error: 'Failed to generate branding' }, { status: 500 });
    }
}
