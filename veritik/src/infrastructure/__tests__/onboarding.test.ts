import { describe, expect, it } from 'vitest';
import { FixedClock, SequentialIdGenerator } from '../../application/__tests__/helpers';
import { createContainer } from '../di/container';
import { MockProfileRepository } from '../mocks/MockProfileRepository';
import { InMemoryKeyValueStorage } from '../persistence/InMemoryKeyValueStorage';
import { ONBOARDING_STORAGE_KEY, StorageOnboardingRepository } from '../persistence/StorageOnboardingRepository';

describe('StorageOnboardingRepository', () => {
  it('recuerda que la bienvenida ya se vio', async () => {
    const repo = new StorageOnboardingRepository(new InMemoryKeyValueStorage());
    expect(await repo.hasCompleted()).toBe(false);
    await repo.markCompleted();
    expect(await repo.hasCompleted()).toBe(true);
  });

  it('ignora valores guardados que no sean "done"', async () => {
    const storage = new InMemoryKeyValueStorage();
    await storage.setItem(ONBOARDING_STORAGE_KEY, 'basura');
    expect(await new StorageOnboardingRepository(storage).hasCompleted()).toBe(false);
  });
});

describe('Contenedor: comparar y bienvenida', () => {
  it('permite analizar dos cuentas y compararlas', async () => {
    const clock = new FixedClock(new Date(2026, 10, 15, 12));
    const c = createContainer({
      profiles: new MockProfileRepository(clock, 0), storage: new InMemoryKeyValueStorage(), clock,
      ids: new SequentialIdGenerator(), dataSource: 'mock',
    });
    const buena = await c.analyzeProfile.execute({ username: 'creadora.demo' });
    const sospechosa = await c.analyzeProfile.execute({ username: 'fake.demo' });
    const out = await c.compareAnalyses.execute({ firstId: buena.id, secondId: sospechosa.id });
    expect(out.comparison.verdict).toBe('first');

    expect(await c.checkOnboarding.execute()).toBe(false);
    await c.completeOnboarding.execute();
    expect(await c.checkOnboarding.execute()).toBe(true);
  });
});
