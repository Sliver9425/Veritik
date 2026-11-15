import type { OnboardingRepository } from '../../domain';

/** ¿La persona ya completó (o saltó) la bienvenida? */
export class CheckOnboardingUseCase {
  constructor(private readonly repository: OnboardingRepository) {}

  execute(): Promise<boolean> {
    return this.repository.hasCompleted();
  }
}

/** Marca la bienvenida como vista para no mostrarla de nuevo. */
export class CompleteOnboardingUseCase {
  constructor(private readonly repository: OnboardingRepository) {}

  execute(): Promise<void> {
    return this.repository.markCompleted();
  }
}
