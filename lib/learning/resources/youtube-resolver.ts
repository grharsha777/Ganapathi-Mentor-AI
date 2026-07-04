import { getVideoDetails, searchYouTubeVideos } from '@/lib/youtube';
import { fetchYouTubeOEmbed } from '@/lib/learning/resources/youtube-oembed';
import { extractYouTubeVideoId, isYouTubeWatchUrl } from '@/lib/learning/resources/url';
import { estimatedMinutesFromDurationIso, scoreVideoCandidate } from '@/lib/learning/resources/youtube-ranking';

import type { LearningLevel, LearningResource } from '@/lib/learning/types';

export interface YouTubeResolutionOptions {
  topic: string;
  level: LearningLevel;
  maxCandidates?: number;
}

function buildVideoResource(params: {
  id: string;
  title: string;
  url: string;
  channelTitle?: string;
  thumbnail?: string;
  durationIso?: string;
  publishedAt?: string;
  viewCount?: number;
  likeCount?: number;
  relevance?: string;
  confidence: LearningResource['confidence'];
}): LearningResource {
  return {
    id: params.id,
    type: 'video',
    title: params.title,
    url: params.url,
    is_completed: false,
    confidence: params.confidence,
    provider: params.channelTitle ?? 'YouTube',
    domain: 'youtube.com',
    relevance_note: params.relevance,
    freshness: params.publishedAt ? 'recent' : 'unknown',
    estimated_minutes: estimatedMinutesFromDurationIso(params.durationIso),
    metadata: {
      videoId: extractYouTubeVideoId(params.url),
      thumbnail: params.thumbnail,
      publishedAt: params.publishedAt,
      durationIso: params.durationIso,
      viewCount: params.viewCount,
      likeCount: params.likeCount,
      channelTitle: params.channelTitle,
    },
  };
}

export async function resolveYouTubeVideos(
  options: YouTubeResolutionOptions,
): Promise<LearningResource[]> {
  const maxCandidates = options.maxCandidates ?? 8;

  try {
    const base = await searchYouTubeVideos(options.topic, maxCandidates);
    const detailed = await Promise.all(
      base.slice(0, Math.min(maxCandidates, 6)).map(async (video) => {
        const details = await getVideoDetails(video.id).catch(() => null);
        return {
          id: video.id,
          title: video.title,
          url: video.url,
          thumbnail: video.thumbnail,
          channelTitle: video.channelTitle,
          publishedAt: video.publishedAt,
          durationIso: details?.duration,
          viewCount: details?.viewCount ? Number(details.viewCount) : undefined,
          likeCount: details?.likeCount ? Number(details.likeCount) : undefined,
        };
      }),
    );

    const ranked = detailed
      .map((candidate) => ({
        candidate,
        score: scoreVideoCandidate(candidate, options.topic, options.level),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ candidate }) =>
        buildVideoResource({
          id: `yt-${candidate.id}`,
          title: candidate.title,
          url: candidate.url,
          thumbnail: candidate.thumbnail,
          channelTitle: candidate.channelTitle,
          publishedAt: candidate.publishedAt,
          durationIso: candidate.durationIso,
          viewCount: candidate.viewCount,
          likeCount: candidate.likeCount,
          relevance: `Recommended for ${options.level} based on topic match and duration fit.`,
          confidence: 'verified',
        }),
      );

    return ranked;
  } catch {
    return [];
  }
}

export async function enrichYouTubeWatchUrl(
  watchUrl: string,
  fallbackTitle: string,
): Promise<Pick<LearningResource, 'title' | 'provider' | 'metadata'> & { thumbnail?: string }> {
  const videoId = extractYouTubeVideoId(watchUrl);
  const oembed = await fetchYouTubeOEmbed(watchUrl);

  return {
    title: oembed?.title || fallbackTitle,
    provider: oembed?.author_name || 'YouTube',
    metadata: {
      videoId,
      thumbnail: oembed?.thumbnail_url,
      authorUrl: oembed?.author_url,
      oembed: Boolean(oembed),
    },
    thumbnail: oembed?.thumbnail_url,
  };
}

export async function normalizeVideoResource(
  candidate: { url?: string; title: string },
  options: { topic: string; level: LearningLevel },
): Promise<LearningResource[]> {
  if (candidate.url && isYouTubeWatchUrl(candidate.url)) {
    const url = candidate.url.trim();
    const videoId = extractYouTubeVideoId(url) ?? url;
    const enriched = await enrichYouTubeWatchUrl(url, candidate.title);
    return [
      buildVideoResource({
        id: `yt-watch-${videoId}`,
        title: enriched.title,
        url,
        channelTitle: enriched.provider,
        thumbnail: (enriched.metadata as any)?.thumbnail as string | undefined,
        relevance: 'Direct video link provided and normalized.',
        confidence: 'unverified',
      }),
    ];
  }

  return await resolveYouTubeVideos({
    topic: options.topic,
    level: options.level,
  });
}

