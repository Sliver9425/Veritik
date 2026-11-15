import { describe, expect, it } from 'vitest';
import {
  AnalysisResult, PrivateProfileError, ProfileNotFoundError, ProfileUnavailableError, Username,
} from '../../domain';
import { QuotaExceededError, SignalCalculator } from '../../application';
import { FixedClock, SequentialIdGenerator, makeProfile } from '../../application/__tests__/helpers';
import { HttpProfileRepository } from '../api/HttpProfileRepository';
import type { FetchLike } from '../api/HttpProfileRepository';
import { createContainer } from '../di/container';
import { MockProfileRepository } from '../mocks/MockProfileRepository';
import { InMemoryKeyValueStorage } from '../persistence/InMemoryKeyValueStorage';
import { HISTORY_STORAGE_KEY, StorageAnalysisHistoryRepository } from '../persistence/StorageAnalysisHistoryRepository';
import { StorageUsageQuotaRepository } from '../persistence/StorageUsageQuotaRepository';
import { LocalIdGenerator } from '../system/LocalIdGenerator';

function buildResult(id: string, handle = 'demo.uno'): AnalysisResult {
  const profile = makeProfile(handle);
  return AnalysisResult.create({
    id, profile, signals: new SignalCalculator().calculate(profile), analyzedAt: new Date('2026-11-15T12:30:00Z'),
  });
}

describe('StorageAnalysisHistoryRepository', () => {
  it('guarda y recupera un análisis sin perder datos', async () => {
    const repo = new StorageAnalysisHistoryRepository(new InMemoryKeyValueStorage());
    const original = buildResult('a1');
    await repo.save(original);

    const loaded = await repo.getById('a1');
    expect(loaded?.score.value).toBe(original.score.value);
    expect(loaded?.profile.followers).toBe(original.profile.followers);
    expect(loaded?.profile.videos).toHaveLength(original.profile.videos.length);
    expect(loaded?.analyzedAt.getTime()).toBe(original.analyzedAt.getTime());
    expect(loaded?.signals.map((s) => s.score)).toEqual(original.signals.map((s) => s.score));
    expect(loaded?.profile.commentSample?.genericCount).toBe(original.profile.commentSample?.genericCount);
  });

  it('lista los más recientes primero y respeta el límite', async () => {
    const repo = new StorageAnalysisHistoryRepository(new InMemoryKeyValueStorage());
    await repo.save(buildResult('a1'));
    await repo.save(buildResult('a2'));
    await repo.save(buildResult('a3'));
    expect((await repo.list()).map((r) => r.id)).toEqual(['a3', 'a2', 'a1']);
    expect((await repo.list(2)).map((r) => r.id)).toEqual(['a3', 'a2']);
  });

  it('conserva solo los últimos N análisis', async () => {
    const repo = new StorageAnalysisHistoryRepository(new InMemoryKeyValueStorage(), 2);
    for (const id of ['a1', 'a2', 'a3']) await repo.save(buildResult(id));
    expect((await repo.list()).map((r) => r.id)).toEqual(['a3', 'a2']);
  });

  it('ignora registros corruptos sin romper el historial', async () => {
    const storage = new InMemoryKeyValueStorage();
    const repo = new StorageAnalysisHistoryRepository(storage);
    await repo.save(buildResult('bueno'));
    const doc = JSON.parse((await storage.getItem(HISTORY_STORAGE_KEY)) ?? '{}');
    doc.items.unshift({ id: 'malo', profile: { username: '!!', followers: -5 }, signals: [], analyzedAt: 'ayer' });
    await storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(doc));

    expect((await repo.list()).map((r) => r.id)).toEqual(['bueno']);
    expect(await repo.getById('malo')).toBe(null);
  });

  it('devuelve vacío si el texto guardado no es JSON o tiene otra versión', async () => {
    const storage = new InMemoryKeyValueStorage();
    const repo = new StorageAnalysisHistoryRepository(storage);
    await storage.setItem(HISTORY_STORAGE_KEY, 'esto no es json');
    expect(await repo.list()).toEqual([]);
    await storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({ v: 99, items: [] }));
    expect(await repo.list()).toEqual([]);
  });

  it('clear() borra todo', async () => {
    const repo = new StorageAnalysisHistoryRepository(new InMemoryKeyValueStorage());
    await repo.save(buildResult('a1'));
    await repo.clear();
    expect(await repo.list()).toEqual([]);
  });
});

describe('StorageUsageQuotaRepository', () => {
  it('cuenta por mes y empieza de cero en el mes siguiente', async () => {
    const repo = new StorageUsageQuotaRepository(new InMemoryKeyValueStorage());
    const noviembre = new Date(2026, 10, 15);
    const diciembre = new Date(2026, 11, 2);
    expect(await repo.getMonthlyUsage(noviembre)).toBe(0);
    await repo.registerAnalysis(noviembre);
    await repo.registerAnalysis(noviembre);
    expect(await repo.getMonthlyUsage(noviembre)).toBe(2);
    expect(await repo.getMonthlyUsage(diciembre)).toBe(0);
  });

  it('trata un valor guardado inválido como cero', async () => {
    const storage = new InMemoryKeyValueStorage();
    const repo = new StorageUsageQuotaRepository(storage);
    await storage.setItem('veritik:quota:2026-11', 'abc');
    expect(await repo.getMonthlyUsage(new Date(2026, 10, 15))).toBe(0);
  });
});

