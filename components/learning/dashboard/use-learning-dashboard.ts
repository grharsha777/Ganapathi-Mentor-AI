'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useContentStore } from '@/lib/content-store';

import type { LearningProgressSnapshot, LearningRoadmap, LearningResource } from '@/lib/learning/types';

function isMongoId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}

function computeLocalProgress(roadmap: LearningRoadmap, persisted?: Partial<LearningProgressSnapshot> | null): LearningProgressSnapshot {
  const resources = roadmap.milestones.flatMap((m) => m.resources);
  const real = resources.filter((r) => Boolean(r.url && r.confidence !== 'invalid' && r.confidence !== 'fallback'));
  const completed = real.filter((r) => r.is_completed);
  const completionPercent = real.length ? Math.round((completed.length / real.length) * 100) : 0;

  const currentWeek = Math.max(
    1,
    roadmap.milestones.find((m) => m.resources.some((r) => Boolean(r.url) && !r.is_completed && r.confidence !== 'fallback'))?.week ?? 1,
  );

  return {
    completionPercent,
    totalResources: real.length,
    completedResources: completed.length,
    totalXP: persisted?.totalXP ?? completed.length * 10,
    streakDays: persisted?.streakDays ?? 0,
    weeklyTargetMinutes: persisted?.weeklyTargetMinutes ?? 150,
    weeklyMinutesDone: persisted?.weeklyMinutesDone ?? 0,
    currentWeek,
    nextMilestoneTitle: roadmap.milestones.find((m) => m.week >= currentWeek)?.title,
    lastSession: persisted?.lastSession,
  };
}

export function useLearningDashboard() {
  const store = useContentStore('roadmaps');

  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [progress, setProgress] = useState<LearningProgressSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    setLoading(true);
    setError(null);

    const local = await store.load<{ roadmap: LearningRoadmap; progress?: LearningProgressSnapshot }>('learning:last');
    if (local?.roadmap) {
      setRoadmap(local.roadmap);
      setProgress(computeLocalProgress(local.roadmap, local.progress ?? null));
    }

    try {
      const response = await fetch('/api/learning-path/latest', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load learning stream');
      }

      const payload = (await response.json()) as { roadmap: LearningRoadmap | null; progress: LearningProgressSnapshot | null };
      if (payload.roadmap) {
        setRoadmap(payload.roadmap);
        setProgress(payload.progress ?? computeLocalProgress(payload.roadmap, payload.progress));
        await store.save('learning:last', { roadmap: payload.roadmap, progress: payload.progress ?? undefined }, payload.roadmap.role);
      } else {
        if (!local?.roadmap) {
          setRoadmap(null);
          setProgress(null);
        }
      }
    } catch (e) {
      if (!local?.roadmap) {
        setError(e instanceof Error ? e.message : 'Failed to load learning dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    hydrate().catch(() => setLoading(false));
  }, [hydrate]);

  const generateNewPath = useCallback(
    async (input: { role: string; level: string; durationWeeks: number; repoUrl?: string }) => {
      setSyncing(true);
      try {
        const response = await fetch('/api/learning-path/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(input),
        });

        const payload = (await response.json()) as { roadmap?: LearningRoadmap; error?: string };
        if (!response.ok || !payload.roadmap) {
          throw new Error(payload.error || 'Failed to generate roadmap');
        }

        setRoadmap(payload.roadmap);
        const snapshot = computeLocalProgress(payload.roadmap, null);
        setProgress(snapshot);
        await store.save('learning:last', { roadmap: payload.roadmap, progress: snapshot }, payload.roadmap.role);
        toast.success('New learning stream generated');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to generate learning stream');
      } finally {
        setSyncing(false);
      }
    },
    [store],
  );

  const toggleResource = useCallback(
    async (params: { milestoneId: string; resourceId: string; completed: boolean; resource?: LearningResource }) => {
      if (!roadmap) return;

      // optimistic local update
      const nextRoadmap: LearningRoadmap = {
        ...roadmap,
        milestones: roadmap.milestones.map((m) =>
          m.id !== params.milestoneId
            ? m
            : {
                ...m,
                resources: m.resources.map((r) =>
                  r.id !== params.resourceId ? r : { ...r, is_completed: params.completed },
                ),
              },
        ),
      };
      setRoadmap(nextRoadmap);
      const nextProgress = computeLocalProgress(nextRoadmap, progress);
      setProgress(nextProgress);
      await store.save('learning:last', { roadmap: nextRoadmap, progress: nextProgress }, nextRoadmap.role);

      if (!isMongoId(nextRoadmap.id)) {
        return;
      }

      try {
        const response = await fetch('/api/learning-path/progress', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            pathId: nextRoadmap.id,
            milestoneId: params.milestoneId,
            resourceId: params.resourceId,
            completed: params.completed,
            lastSession: params.resource
              ? {
                  week: nextRoadmap.milestones.find((m) => m.id === params.milestoneId)?.week ?? 1,
                  resourceId: params.resourceId,
                  resourceTitle: params.resource.title,
                  resourceUrl: params.resource.url,
                  at: new Date().toISOString(),
                }
              : undefined,
          }),
        });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { roadmap: LearningRoadmap; progress: LearningProgressSnapshot };
        setRoadmap(payload.roadmap);
        setProgress(payload.progress ?? computeLocalProgress(payload.roadmap, payload.progress));
        await store.save('learning:last', { roadmap: payload.roadmap, progress: payload.progress }, payload.roadmap.role);
      } catch {
        // keep local optimistic result
      }
    },
    [progress, roadmap, store],
  );

  const setLastSession = useCallback(
    async (session: NonNullable<LearningProgressSnapshot['lastSession']>) => {
      if (!roadmap) return;
      const next = { ...(progress ?? computeLocalProgress(roadmap, null)), lastSession: session };
      setProgress(next);
      await store.save('learning:last', { roadmap, progress: next }, roadmap.role);
    },
    [progress, roadmap, store],
  );

  const flattenedResources = useMemo(() => {
    if (!roadmap) return [];
    return roadmap.milestones.flatMap((milestone) =>
      milestone.resources.map((resource) => ({ resource, milestone })),
    );
  }, [roadmap]);

  return {
    roadmap,
    progress,
    loading,
    syncing,
    error,
    hydrate,
    generateNewPath,
    toggleResource,
    setLastSession,
    flattenedResources,
  };
}

