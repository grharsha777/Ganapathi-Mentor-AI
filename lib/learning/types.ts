export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type LearningResourceType =
  | 'video'
  | 'article'
  | 'doc'
  | 'course'
  | 'paper'
  | 'practice'
  | 'project'
  | 'quiz'
  | 'checkpoint';

export type ResourceConfidence = 'verified' | 'unverified' | 'fallback' | 'invalid';

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  type: LearningResourceType;
  is_completed: boolean;
  confidence: ResourceConfidence;
  provider?: string;
  domain?: string;
  relevance_note?: string;
  freshness?: 'new' | 'recent' | 'evergreen' | 'unknown';
  estimated_minutes?: number;
  metadata?: Record<string, unknown>;
}

export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  week: number;
  due_date?: string;
  status?: 'locked' | 'current' | 'completed';
  goals?: string[];
  concepts?: string[];
  estimated_minutes?: number;
  resources: LearningResource[];
}

export interface LearningRoadmap {
  id: string;
  title: string;
  description: string;
  role: string;
  level: LearningLevel;
  durationWeeks: number;
  createdAt?: string;
  updatedAt?: string;
  milestones: LearningMilestone[];
}

export interface LearningProgressSnapshot {
  completionPercent: number;
  totalResources: number;
  completedResources: number;
  totalXP: number;
  streakDays: number;
  weeklyTargetMinutes: number;
  weeklyMinutesDone: number;
  currentWeek: number;
  nextMilestoneTitle?: string;
  lastSession?: {
    week: number;
    resourceId: string;
    resourceTitle: string;
    resourceUrl: string;
    at: string;
  };
}

