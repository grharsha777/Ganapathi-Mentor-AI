import type { LearningProgressSnapshot, LearningRoadmap, LearningResource } from '@/lib/learning/types';

function isRealResource(resource: any): boolean {
  return Boolean(resource?.url && String(resource.url).trim().length > 0 && resource.confidence !== 'invalid');
}

function xpForResource(resource: LearningResource): number {
  if (resource.confidence === 'fallback' || resource.confidence === 'invalid') return 0;
  if (!resource.url) return 0;

  const weights: Partial<Record<LearningResource['type'], number>> = {
    video: 15,
    doc: 12,
    article: 10,
    paper: 10,
    practice: 10,
    quiz: 12,
    checkpoint: 12,
    project: 35,
    course: 25,
  };

  return weights[resource.type] ?? 10;
}

export function serializeLearningPath(doc: any): LearningRoadmap {
  const milestones = (doc.milestones || []).map((m: any) => ({
    id: String(m._id ?? ''),
    title: m.title,
    description: m.description,
    week: m.week,
    due_date: m.due_date ? new Date(m.due_date).toISOString() : undefined,
    goals: m.goals ?? [],
    concepts: m.concepts ?? [],
    estimated_minutes: m.estimated_minutes ?? 0,
    resources: (m.resources || []).map((r: any) => ({
      id: String(r._id ?? ''),
      title: r.title,
      url: r.url ?? '',
      type: r.type,
      is_completed: Boolean(r.is_completed),
      confidence: r.confidence ?? 'unverified',
      provider: r.provider,
      domain: r.domain,
      relevance_note: r.relevance_note,
      freshness: r.freshness ?? 'unknown',
      estimated_minutes: r.estimated_minutes,
      metadata: r.metadata ?? {},
    })),
  }));

  return {
    id: String(doc._id ?? 'generated'),
    title: doc.title,
    description: doc.description,
    role: doc.role ?? 'Developer',
    level: doc.level ?? 'Intermediate',
    durationWeeks: Number(doc.duration_weeks ?? milestones.length ?? 4),
    createdAt: doc.created_at ? new Date(doc.created_at).toISOString() : undefined,
    updatedAt: doc.updated_at ? new Date(doc.updated_at).toISOString() : undefined,
    milestones,
  };
}

export function computeProgressSnapshot(roadmap: LearningRoadmap, doc?: any): LearningProgressSnapshot {
  const all = roadmap.milestones.flatMap((m) => m.resources);
  const real = all.filter((resource) => isRealResource(resource));
  const completed = real.filter((resource) => resource.is_completed);

  const totalResources = real.length;
  const completedResources = completed.length;
  const completionPercent = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;
  const totalXP = completed.reduce((sum, resource) => sum + xpForResource(resource), 0);

  const currentWeek = Math.max(
    1,
    roadmap.milestones.find((m) => m.resources.some((r) => isRealResource(r) && !r.is_completed))?.week ?? 1,
  );

  const nextMilestone = roadmap.milestones.find((m) => m.week >= currentWeek);

  return {
    completionPercent,
    totalResources,
    completedResources,
    totalXP,
    streakDays: Number(doc?.streak_days ?? 0),
    weeklyTargetMinutes: Number(doc?.weekly_target_minutes ?? 150),
    weeklyMinutesDone: 0,
    currentWeek,
    nextMilestoneTitle: nextMilestone?.title,
    lastSession: doc?.last_session ?? undefined,
  };
}

export function computeNextStreak(lastActivityAt: Date | null | undefined, now: Date, previousStreak: number): number {
  if (!lastActivityAt) return 1;
  const last = new Date(lastActivityAt);
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((today - lastDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return Math.max(1, previousStreak);
  if (diffDays === 1) return Math.max(1, previousStreak + 1);
  return 1;
}

