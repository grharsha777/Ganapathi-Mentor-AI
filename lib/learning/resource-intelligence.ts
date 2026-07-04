import crypto from 'crypto';

import type { LearningLevel, LearningMilestone, LearningResource, LearningResourceType } from '@/lib/learning/types';

import { normalizeUrl } from '@/lib/learning/resources/url';
import { validateUrl } from '@/lib/learning/resources/validate';
import { resolvePapers } from '@/lib/learning/resources/paper-resolver';
import { normalizeVideoResource } from '@/lib/learning/resources/youtube-resolver';
import { resolveWebResources } from '@/lib/learning/resources/web-resolver';

export interface ResourceIntent {
  title: string;
  url?: string;
  type: LearningResourceType;
  query?: string;
}

function stableId(seed: string): string {
  return crypto.createHash('sha1').update(seed).digest('hex').slice(0, 16);
}

function dedupeResources(resources: LearningResource[]): LearningResource[] {
  const seen = new Set<string>();
  const out: LearningResource[] = [];
  for (const resource of resources) {
    const key = normalizeUrl(resource.url).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(resource);
  }
  return out;
}

function buildPracticeSkeleton(topic: string, week: number): LearningResource[] {
  const id = stableId(`practice:${week}:${topic}`);
  return [
    {
      id: `practice-${id}`,
      type: 'practice',
      title: `Practice: ${topic} mini-drills`,
      url: '',
      is_completed: false,
      confidence: 'fallback',
      provider: 'Practice',
      domain: 'local',
      relevance_note: 'A placeholder practice block. Replace with a validated exercise provider when configured.',
      freshness: 'evergreen',
      estimated_minutes: 25,
      metadata: { placeholder: true },
    },
  ];
}

function buildProjectSkeleton(topic: string, week: number): LearningResource[] {
  const id = stableId(`project:${week}:${topic}`);
  return [
    {
      id: `project-${id}`,
      type: 'project',
      title: `Mini project: ${topic} build`,
      url: '',
      is_completed: false,
      confidence: 'fallback',
      provider: 'Project',
      domain: 'local',
      relevance_note: 'A placeholder project block. Connect a project template library for fully validated artifacts.',
      freshness: 'evergreen',
      estimated_minutes: 90,
      metadata: { placeholder: true },
    },
  ];
}

function buildQuizSkeleton(topic: string, week: number): LearningResource[] {
  const id = stableId(`quiz:${week}:${topic}`);
  return [
    {
      id: `quiz-${id}`,
      type: 'quiz',
      title: `Checkpoint quiz: ${topic}`,
      url: '',
      is_completed: false,
      confidence: 'fallback',
      provider: 'Checkpoint',
      domain: 'local',
      relevance_note: 'A placeholder checkpoint. Add a quiz engine to generate validated question sets.',
      freshness: 'evergreen',
      estimated_minutes: 12,
      metadata: { placeholder: true },
    },
  ];
}

async function normalizeArticleOrDoc(intent: ResourceIntent, index: number): Promise<LearningResource | null> {
  if (!intent.url) return null;
  const validation = await validateUrl(intent.url);
  if (!validation.ok) return null;

  const domain = validation.domain ?? 'unknown';
  return {
    id: `${intent.type}-${stableId(`${intent.type}:${intent.title}:${intent.url}`)}-${index}`,
    type: intent.type === 'doc' ? 'doc' : 'article',
    title: intent.title,
    url: validation.finalUrl ?? intent.url,
    is_completed: false,
    confidence: 'unverified',
    provider: domain,
    domain,
    relevance_note: 'Included from roadmap intent and validated for reachability.',
    freshness: 'unknown',
    estimated_minutes: intent.type === 'doc' ? 18 : 12,
    metadata: { validation },
  };
}

export async function resolveMilestoneResourceBundle(input: {
  role: string;
  level: LearningLevel;
  week: number;
  milestoneTitle: string;
  milestoneDescription: string;
  intents: ResourceIntent[];
}): Promise<LearningResource[]> {
  const topic = `${input.role} ${input.milestoneTitle}`.replace(/^Week\\s+\\d+:\\s*/i, '').trim();

  const intentVideos = input.intents.filter((intent) => intent.type === 'video');
  const intentDocs = input.intents.filter((intent) => intent.type === 'doc');
  const intentArticles = input.intents.filter((intent) => intent.type === 'article');

  const videoPromises = intentVideos.length
    ? Promise.all(intentVideos.slice(0, 2).map((intent) => normalizeVideoResource(intent, { topic, level: input.level })))
    : Promise.resolve([]);

  const docPromise =
    intentDocs.length || intentArticles.length
      ? Promise.all(
          [...intentDocs.slice(0, 1), ...intentArticles.slice(0, 1)].map((intent, idx) =>
            normalizeArticleOrDoc(intent, idx),
          ),
        )
      : Promise.resolve([]);

  const webFallbackPromise = Promise.all([
    resolveWebResources({
      query: `${topic} official documentation`,
      limit: 1,
      preferDocs: true,
      type: 'doc',
      relevance: 'Recommended as the most trustworthy reference for the current milestone.',
    }),
    resolveWebResources({
      query: `${topic} tutorial guide`,
      limit: 2,
      preferDocs: false,
      type: 'article',
      relevance: 'Recommended for step-by-step implementation context for this milestone.',
    }),
  ]);

  const paperPromise =
    input.level === 'Advanced' || input.level === 'Expert'
      ? resolvePapers(`${topic} methodology`, 2)
      : Promise.resolve([]);

  const [videoGroups, directDocs, webFallback, papers] = await Promise.all([
    videoPromises,
    docPromise,
    webFallbackPromise,
    paperPromise,
  ]);

  const videos = videoGroups.flat();
  const direct = directDocs.filter((entry): entry is LearningResource => Boolean(entry));
  const [docs, articles] = webFallback;

  const scaffolds = [
    ...buildPracticeSkeleton(topic, input.week),
    ...buildQuizSkeleton(topic, input.week),
    ...(input.week % 2 === 0 ? buildProjectSkeleton(topic, input.week) : []),
  ];

  const combined = dedupeResources([
    ...videos,
    ...direct,
    ...docs,
    ...articles,
    ...papers,
    ...scaffolds,
  ]);

  // If videos are missing, don’t promote low-quality fallbacks. Leave videos absent and rely on docs/articles.
  return combined;
}

export async function resolveRoadmapResources(input: {
  role: string;
  level: LearningLevel;
  milestones: Array<{
    title: string;
    description: string;
    week: number;
    goals?: string[];
    concepts?: string[];
    intents: ResourceIntent[];
  }>;
}): Promise<LearningMilestone[]> {
  const concurrency = 3;
  const results: LearningMilestone[] = new Array(input.milestones.length);
  let cursor = 0;

  const worker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= input.milestones.length) {
        return;
      }

      const milestone = input.milestones[index];
      const resources = await resolveMilestoneResourceBundle({
        role: input.role,
        level: input.level,
        week: milestone.week,
        milestoneTitle: milestone.title,
        milestoneDescription: milestone.description,
        intents: milestone.intents,
      });

      results[index] = {
        id: `ms-${stableId(`${input.role}:${milestone.week}:${milestone.title}`)}`,
        title: milestone.title,
        description: milestone.description,
        week: milestone.week,
        goals: milestone.goals ?? [],
        concepts: milestone.concepts ?? [],
        estimated_minutes: resources.reduce((sum, resource) => sum + (resource.estimated_minutes ?? 0), 0),
        resources,
      };
    }
  };

  await Promise.all(new Array(concurrency).fill(null).map(() => worker()));
  return results;
}
