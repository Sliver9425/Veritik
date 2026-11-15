import { AnalysisResult, CommentSample, Profile, Signal, Username, VideoStats } from '../../domain';
import type { AnalysisRecord } from './records';

function parseDate(text: string): Date {
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) throw new Error(`Fecha inválida: ${text}`);
  return date;
}

export function toRecord(result: AnalysisResult): AnalysisRecord {
  const p = result.profile;
  return {
    id: result.id,
    analyzedAt: result.analyzedAt.toISOString(),
    profile: {
      username: p.username.value,
      followers: p.followers,
      following: p.following,
      totalLikes: p.totalLikes,
      videoCount: p.videoCount,
      videos: p.videos.map((v) => ({
        id: v.id, url: v.url, publishedAt: v.publishedAt.toISOString(),
        views: v.views, likes: v.likes, comments: v.comments, shares: v.shares,
      })),
      commentSample: p.commentSample
        ? { total: p.commentSample.total, genericCount: p.commentSample.genericCount }
        : null,
      fetchedAt: p.fetchedAt.toISOString(),
    },
    signals: result.signals.map((s) => ({ id: s.id, score: s.score, rawValue: s.rawValue })),
  };
}

/** Reconstruye el resultado pasando por las fábricas del dominio, así los datos corruptos se rechazan. */
export function fromRecord(record: AnalysisRecord): AnalysisResult {
  const p = record.profile;
  const profile = Profile.create({
    username: Username.create(p.username),
    followers: p.followers,
    following: p.following,
    totalLikes: p.totalLikes,
    videoCount: p.videoCount,
    videos: p.videos.map((v) =>
      VideoStats.create({
        id: v.id, url: v.url, publishedAt: parseDate(v.publishedAt),
        views: v.views, likes: v.likes, comments: v.comments, shares: v.shares,
      }),
    ),
    commentSample: p.commentSample ? CommentSample.create(p.commentSample.total, p.commentSample.genericCount) : null,
    fetchedAt: parseDate(p.fetchedAt),
  });
  return AnalysisResult.create({
    id: record.id,
    profile,
    signals: record.signals.map((s) => Signal.create({ id: s.id, score: s.score, rawValue: s.rawValue })),
    analyzedAt: parseDate(record.analyzedAt),
  });
}
