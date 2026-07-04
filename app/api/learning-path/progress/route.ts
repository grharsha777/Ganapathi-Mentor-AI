import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { connectSafe } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import LearningPath from '@/models/LearningPath';
import { computeNextStreak, computeProgressSnapshot, serializeLearningPath } from '@/lib/learning/server/serialize';

const payloadSchema = z.object({
  pathId: z.string().min(1),
  milestoneId: z.string().min(1),
  resourceId: z.string().min(1),
  completed: z.boolean(),
  lastSession: z
    .object({
      week: z.number(),
      resourceId: z.string(),
      resourceTitle: z.string(),
      resourceUrl: z.string(),
      at: z.string(),
    })
    .optional(),
});

function isValidObjectId(value: string): boolean {
  return mongoose.Types.ObjectId.isValid(value);
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const userId = decoded.id ?? decoded.userId;
    if (!userId) return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });

    const parsed = payloadSchema.parse(await req.json());

    if (![parsed.pathId, parsed.milestoneId, parsed.resourceId].every(isValidObjectId)) {
      return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
    }

    const conn = await connectSafe();
    if (!conn) {
      return NextResponse.json({ error: 'MongoDB is not configured' }, { status: 503 });
    }

    const doc = await LearningPath.findOne({ _id: parsed.pathId, user_id: userId });
    if (!doc) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }

    const milestone = doc.milestones.id(parsed.milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const resource = milestone.resources.id(parsed.resourceId);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    resource.is_completed = parsed.completed;

    // Mark milestone complete only for real, non-fallback resources with URLs.
    const realResources = milestone.resources.filter((r: any) => Boolean(r.url && String(r.url).trim().length > 0) && r.confidence !== 'fallback' && r.confidence !== 'invalid');
    milestone.is_completed = realResources.length > 0 && realResources.every((r: any) => Boolean(r.is_completed));

    const now = new Date();
    const previousActivity = doc.last_activity_at ? new Date(doc.last_activity_at) : null;
    doc.streak_days = computeNextStreak(previousActivity, now, Number(doc.streak_days ?? 0));
    doc.last_activity_at = now;
    doc.last_session = parsed.lastSession ?? doc.last_session ?? null;

    await doc.save();

    const roadmap = serializeLearningPath(doc.toObject());
    const progress = computeProgressSnapshot(roadmap, doc.toObject());

    return NextResponse.json({ roadmap, progress }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error('Failed to update learning progress', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
