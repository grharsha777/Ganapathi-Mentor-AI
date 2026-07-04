import crypto from 'crypto';

import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { connectSafe } from '@/lib/mongodb';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchCollection from '@/models/ResearchCollection';

function makeShareToken(): string {
  return crypto.randomBytes(18).toString('base64url');
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid collection id' }, { status: 400 });
    }

    const mongo = await connectSafe();
    if (!mongo) {
      return NextResponse.json({ error: 'MongoDB is not configured' }, { status: 503 });
    }

    const token = makeShareToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const collection = await ResearchCollection.findOneAndUpdate(
      { _id: id, userId: user.id },
      { shareToken: token, shareExpiresAt: expiresAt },
      { new: true },
    );

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.json({
      shareUrl: `${baseUrl}/research/shared/${token}`,
      expiresAt,
    });
  } catch (error) {
    console.error('Failed to create share link', error);
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
  }
}
