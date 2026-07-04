import { NextRequest, NextResponse } from 'next/server';

import { connectSafe } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import LearningPath from '@/models/LearningPath';
import { computeProgressSnapshot, serializeLearningPath } from '@/lib/learning/server/serialize';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const userId = decoded.id ?? decoded.userId;
    if (!userId) return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });

    const conn = await connectSafe();
    if (!conn) {
      return NextResponse.json({ roadmap: null, progress: null, storage: 'local-only' }, { status: 200 });
    }

    const latest = await LearningPath.findOne({ user_id: userId, status: { $ne: 'archived' } })
      .sort({ updated_at: -1, created_at: -1 })
      .lean();

    if (!latest) {
      return NextResponse.json({ roadmap: null, progress: null }, { status: 200 });
    }

    const roadmap = serializeLearningPath(latest);
    const progress = computeProgressSnapshot(roadmap, latest);

    return NextResponse.json({ roadmap, progress }, { status: 200 });
  } catch (error) {
    console.error('Failed to load latest learning path', error);
    return NextResponse.json({ error: 'Failed to load learning path' }, { status: 500 });
  }
}

