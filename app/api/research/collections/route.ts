import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { connectSafe } from '@/lib/mongodb';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchCollection from '@/models/ResearchCollection';
import ResearchItem from '@/models/ResearchItem';

const createCollectionSchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: z.string().trim().min(4).max(24).default('#00D4AA'),
  icon: z.string().trim().min(1).max(4).default('📚'),
});

interface CollectionLeanDoc {
  _id: { toString(): string };
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  shareToken?: string;
  shareExpiresAt?: Date;
}

function collectionToResponse(doc: {
  _id: { toString(): string };
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  shareToken?: string;
  shareExpiresAt?: Date;
  itemCount?: number;
}) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    color: doc.color,
    icon: doc.icon,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    shareToken: doc.shareToken,
    shareExpiresAt: doc.shareExpiresAt,
    itemCount: doc.itemCount ?? 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ collections: [] });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim();

    const filter: Record<string, unknown> = { userId: user.id };
    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }

    const collections = (await ResearchCollection.find(filter).sort({ createdAt: -1 }).lean()) as CollectionLeanDoc[];

    const ids = collections.map((collection: { _id: { toString(): string } }) => collection._id);
    const counts = await ResearchItem.aggregate([
      { $match: { collectionId: { $in: ids }, userId: user.id } },
      { $group: { _id: '$collectionId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>(
      counts.map((entry: { _id: { toString(): string }; count: number }) => [entry._id.toString(), entry.count]),
    );

    return NextResponse.json({
      collections: collections.map((collection) =>
        collectionToResponse({
          ...collection,
          itemCount: countMap.get(collection._id.toString()) ?? 0,
        }),
      ),
    });
  } catch (error) {
    console.error('Failed to list collections', error);
    return NextResponse.json({ error: 'Failed to list collections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = createCollectionSchema.parse(await req.json());

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ error: 'MongoDB is not configured' }, { status: 503 });
    }

    const collection = await ResearchCollection.create({
      userId: user.id,
      name: payload.name,
      color: payload.color,
      icon: payload.icon,
    });

    return NextResponse.json(
      {
        collection: collectionToResponse({
          _id: collection._id,
          name: collection.name,
          color: collection.color,
          icon: collection.icon,
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
          itemCount: 0,
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error('Failed to create collection', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}
