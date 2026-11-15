import { describe, expect, it } from 'vitest';
import {
  AnalysisResult, AuthenticityScore, CommentSample, InsufficientDataError, InvalidMetricError,
  InvalidUsernameError, Profile, Signal, Username, VideoStats,
} from '../index';

const DAY = 24 * 60 * 60 * 1000;

function sampleProfile(): Profile {
  const now = Date.now();
  const videos = [0, 1, 2, 3].map((i) =>
    VideoStats.create({
      id: String(i), url: `https://example.com/${i}`, publishedAt: new Date(now - i * 2 * DAY),
      views: 10000, likes: 400, comments: 30, shares: 10,
    }),
  );
  return Profile.create({
    username: Username.create('creadora.demo'), followers: 48200, following: 300,
    totalLikes: 900000, videoCount: 120, videos, commentSample: CommentSample.create(100, 34),
    fetchedAt: new Date(),
  });
}

describe('Username', () => {
  it('normaliza arroba, espacios y mayúsculas', () => {
    expect(Username.create(' @Creadora.Demo ').value).toBe('creadora.demo');
    expect(Username.create('creadora.demo').handle).toBe('@creadora.demo');
  });
  it.each(['a', 'abc.', 'con espacio', 'x'.repeat(30)])('rechaza "%s"', (raw) => {
    expect(() => Username.create(raw)).toThrow(InvalidUsernameError);
  });
});

describe('Profile', () => {
  it('calcula métricas derivadas', () => {
    const p = sampleProfile();
    expect(p.averageEngagementRate).toBeCloseTo(0.044, 5);
    expect(p.viewsToFollowersRatio).toBeCloseTo(10000 / 48200, 5);
    expect(p.postsPerWeek).toBeCloseTo(3.5, 5);
  });
  it('no permite métricas negativas', () => {
    expect(() => VideoStats.create({
      id: 'x', url: 'x', publishedAt: new Date(), views: -1, likes: 0, comments: 0, shares: 0,
    })).toThrow(InvalidMetricError);
  });
});

describe('AnalysisResult', () => {
  it('renormaliza los pesos cuando falta una señal', () => {
    const result = AnalysisResult.create({
      id: 'a1', profile: sampleProfile(), analyzedAt: new Date(),
      signals: [
        Signal.create({ id: 'engagement', score: 80 }),
        Signal.create({ id: 'viewsToFollowers', score: 60 }),
        Signal.unavailable('commentQuality'),
        Signal.create({ id: 'followRatio', score: 90 }),
      ],
    });
    // (80*0.30 + 60*0.25 + 90*0.10) / 0.65 = 73,8 -> 74
    expect(result.score.value).toBe(74);
    expect(result.level).toBe('high');
    expect(result.unavailableSignals.map((s) => s.id)).toEqual(['commentQuality']);
  });
  it('falla si no hay ninguna señal disponible', () => {
    expect(() => AnalysisResult.create({
      id: 'a2', profile: sampleProfile(), analyzedAt: new Date(), signals: [Signal.unavailable('engagement')],
    })).toThrow(InsufficientDataError);
  });
});

describe('AuthenticityScore', () => {
  it.each([[85, 'high'], [70, 'high'], [55, 'medium'], [40, 'medium'], [39, 'low']] as const)(
    '%i -> %s', (value, level) => expect(AuthenticityScore.create(value).level).toBe(level),
  );
});
