import {
  CommentSample, Profile, Username, VideoStats,
} from '../../domain';
import type {
  AnalysisHistoryRepository, AnalysisResult, ProfileRepository, UsageQuotaRepository,
} from '../../domain';
import type { Clock } from '../ports/Clock';
import type { IdGenerator } from '../ports/IdGenerator';

export const DAY = 24 * 60 * 60 * 1000;

export function makeProfile(
  handle: string,
  opts: { followers?: number; following?: number; fetchedAt?: Date; comments?: CommentSample | null } = {},
): Profile {
  const fetchedAt = opts.fetchedAt ?? new Date('2026-11-15T12:00:00Z');
  const videos = [0, 1, 2, 3].map((i) =>
    VideoStats.create({
      id: String(i), url: `https://example.com/${i}`, publishedAt: new Date(fetchedAt.getTime() - i * 2 * DAY),
      views: 10000, likes: 400, comments: 30, shares: 10,
    }),
  );
  return Profile.create({
    username: Username.create(handle),
    followers: opts.followers ?? 48200,
    following: opts.following ?? 300,
    totalLikes: 900000,
    videoCount: 120,
    videos,
    commentSample: opts.comments === undefined ? CommentSample.create(100, 34) : opts.comments,
    fetchedAt,
  });
}

export class FakeProfileRepository implements ProfileRepository {
  calls = 0;
  constructor(private readonly respond: (u: Username) => Profile | Error) {}

  async fetchByUsername(username: Username): Promise<Profile> {
    this.calls += 1;
    const out = this.respond(username);
    if (out instanceof Error) throw out;
    return out;
  }
}

export class InMemoryHistoryRepository implements AnalysisHistoryRepository {
  items: AnalysisResult[] = [];
  async save(result: AnalysisResult): Promise<void> {
    this.items.unshift(result);
  }
  async list(limit?: number): Promise<ReadonlyArray<AnalysisResult>> {
    return limit === undefined ? [...this.items] : this.items.slice(0, limit);
  }
  async getById(id: string): Promise<AnalysisResult | null> {
    return this.items.find((r) => r.id === id) ?? null;
  }
  async clear(): Promise<void> {
    this.items = [];
  }
}

export class InMemoryQuotaRepository implements UsageQuotaRepository {
  constructor(public usage = 0) {}
  async getMonthlyUsage(): Promise<number> {
    return this.usage;
  }
  async registerAnalysis(): Promise<void> {
    this.usage += 1;
  }
}

export class SequentialIdGenerator implements IdGenerator {
  private n = 0;
  next(): string {
    this.n += 1;
    return `id-${this.n}`;
  }
}

export class FixedClock implements Clock {
  constructor(public current: Date = new Date('2026-11-15T12:00:00Z')) {}
  now(): Date {
    return this.current;
  }
}
