/**
 * Code Review API - AI-powered or rule-based fallback
 * Required env for AI: OPENAI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, MISTRAL_API_KEY, or KIMI_API_KEY
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAIModelOrNull, isAIConfigured } from '@/lib/ai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { connectSafe } from '@/lib/mongodb';
import CodeReview from '@/models/CodeReview';

const analysisSchema = z.object({
  summary: z.string().describe('Brief summary of what the code does'),
  patterns: z.array(z.object({
    name: z.string(),
    explanation: z.string(),
    alternatives: z.string(),
  })),
  complexConcepts: z.array(z.object({
    concept: z.string(),
    explanation: z.string(),
    resourceLink: z.string(),
  })),
  suggestions: z.array(z.string()),
  documentation: z.string(),
});

function ruleBasedAnalysis(code: string, language: string) {
  const lines = code.split('\n');
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Long functions (> 50 lines)
  const funcMatches = code.match(/function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\(/g) || [];
  if (lines.length > 50 && funcMatches.length <= 1) {
    issues.push('Long function detected (>50 lines)');
    suggestions.push('Consider splitting into smaller functions for readability and testability.');
  }

  // console.log in production
  if (/\bconsole\.(log|debug|info)\s*\(/.test(code)) {
    issues.push('console.log/debug/info found');
    suggestions.push('Remove or replace with proper logging before production deployment.');
  }

  // TODO/FIXME comments
  const todos = code.match(/\/\/\s*(TODO|FIXME|HACK)/gi) || [];
  if (todos.length > 0) {
    issues.push(`${todos.length} TODO/FIXME comment(s) found`);
    suggestions.push('Address TODO/FIXME comments before merging.');
  }

  // No error handling in async
  if (/async\s+(function|\()/.test(code) && !/try\s*\{|\.catch\s*\(/.test(code)) {
    issues.push('Async code without try/catch or .catch()');
    suggestions.push('Add error handling for async operations.');
  }

  const summary = `Rule-based analysis of ${language || 'code'}: ${lines.length} lines, ${funcMatches.length} function(s). ${issues.length} potential issue(s) detected.`;
  const concepts = issues.map((i) => ({
    concept: i,
    explanation: 'Detected by static analysis. Configure an LLM API key for detailed explanations.',
    resourceLink: 'code review best practices',
  }));

  return {
    summary,
    patterns: [{ name: 'Static Analysis', explanation: 'Basic heuristics applied.', alternatives: 'Configure OPENAI_API_KEY or similar for AI-powered analysis.' }],
    complexConcepts: concepts,
    suggestions,
    documentation: `/**\n * ${summary}\n * Review: ${new Date().toISOString()}\n */`,
    aiDisabled: true,
  };
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = (await verifyToken(token)) as { userId?: string };
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { code, language, context } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const model = getAIModelOrNull();
    let analysis: z.infer<typeof analysisSchema> & { aiDisabled?: boolean };

    if (model && isAIConfigured()) {
      const prompt = `
Analyze the following ${language || 'code'} snippet.
Context: ${context || 'General code review'}

1. Explain the code patterns used ("Why this approach?").
2. Flag complex concepts and explain them simply.
3. Suggest 3-minute learning resources (keywords).
4. Auto-generate documentation (JSDoc/Docstring) for the whole snippet.

Code:
${code.substring(0, 10000)}
`;

      const { object } = await generateObject({
        model,
        schema: analysisSchema,
        prompt,
      });
      analysis = object;
    } else {
      analysis = ruleBasedAnalysis(code, language || 'unknown');
    }

    const conn = await connectSafe();
    if (conn && decoded.userId) {
      try {
        await CodeReview.create({
          user_id: decoded.userId,
          code_snippet: code.substring(0, 50000),
          ai_feedback: JSON.stringify(analysis),
          complexity_score: (analysis.complexConcepts?.length || 0) * 2,
        });
      } catch (dbErr) {
        console.warn('CodeReview save failed:', dbErr);
      }
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error: unknown) {
    console.error('Code Analysis Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
