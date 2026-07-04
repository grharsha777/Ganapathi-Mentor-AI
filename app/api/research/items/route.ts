import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { connectSafe } from '@/lib/mongodb';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchCollection from '@/models/ResearchCollection';
import ResearchItem from '@/models/ResearchItem';

const saveItemSchema = z.object({
  collectionIds: z.array(z.string()).min(1),
  query: z.string().trim().min(2).max(600),
  answer: z.record(z.unknown()),
  sources: z.array(z.record(z.unknown())).default([]),
});

interface ResearchItemLeanDoc {
  _id: { toString(): string };
  collectionId: { toString(): string };
  query: string;
  answer: unknown;
  sources: unknown;
  createdAt: Date;
}

function normalizeItem(item: {
  _id: { toString(): string };
  collectionId: { toString(): string };
  query: string;
  answer: unknown;
  sources: unknown;
  createdAt: Date;
}) {
  return {
    id: item._id.toString(),
    collectionId: item.collectionId.toString(),
    query: item.query,
    answer: item.answer,
    sources: item.sources,
    createdAt: item.createdAt,
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collectionId = req.nextUrl.searchParams.get('collectionId');
    if (collectionId && !mongoose.Types.ObjectId.isValid(collectionId)) {
      return NextResponse.json({ error: 'Invalid collection id' }, { status: 400 });
    }

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ items: [] });
    }

    const filter: Record<string, unknown> = { userId: user.id };
    if (collectionId) {
      filter.collectionId = collectionId;
    }

    const items = (await ResearchItem.find(filter).sort({ createdAt: -1 }).limit(200).lean()) as ResearchItemLeanDoc[];
    return NextResponse.json({ items: items.map((item) => normalizeItem(item)) });
  } catch (error) {
    console.error('Failed to list research items', error);
    return NextResponse.json({ error: 'Failed to list research items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = saveItemSchema.parse(await req.json());

    if (payload.collectionIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json({ error: 'Invalid collection ids' }, { status: 400 });
    }

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ error: 'MongoDB is not configured' }, { status: 503 });
    }

    const ownedCollections = await ResearchCollection.find({
      _id: { $in: payload.collectionIds },
      userId: user.id,
    })
      .select('_id')
      .lean();

    if (ownedCollections.length !== payload.collectionIds.length) {
      return NextResponse.json({ error: 'One or more collections are invalid' }, { status: 403 });
    }

    const docs = ownedCollections.map((collection: { _id: mongoose.Types.ObjectId }) => ({
      collectionId: collection._id,
      userId: user.id,
      query: payload.query,
      answer: payload.answer,
      sources: payload.sources,
    }));

    const inserted = await ResearchItem.insertMany(docs);

    return NextResponse.json(
      {
        items: inserted.map((item) =>
          normalizeItem({
            _id: item._id,
            collectionId: item.collectionId,
            query: item.query,
            answer: item.answer,
            sources: item.sources,
            createdAt: item.createdAt,
          }),
        ),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error('Failed to save research item', error);
    return NextResponse.json({ error: 'Failed to save research item' }, { status: 500 });
  }
}
