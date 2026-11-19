import { describe, expect, it } from 'vitest';
import { ProfileNotFoundError, ProfileUnavailableError, Username } from '../../domain';
import { FixedClock, SequentialIdGenerator } from '../../application/__tests__/helpers';
import { createContainer } from '../di/container';
import { FIXTURES } from '../mocks/fixtures';
import { callaNomas } from '../mocks/fixtures/callaNomas';
import { FixtureProfileRepository } from '../mocks/FixtureProfileRepository';
import { MockProfileRepository } from '../mocks/MockProfileRepository';
import { profileFromScraperExport } from '../mocks/scraperExport';
import type { ScraperExport } from '../mocks/scraperExport';
import { InMemoryKeyValueStorage } from '../persistence/InMemoryKeyValueStorage';

const clock = new FixedClock(new Date(2026, 10, 19, 12));

describe('profileFromScraperExport (datos reales de calla.nomas)', () => {
  const profile = profileFromScraperExport(callaNomas, clock.now());

  it('convierte el perfil y los 10 videos', () => {
    expect(profile.username.value).toBe('calla.nomas');
    expect(profile.followers).toBe(343800);
    expect(profile.following).toBe(0);
    expect(profile.videos).toHaveLength(10);
    expect(new Set(profile.videos.map((v) => v.id)).size).toBe(10);
  });

  it('calcula las métricas esperadas', () => {
    expect(profile.averageEngagementRate).toBeCloseTo(0.0985, 3);
    expect(profile.viewsToFollowersRatio).toBeCloseTo(0.1322, 3);
    expect(profile.postsPerWeek).toBeCloseTo(9.04, 1);
    expect(profile.followersToFollowingRatio).toBe(null); // no sigue a nadie
  });

  it('reduce los comentarios a conteos (sin guardar textos)', () => {
    expect(profile.commentSample?.total).toBe(43);
    expect(profile.commentSample?.genericCount).toBe(12);
  });
});

describe('profileFromScraperExport (casos límite)', () => {
  const base: ScraperExport = {
    perfil: { usuario: 'demo.uno', seguidores: 100, seguidos: 10, likes_totales: 500, videos: 1 },
    ultimos_videos: [{ url: 'https://x/video/55?is_from=web', vistas: null, likes: null, comentarios: null, compartidos: null }],
  };

  it('trata null como 0, quita parámetros del id y deja sin muestra si no hay comentarios', () => {
    const p = profileFromScraperExport(base, clock.now());
    expect(p.videos[0]?.id).toBe('55');
    expect(p.videos[0]?.views).toBe(0);
    expect(p.commentSample).toBe(null);
  });

  it('rechaza una fecha inválida', () => {
    const bad: ScraperExport = { ...base, ultimos_videos: [{ ...base.ultimos_videos[0]!, fecha: 'ayer' }] };
    expect(() => profileFromScraperExport(bad, clock.now())).toThrow();
  });
});

describe('FixtureProfileRepository', () => {
  const repo = () => new FixtureProfileRepository(clock, FIXTURES, new MockProfileRepository(clock, 0), 0);

  it('devuelve los datos guardados cuando el usuario coincide (sin importar mayúsculas ni @)', async () => {
    const profile = await repo().fetchByUsername(Username.create('@Calla.Nomas'));
    expect(profile.followers).toBe(343800);
  });

  it('para cualquier otro usuario usa el generador de ejemplo', async () => {
    const profile = await repo().fetchByUsername(Username.create('creadora.demo'));
    expect(profile.username.value).toBe('creadora.demo');
    expect(profile.followers === 343800).toBe(false);
    await expect(repo().fetchByUsername(Username.create('noexiste.uno'))).rejects.toThrow(ProfileNotFoundError);
  });

  it('informa "no disponible" si el archivo guardado está dañado', async () => {
    const broken: ScraperExport = {
      perfil: { usuario: 'dañada.uno'.replace('ñ', 'n'), seguidores: -5, seguidos: 0, likes_totales: 0, videos: 0 },
      ultimos_videos: [],
    };
    const r = new FixtureProfileRepository(clock, [broken], new MockProfileRepository(clock, 0), 0);
    await expect(r.fetchByUsername(Username.create('danada.uno'))).rejects.toThrow(ProfileUnavailableError);
  });
});

describe('Análisis completo con los datos reales', () => {
  it('calla.nomas se analiza con puntaje alto y señales sin datos explicadas', async () => {
    const container = createContainer({
      profiles: new FixtureProfileRepository(clock, FIXTURES, new MockProfileRepository(clock, 0), 0),
      storage: new InMemoryKeyValueStorage(), clock, ids: new SequentialIdGenerator(), dataSource: 'mock',
    });
    const result = await container.analyzeProfile.execute({ username: 'calla.nomas' });
    expect(result.score.value).toBe(93);
    expect(result.level).toBe('high');
    expect(result.unavailableSignals.map((s) => s.id)).toEqual(['followRatio', 'followerJumps']);
  });
});
