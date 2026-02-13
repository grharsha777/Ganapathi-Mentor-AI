import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { getAIModel } from '@/lib/ai';
import { generateObject } from 'ai';
import { searchSerp } from '@/lib/integrations/serp';
import { searchSemanticScholar } from '@/lib/integrations/semantic-scholar';
import { generateImage, isFreepikConfigured } from '@/lib/freepik';

const explanationSchema = z.object({
    concept: z.string(),
    levels: z.object({
        beginner: z.object({
            text: z.string().describe("Simple analogy-based explanation"),
            analogy: z.string().describe("A visual analogy description")
        }),
        intermediate: z.object({
            text: z.string().describe("Technical explanation with key terms"),
            codeSnippet: z.string().describe("Example code")
        }),
        advanced: z.object({
            text: z.string().describe("Deep dive into internals/performance"),
            useCases: z.array(z.string()).describe("When to use vs avoid")
        })
    }),
    relatedConcepts: z.array(z.string())
});

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { concept, mode, messages } = await req.json();

        const model = getAIModel();

        if (mode === 'chat') {
            const chatPrompt = `
         You are a tech tutor explaining "${concept}".
    History: ${JSON.stringify(messages)}
         Answer the user's latest question concisely. Use code examples if helpful.
    `;
            const { object } = await generateObject({
                model: model as any,
                schema: z.object({ text: z.string() }),
                prompt: chatPrompt
            });
            return NextResponse.json({ text: (object as any).text });
        }

        // === Run all enrichment tasks in parallel ===
        const [explanation, webSources, papers, conceptImage] = await Promise.allSettled([
            // 1. AI Explanation
            generateObject({
                model: model as any,
                schema: explanationSchema,
                prompt: `Explain the technical concept: "${concept}".
                    Provide explanations for Beginner(Analogy), Intermediate(Code / Usage), and Advanced(Internals).`,
            }).then(res => res.object),

            // 2. SERP Web Search
            searchSerp(`${concept} programming tutorial guide`, 6),

            // 3. Semantic Scholar Papers
            searchSemanticScholar(concept, 4),

            // 4. Freepik Concept Image
            isFreepikConfigured()
                ? generateImage({
                    prompt: `Clean, modern educational diagram illustrating the concept of "${concept}" in software engineering. Minimal, professional, dark background.`,
                    num_images: 1,
                    image_size: 'landscape',
                }).catch(() => null)
                : Promise.resolve(null),
        ]);

        return NextResponse.json({
            explanation: explanation.status === 'fulfilled' ? explanation.value : null,
            webSources: webSources.status === 'fulfilled' ? webSources.value : [],
            papers: papers.status === 'fulfilled' ? papers.value : [],
            conceptImage: conceptImage.status === 'fulfilled' && conceptImage.value
                ? conceptImage.value.images?.[0] || null
                : null,
        });

    } catch (error: any) {
        console.error("Concept Explanation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
