import { NextRequest, NextResponse } from 'next/server';

import { connectSafe } from '@/lib/mongodb';
import ResearchCollection from '@/models/ResearchCollection';
import ResearchItem from '@/models/ResearchItem';

interface SharedItemLeanDoc {
  _id: { toString(): string };
  query: string;
  answer: unknown;
  sources: unknown;
  createdAt: Date;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
    }

    const collection = await ResearchCollection.findOne({
      shareToken: token,
      shareExpiresAt: { $gt: new Date() },
    }).lean();

    if (!collection) {
      return NextResponse.json({ error: 'Share link not found or expired' }, { status: 404 });
    }

    const items = (await ResearchItem.find({ collectionId: collection._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()) as SharedItemLeanDoc[];

    return NextResponse.json({
      collection: {
        id: collection._id.toString(),
        name: collection.name,
        color: collection.color,
        icon: collection.icon,
        expiresAt: collection.shareExpiresAt,
      },
      items: items.map((item) => ({
        id: item._id.toString(),
        query: item.query,
        answer: item.answer,
        sources: item.sources,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error('Failed to load shared research collection', error);
    return NextResponse.json({ error: 'Failed to load shared collection' }, { status: 500 });
  }
}
