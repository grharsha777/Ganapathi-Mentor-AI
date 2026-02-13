/**
 * Doc generation API - AI or template fallback
 * Required env for AI: OPENAI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, MISTRAL_API_KEY, or KIMI_API_KEY
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import Documentation from '@/models/Documentation';
import { verifyToken } from '@/lib/auth';
import { getAIModelOrNull, isAIConfigured } from '@/lib/ai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = (await verifyToken(token)) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { type, context, projectName } = await req.json();

        if (!type || !context) return NextResponse.json({ error: 'Missing type and context' }, { status: 400 });

        const model = getAIModelOrNull();
        let content: string;

        if (model && isAIConfigured()) {
            const prompt = `Generate detailed ${type} documentation for a project named "${projectName || 'My Project'}". Context/Code: ${String(context).substring(0, 15000)} Format as Markdown.`;
            const { text } = await generateText({ model, prompt });
            content = text;
        } else {
            content = `# ${projectName || 'My Project'} - ${type}\n\n## Overview\nConfigure an LLM API key for AI-generated documentation.\n\n## Template Structure\n- Introduction\n- Setup\n- Usage\n- API Reference\n\n---\n*Generated at ${new Date().toISOString()}*`;
        }

        const conn = await connectSafe();
        let document: unknown = { content, type, project_name: projectName || 'Untitled' };

        if (conn && decoded.userId) {
            try {
                const newDoc = await Documentation.create({
                    user_id: decoded.userId,
                    project_name: projectName || 'Untitled',
                    type,
                    content,
                });
                document = newDoc;
            } catch (e) {
                console.warn('Doc save failed:', e);
            }
        }

        return NextResponse.json({ success: true, document });
    } catch (error: unknown) {
        console.error('Doc Generation Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Generation failed' },
            { status: 500 }
        );
    }
}
