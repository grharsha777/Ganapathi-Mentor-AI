import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { connectSafe } from '@/lib/mongodb';
import { researchModeSchema, structuredResearchSchema } from '@/lib/research/schemas';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchHistory from '@/models/ResearchHistory';

const saveHistorySchema = z.object({
  query: z.string().trim().min(2).max(600),
  mode: researchModeSchema,
  answer: structuredResearchSchema,
  sources: z.array(z.record(z.unknown())).default([]),
  metadata: z.record(z.unknown()).default({}),
});

interface HistoryLeanDoc {
  _id: { toString(): string };
  query: string;
  mode: string;
  answer: unknown;
  sources: unknown;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ history: [] });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim();
    const limitParam = Number(req.nextUrl.searchParams.get('limit') ?? '100');
    const limit = Number.isFinite(limitParam) ? Math.min(100, Math.max(1, limitParam)) : 50;

    const filter: Record<string, unknown> = { userId: user.id };
    if (q) {
      filter.$or = [
        { query: { $regex: q, $options: 'i' } },
        { answerText: { $regex: q, $options: 'i' } },
      ];
    }

    const history = (await ResearchHistory.find(filter).sort({ createdAt: -1 }).limit(limit).lean()) as HistoryLeanDoc[];

    return NextResponse.json({
      history: history.map((entry) => ({
        id: entry._id.toString(),
        query: entry.query,
        mode: entry.mode,
        answer: entry.answer,
        sources: entry.sources,
        metadata: entry.metadata,
        createdAt: entry.createdAt,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch research history', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = saveHistorySchema.parse(await req.json());

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ ok: true, storage: 'local-only' });
    }

    const answerText = [
      payload.answer.tldr,
      ...payload.answer.answer_sections.map((section) => section.content),
    ].join(' ');

    const saved = await ResearchHistory.create({
      userId: user.id,
      query: payload.query,
      mode: payload.mode,
      answer: payload.answer,
      sources: payload.sources,
      answerText,
      metadata: payload.metadata,
    });

    return NextResponse.json(
      {
        item: {
          id: saved._id.toString(),
          query: saved.query,
          mode: saved.mode,
          createdAt: saved.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error('Failed to save research history', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}
