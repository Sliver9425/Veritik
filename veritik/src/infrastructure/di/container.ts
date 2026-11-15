import {
  AnalyzeProfileUseCase, CheckFreeQuotaUseCase, CheckOnboardingUseCase, CompareAnalysesUseCase,
  CompleteOnboardingUseCase, FreemiumPolicy, GetAnalysisDetailUseCase, GetSearchHistoryUseCase,
} from '../../application';
import type { Clock, IdGenerator } from '../../application';
import type { ProfileRepository } from '../../domain';
import type { KeyValueStorage } from '../persistence/KeyValueStorage';
import { StorageOnboardingRepository } from '../persistence/StorageOnboardingRepository';
import { StorageAnalysisHistoryRepository } from '../persistence/StorageAnalysisHistoryRepository';
import { StorageUsageQuotaRepository, quotaStorageKey } from '../persistence/StorageUsageQuotaRepository';
import { LocalIdGenerator } from '../system/LocalIdGenerator';
import { SystemClock } from '../system/SystemClock';

export interface ContainerDeps {
  readonly profiles: ProfileRepository;
  readonly storage: KeyValueStorage;
  readonly clock?: Clock;
  readonly ids?: IdGenerator;
  /** De dónde salen los perfiles; la UI puede mostrar un aviso de "datos de ejemplo". */
  readonly dataSource?: 'mock' | 'api';
}

export interface Container {
  readonly dataSource: 'mock' | 'api';
  readonly analyzeProfile: AnalyzeProfileUseCase;
  readonly getSearchHistory: GetSearchHistoryUseCase;
  readonly getAnalysisDetail: GetAnalysisDetailUseCase;
  readonly checkFreeQuota: CheckFreeQuotaUseCase;
  readonly compareAnalyses: CompareAnalysesUseCase;
  readonly checkOnboarding: CheckOnboardingUseCase;
  readonly completeOnboarding: CompleteOnboardingUseCase;
  /** SOLO DESARROLLO: borra el historial y el contador del mes para repetir pruebas. */
  resetLocalData(): Promise<void>;
}

/** Ensambla casos de uso y repositorios. No conoce React Native: todo llega por parámetro (por eso se puede probar en Node). */
export function createContainer(deps: ContainerDeps): Container {
  const clock = deps.clock ?? new SystemClock();
  const ids = deps.ids ?? new LocalIdGenerator();
  const policy = new FreemiumPolicy();
  const history = new StorageAnalysisHistoryRepository(deps.storage);
  const quota = new StorageUsageQuotaRepository(deps.storage);
  const onboarding = new StorageOnboardingRepository(deps.storage);

  return {
    dataSource: deps.dataSource ?? 'api',
    analyzeProfile: new AnalyzeProfileUseCase({ profiles: deps.profiles, history, quota, ids, clock, policy }),
    getSearchHistory: new GetSearchHistoryUseCase(history),
    getAnalysisDetail: new GetAnalysisDetailUseCase(history),
    checkFreeQuota: new CheckFreeQuotaUseCase(quota, clock, policy),
    compareAnalyses: new CompareAnalysesUseCase(history),
    checkOnboarding: new CheckOnboardingUseCase(onboarding),
    completeOnboarding: new CompleteOnboardingUseCase(onboarding),
    async resetLocalData() {
      await history.clear();
      await deps.storage.removeItem(quotaStorageKey(clock.now()));
    },
  };
}
