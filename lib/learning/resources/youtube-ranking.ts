import type { LearningLevel } from '@/lib/learning/types';

function parseIso8601Duration(input?: string): number | null {
  if (!input) return null;
  const match = input.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function durationFitScore(seconds: number | null, level: LearningLevel): number {
  if (!seconds) return 40;
  const minutes = seconds / 60;

  const target: Record<LearningLevel, { min: number; max: number; sweet: number }> = {
    Beginner: { min: 8, max: 28, sweet: 16 },
    Intermediate: { min: 12, max: 45, sweet: 24 },
    Advanced: { min: 18, max: 80, sweet: 38 },
    Expert: { min: 20, max: 120, sweet: 48 },
  };

  const band = target[level];
  if (minutes < band.min) return 30;
  if (minutes > band.max) return 35;

  const distance = Math.abs(minutes - band.sweet);
  return Math.max(55, 100 - distance * 3.2);
}

function recencyScore(publishedAt?: string): number {
  if (!publishedAt) return 50;
  const t = Date.parse(publishedAt);
  if (Number.isNaN(t)) return 50;
  const ageDays = Math.max(0, (Date.now() - t) / (1000 * 60 * 60 * 24));
  if (ageDays <= 30) return 95;
  if (ageDays <= 180) return 82;
  if (ageDays <= 365) return 72;
  return 58;
}

function titleMatchScore(title: string, topic: string): number {
  const t = title.toLowerCase();
  const q = topic.toLowerCase();
  if (t.includes(q)) return 100;
  const tokens = q.split(/\s+/).filter(Boolean);
  const hits = tokens.filter((token) => t.includes(token)).length;
  return Math.min(95, 55 + hits * 10);
}

export interface RankedVideoCandidate {
  id: string;
  title: string;
  channelTitle?: string;
  publishedAt?: string;
  url: string;
  thumbnail?: string;
  durationIso?: string;
  viewCount?: number;
  likeCount?: number;
}

export function scoreVideoCandidate(candidate: RankedVideoCandidate, topic: string, level: LearningLevel): number {
  const durationSeconds = parseIso8601Duration(candidate.durationIso);
  const duration = durationFitScore(durationSeconds, level);
  const recency = recencyScore(candidate.publishedAt);
  const match = titleMatchScore(candidate.title, topic);

  const views = candidate.viewCount ?? 0;
  const viewScore = Math.min(100, 40 + Math.log10(Math.max(1, views)) * 12);

  return match * 0.45 + duration * 0.2 + recency * 0.15 + viewScore * 0.2;
}

export function estimatedMinutesFromDurationIso(durationIso?: string): number | undefined {
  const seconds = parseIso8601Duration(durationIso);
  if (!seconds) return undefined;
  return Math.max(1, Math.round(seconds / 60));
}

