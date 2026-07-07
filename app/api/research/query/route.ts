import { NextRequest } from 'next/server';
import { z } from 'zod';

import { connectSafe } from '@/lib/mongodb';
import { runResearchPipeline } from '@/lib/research/pipeline';
import { researchRequestSchema } from '@/lib/research/schemas';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchHistory from '@/models/ResearchHistory';
import { checkRateLimit } from '@/lib/rateLimit';
import { checkAndIncrementQuota } from '@/lib/quota';

const requestSchema = researchRequestSchema.extend({
  previousContext: z.string().max(4000).optional(),
  providerNames: z.array(z.string()).optional(),
});

function toSse(event: string, payload: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(req: NextRequest) {
  try {
    const parsed = requestSchema.parse(await req.json());
    const user = await getAuthenticatedUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Rate Limiting Check (In-Memory)
    const rateLimit = checkRateLimit(user.id, 'research');
    if (!rateLimit.allowed) {
        return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute.' }),
            { status: 429, headers: { 'X-RateLimit-Reset': rateLimit.resetInMs.toString() } }
        );
    }

    // Quota Enforcement (MongoDB)
    const quota = await checkAndIncrementQuota(user.id, 'research');
    if (!quota.allowed) {
        return new Response(
            JSON.stringify({ error: 'Monthly Research quota exceeded', quota }),
            { status: 429 }
        );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const publish = (event: string, payload: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(toSse(event, payload)));
        };

        const run = async () => {
          const result = await runResearchPipeline(
            {
              query: parsed.query,
              mode: parsed.mode,
              safeSearch: parsed.safeSearch,
              includeDomains: parsed.includeDomains,
              excludeDomains: parsed.excludeDomains,
              providerNames: parsed.providerNames,
              dateRange: parsed.dateRange,
              previousContext: parsed.previousContext,
            },
            (stage, payload) => {
              publish('stage', { stage, ...payload });
            },
          );

          publish('stage', { stage: 'rendering', status: 'running' });
          publish('answer_token', { token: result.answer.tldr });
          publish('stage', { stage: 'rendering', status: 'completed' });

          publish('answer', { answer: result.answer });
          publish('sources', {
            sources: result.retrieval.sources,
            providerBreakdown: result.retrieval.providerBreakdown,
          });
          publish('metadata', { ...result.metadata });

          if (user) {
            const mongo = await connectSafe();
            if (mongo) {
              const answerText = [
                result.answer.tldr,
                ...result.answer.answer_sections.map((section) => section.content),
              ].join(' ');

              await ResearchHistory.create({
                userId: user.id,
                query: parsed.query,
                mode: parsed.mode,
                answer: result.answer,
                sources: result.retrieval.sources,
                answerText,
                metadata: result.metadata,
              });
            }
          }

          publish('done', { ok: true });
          controller.close();
        };

        run().catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'Research pipeline failed';
          publish('error', { message });
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid research request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

