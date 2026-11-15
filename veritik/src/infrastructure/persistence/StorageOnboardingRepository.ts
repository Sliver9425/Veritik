import type { OnboardingRepository } from '../../domain';
import type { KeyValueStorage } from './KeyValueStorage';

export const ONBOARDING_STORAGE_KEY = 'veritik:onboarding';

export class StorageOnboardingRepository implements OnboardingRepository {
  constructor(private readonly storage: KeyValueStorage) {}

  async hasCompleted(): Promise<boolean> {
    return (await this.storage.getItem(ONBOARDING_STORAGE_KEY)) === 'done';
  }

  async markCompleted(): Promise<void> {
    await this.storage.setItem(ONBOARDING_STORAGE_KEY, 'done');
  }
}