describe('Contenedor con perfiles de ejemplo (integración)', () => {
  function app() {
    const clock = new FixedClock(new Date(2026, 10, 15, 12));
    return createContainer({
      profiles: new MockProfileRepository(clock, 0),
      storage: new InMemoryKeyValueStorage(),
      clock,
      ids: new SequentialIdGenerator(),
      dataSource: 'mock',
    });
  }

  it('cada tipo de cuenta simulada cae en su nivel', async () => {
    expect((await app().analyzeProfile.execute({ username: 'creadora.demo' })).level).toBe('high');
    expect((await app().analyzeProfile.execute({ username: 'medio.demo' })).level).toBe('medium');
    expect((await app().analyzeProfile.execute({ username: 'fake.demo' })).level).toBe('low');
  });

  it('es estable: el mismo usuario da el mismo puntaje', async () => {
    const a = await app().analyzeProfile.execute({ username: 'creadora.demo' });
    const b = await app().analyzeProfile.execute({ username: 'creadora.demo' });
    expect(a.score.value).toBe(b.score.value);
  });

  it('simula los estados de error', async () => {
    const c = app();
    await expect(c.analyzeProfile.execute({ username: 'noexiste.uno' })).rejects.toThrow(ProfileNotFoundError);
    await expect(c.analyzeProfile.execute({ username: 'cuenta.privada' })).rejects.toThrow(PrivateProfileError);
    await expect(c.analyzeProfile.execute({ username: 'cuenta.bloqueada' })).rejects.toThrow(ProfileUnavailableError);
    expect((await c.checkFreeQuota.execute()).used).toBe(0); // los errores no gastan cuota
  });

  it('aplica la cuota gratuita, guarda el historial y permite reiniciar', async () => {
    const c = app();
    for (const u of ['uno.demo', 'dos.demo', 'tres.demo']) await c.analyzeProfile.execute({ username: u });
    await expect(c.analyzeProfile.execute({ username: 'cuatro.demo' })).rejects.toThrow(QuotaExceededError);

    expect(await c.checkFreeQuota.execute()).toEqual({ used: 3, limit: 3, remaining: 0, canAnalyze: false });
    expect((await c.getSearchHistory.execute()).map((i) => i.handle)).toEqual(['@tres.demo', '@dos.demo', '@uno.demo']);

    await c.resetLocalData();
    expect((await c.checkFreeQuota.execute()).used).toBe(0);
    expect(await c.getSearchHistory.execute()).toEqual([]);
  });
});

describe('HttpProfileRepository', () => {
  const clock = new FixedClock();
  const username = Username.create('creadora.demo');
  const goodBody = {
    followers: 48200, following: 300, total_likes: 900000, video_count: 120,
    videos: [{ id: '1', url: 'https://x/1', published_at: '2026-11-12T18:30:00Z', views: 11200, likes: 480, comments: 35, shares: 12 }],
    comment_sample: { total: 100, generic_count: 34 },
    fetched_at: '2026-11-15T12:00:00Z',
  };
  const reply = (status: number, body: unknown): FetchLike => async () => ({
    ok: status >= 200 && status < 300, status, json: async () => body,
  });
  const repo = (fetchFn: FetchLike) => new HttpProfileRepository({ baseUrl: 'http://servidor:8000/', clock, fetchFn });

  it('arma la URL y convierte la respuesta en un Profile', async () => {
    let calledUrl = '';
    const profile = await repo(async (url) => {
      calledUrl = url;
      return { ok: true, status: 200, json: async () => goodBody };
    }).fetchByUsername(username);

    expect(calledUrl).toBe('http://servidor:8000/profiles/creadora.demo');
    expect(profile.followers).toBe(48200);
    expect(profile.videos).toHaveLength(1);
    expect(profile.commentSample?.total).toBe(100);
  });

  it('acepta comment_sample nulo', async () => {
    const profile = await repo(reply(200, { ...goodBody, comment_sample: null })).fetchByUsername(username);
    expect(profile.commentSample).toBe(null);
  });

  it('traduce los códigos HTTP a errores del dominio', async () => {
    await expect(repo(reply(404, {})).fetchByUsername(username)).rejects.toThrow(ProfileNotFoundError);
    await expect(repo(reply(403, {})).fetchByUsername(username)).rejects.toThrow(PrivateProfileError);
    await expect(repo(reply(503, {})).fetchByUsername(username)).rejects.toThrow(ProfileUnavailableError);
    await expect(repo(reply(429, {})).fetchByUsername(username)).rejects.toThrow(ProfileUnavailableError);
  });

  it('informa "no disponible" si no hay conexión o la respuesta es inválida', async () => {
    const sinRed: FetchLike = async () => { throw new Error('Network request failed'); };
    await expect(repo(sinRed).fetchByUsername(username)).rejects.toThrow(ProfileUnavailableError);
    await expect(repo(reply(200, { followers: 'muchos' })).fetchByUsername(username)).rejects.toThrow(ProfileUnavailableError);
    await expect(repo(reply(200, 'texto')).fetchByUsername(username)).rejects.toThrow(ProfileUnavailableError);
    const jsonRoto: FetchLike = async () => ({ ok: true, status: 200, json: async () => { throw new Error('no json'); } });
    await expect(repo(jsonRoto).fetchByUsername(username)).rejects.toThrow(ProfileUnavailableError);
  });
});

describe('LocalIdGenerator', () => {
  it('no repite ids', () => {
    const gen = new LocalIdGenerator();
    const ids = new Set(Array.from({ length: 500 }, () => gen.next()));
    expect(ids.size).toBe(500);
  });
});
