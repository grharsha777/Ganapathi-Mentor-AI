import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { connectSafe } from '@/lib/mongodb';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchItem from '@/models/ResearchItem';

interface ItemLeanDoc {
  _id: { toString(): string };
  collectionId: { toString(): string };
  query: string;
  answer: unknown;
  sources: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });
    }

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ error: 'MongoDB is not configured' }, { status: 503 });
    }

    const item = (await ResearchItem.findOne({ _id: id, userId: user.id }).lean()) as ItemLeanDoc | null;
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      item: {
        id: item._id.toString(),
        collectionId: item.collectionId.toString(),
        query: item.query,
        answer: item.answer,
        sources: item.sources,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });
  } catch (error) {
    console.error('Failed to fetch research item', error);
    return NextResponse.json({ error: 'Failed to fetch research item' }, { status: 500 });
  }
}
