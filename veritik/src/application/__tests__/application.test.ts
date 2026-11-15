import { describe, expect, it } from 'vitest';
import {
  CommentSample, InvalidUsernameError, ProfileNotFoundError,
} from '../../domain';
import { QuotaExceededError, AnalysisNotFoundError } from '../errors/ApplicationError';
import { SignalCalculator } from '../services/SignalCalculator';
import { AnalyzeProfileUseCase } from '../use-cases/AnalyzeProfileUseCase';
import { CheckFreeQuotaUseCase } from '../use-cases/CheckFreeQuotaUseCase';
import { GetAnalysisDetailUseCase } from '../use-cases/GetAnalysisDetailUseCase';
import { GetSearchHistoryUseCase } from '../use-cases/GetSearchHistoryUseCase';
import {
  DAY, FakeProfileRepository, FixedClock, InMemoryHistoryRepository, InMemoryQuotaRepository,
  SequentialIdGenerator, makeProfile,
} from './helpers';

function setup(opts: { usage?: number; respond?: ConstructorParameters<typeof FakeProfileRepository>[0] } = {}) {
  const profiles = new FakeProfileRepository(opts.respond ?? ((u) => makeProfile(u.value)));
  const history = new InMemoryHistoryRepository();
  const quota = new InMemoryQuotaRepository(opts.usage ?? 0);
  const clock = new FixedClock();
  const useCase = new AnalyzeProfileUseCase({ profiles, history, quota, ids: new SequentialIdGenerator(), clock });
  return { profiles, history, quota, clock, useCase };
}

describe('SignalCalculator', () => {
  const calc = new SignalCalculator();

  it('marca como no disponible lo que no se puede calcular', () => {
    const signals = calc.calculate(makeProfile('demo.uno', { comments: null }));
    const byId = Object.fromEntries(signals.map((s) => [s.id, s]));
    expect(byId.commentQuality?.isAvailable).toBe(false);
    expect(byId.followerJumps?.isAvailable).toBe(false); // sin análisis previo
    expect(byId.engagement?.status).toBe('good'); // 4,4 % de engagement
  });

  it('detecta un salto brusco de seguidores frente al análisis anterior', () => {
    const now = new Date('2026-11-15T12:00:00Z');
    const previous = makeProfile('demo.uno', { followers: 1000, fetchedAt: new Date(now.getTime() - 2 * DAY) });
    const current = makeProfile('demo.uno', { followers: 5000, fetchedAt: now });
    const jump = calc.calculate(current, previous).find((s) => s.id === 'followerJumps');
    expect(jump?.status).toBe('risk'); // +400 % en 2 días
  });

  it('no usa comentarios si la muestra es demasiado pequeña', () => {
    const signals = calc.calculate(makeProfile('demo.uno', { comments: CommentSample.create(5, 5) }));
    expect(signals.find((s) => s.id === 'commentQuality')?.isAvailable).toBe(false);
  });
});

describe('AnalyzeProfileUseCase', () => {
  it('analiza, guarda el resultado y descuenta un análisis', async () => {
    const { useCase, history, quota } = setup();
    const result = await useCase.execute({ username: '@Demo.Uno' });
    expect(result.profile.username.value).toBe('demo.uno');
    expect(result.id).toBe('id-1');
    expect(history.items).toHaveLength(1);
    expect(quota.usage).toBe(1);
  });

  it('rechaza un usuario inválido sin consultar al repositorio', async () => {
    const { useCase, profiles } = setup();
    await expect(useCase.execute({ username: 'a' })).rejects.toThrow(InvalidUsernameError);
    expect(profiles.calls).toBe(0);
  });

  it('bloquea cuando se agotó la cuota gratuita, sin consultar al repositorio', async () => {
    const { useCase, profiles } = setup({ usage: 3 });
    await expect(useCase.execute({ username: 'demo.uno' })).rejects.toThrow(QuotaExceededError);
    expect(profiles.calls).toBe(0);
  });

  it('el plan premium no tiene límite', async () => {
    const { useCase } = setup({ usage: 50 });
    await expect(useCase.execute({ username: 'demo.uno', isPremium: true })).resolves.toBeDefined();
  });

  it('no descuenta cuota si el análisis falla', async () => {
    const { useCase, quota, history } = setup({ respond: () => new ProfileNotFoundError('no existe') });
    await expect(useCase.execute({ username: 'demo.uno' })).rejects.toThrow(ProfileNotFoundError);
    expect(quota.usage).toBe(0);
    expect(history.items).toHaveLength(0);
  });

  it('usa el análisis anterior del mismo usuario para la señal de saltos', async () => {
    const clock = new FixedClock();
    let calls = 0;
    const profiles = new FakeProfileRepository((u) => {
      calls += 1;
      return makeProfile(u.value, { fetchedAt: clock.current, followers: calls === 1 ? 1000 : 5000 });
    });
    const useCase = new AnalyzeProfileUseCase({
      profiles, history: new InMemoryHistoryRepository(), quota: new InMemoryQuotaRepository(),
      ids: new SequentialIdGenerator(), clock,
    });

    const first = await useCase.execute({ username: 'demo.uno' });
    expect(first.getSignal('followerJumps')?.isAvailable).toBe(false); // sin análisis previo

    clock.current = new Date(clock.current.getTime() + 2 * DAY);
    const second = await useCase.execute({ username: 'demo.uno' });
    expect(second.getSignal('followerJumps')?.status).toBe('risk'); // +400 % en 2 días
  });
});

describe('Otros casos de uso', () => {
  it('historial: devuelve resúmenes, más recientes primero', async () => {
    const { useCase, history } = setup();
    await useCase.execute({ username: 'demo.uno' });
    await useCase.execute({ username: 'demo.dos' });
    const items = await new GetSearchHistoryUseCase(history).execute();
    expect(items.map((i) => i.handle)).toEqual(['@demo.dos', '@demo.uno']);
  });

  it('detalle: falla si el id no existe', async () => {
    const { history } = setup();
    await expect(new GetAnalysisDetailUseCase(history).execute('nada')).rejects.toThrow(AnalysisNotFoundError);
  });

  it('cuota: informa lo que queda y el caso premium', async () => {
    const quota = new InMemoryQuotaRepository(2);
    const check = new CheckFreeQuotaUseCase(quota, new FixedClock());
    expect(await check.execute()).toEqual({ used: 2, limit: 3, remaining: 1, canAnalyze: true });
    expect(await check.execute({ isPremium: true })).toEqual({ used: 2, limit: null, remaining: null, canAnalyze: true });
  });
});
