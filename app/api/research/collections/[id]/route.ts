import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { connectSafe } from '@/lib/mongodb';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchCollection from '@/models/ResearchCollection';
import ResearchItem from '@/models/ResearchItem';

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  color: z.string().trim().min(4).max(24).optional(),
  icon: z.string().trim().min(1).max(4).optional(),
});

interface CollectionItemLeanDoc {
  _id: { toString(): string };
  collectionId: { toString(): string };
  query: string;
  answer: unknown;
  sources: unknown;
  createdAt: Date;
}

function invalidId(id: string): boolean {
  return !mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (invalidId(id)) {
      return NextResponse.json({ error: 'Invalid collection id' }, { status: 400 });
    }

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ error: 'MongoDB is not configured' }, { status: 503 });
    }

    const collection = await ResearchCollection.findOne({ _id: id, userId: user.id }).lean();
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const items = (await ResearchItem.find({ collectionId: id, userId: user.id })
      .sort({ createdAt: -1 })
      .lean()) as CollectionItemLeanDoc[];

    return NextResponse.json({
      collection: {
        id: collection._id.toString(),
        name: collection.name,
        color: collection.color,
        icon: collection.icon,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        shareToken: collection.shareToken,
        shareExpiresAt: collection.shareExpiresAt,
      },
      items: items.map((item) => ({
        id: item._id.toString(),
        collectionId: item.collectionId.toString(),
        query: item.query,
        answer: item.answer,
        sources: item.sources,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch collection details', error);
    return NextResponse.json({ error: 'Failed to fetch collection details' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (invalidId(id)) {
      return NextResponse.json({ error: 'Invalid collection id' }, { status: 400 });
    }

    const payload = updateCollectionSchema.parse(await req.json());

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ error: 'MongoDB is not configured' }, { status: 503 });
    }

    const collection = await ResearchCollection.findOneAndUpdate(
      { _id: id, userId: user.id },
      payload,
      { new: true },
    );

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json({
      collection: {
        id: collection._id.toString(),
        name: collection.name,
        color: collection.color,
        icon: collection.icon,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        shareToken: collection.shareToken,
        shareExpiresAt: collection.shareExpiresAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error('Failed to update collection', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (invalidId(id)) {
      return NextResponse.json({ error: 'Invalid collection id' }, { status: 400 });
    }

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ error: 'MongoDB is not configured' }, { status: 503 });
    }

    const deleted = await ResearchCollection.findOneAndDelete({ _id: id, userId: user.id });
    if (!deleted) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    await ResearchItem.deleteMany({ collectionId: id, userId: user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete collection', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
