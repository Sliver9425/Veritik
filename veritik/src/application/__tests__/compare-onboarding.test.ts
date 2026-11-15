import { describe, expect, it } from 'vitest';
import { AnalysisNotFoundError, InvalidComparisonError } from '../errors/ApplicationError';
import { AnalyzeProfileUseCase } from '../use-cases/AnalyzeProfileUseCase';
import { CompareAnalysesUseCase } from '../use-cases/CompareAnalysesUseCase';
import { CheckOnboardingUseCase, CompleteOnboardingUseCase } from '../use-cases/OnboardingUseCases';
import {
  FakeProfileRepository, FixedClock, InMemoryHistoryRepository, InMemoryQuotaRepository, SequentialIdGenerator, makeProfile,
} from './helpers';

async function twoAnalyses() {
  const history = new InMemoryHistoryRepository();
  const analyze = new AnalyzeProfileUseCase({
    profiles: new FakeProfileRepository((u) => makeProfile(u.value, { followers: u.value === 'demo.dos' ? 900 : 48200 })),
    history, quota: new InMemoryQuotaRepository(), ids: new SequentialIdGenerator(), clock: new FixedClock(),
  });
  const first = await analyze.execute({ username: 'demo.uno' });
  const second = await analyze.execute({ username: 'demo.dos' });
  return { history, first, second };
}

describe('CompareAnalysesUseCase', () => {
  it('compara dos análisis guardados', async () => {
    const { history, first, second } = await twoAnalyses();
    const out = await new CompareAnalysesUseCase(history).execute({ firstId: first.id, secondId: second.id });
    expect(out.first.id).toBe(first.id);
    expect(out.second.id).toBe(second.id);
    expect(out.comparison.signals).toHaveLength(6);
  });

  it('no permite comparar un análisis consigo mismo', async () => {
    const { history, first } = await twoAnalyses();
    await expect(new CompareAnalysesUseCase(history).execute({ firstId: first.id, secondId: first.id }))
      .rejects.toThrow(InvalidComparisonError);
  });

  it('falla si alguno de los análisis no existe', async () => {
    const { history, first } = await twoAnalyses();
    await expect(new CompareAnalysesUseCase(history).execute({ firstId: first.id, secondId: 'nada' }))
      .rejects.toThrow(AnalysisNotFoundError);
  });
});

describe('Onboarding', () => {
  it('empieza sin completar y se recuerda al completarlo', async () => {
    const flags: { done: boolean } = { done: false };
    const repo = { hasCompleted: async () => flags.done, markCompleted: async () => { flags.done = true; } };
    expect(await new CheckOnboardingUseCase(repo).execute()).toBe(false);
    await new CompleteOnboardingUseCase(repo).execute();
    expect(await new CheckOnboardingUseCase(repo).execute()).toBe(true);
  });
});
