import { AnalysisResult, Username } from '../../domain';
import type {
  AnalysisHistoryRepository, Profile, ProfileRepository, UsageQuotaRepository,
} from '../../domain';
import { QuotaExceededError } from '../errors/ApplicationError';
import { FreemiumPolicy } from '../policies/FreemiumPolicy';
import type { Clock } from '../ports/Clock';
import type { IdGenerator } from '../ports/IdGenerator';
import { SignalCalculator } from '../services/SignalCalculator';

export interface AnalyzeProfileInput {
  /** Texto tal como lo escribió la persona; se valida y normaliza aquí. */
  readonly username: string;
  readonly isPremium?: boolean;
}

export interface AnalyzeProfileDeps {
  readonly profiles: ProfileRepository;
  readonly history: AnalysisHistoryRepository;
  readonly quota: UsageQuotaRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
  readonly calculator?: SignalCalculator;
  readonly policy?: FreemiumPolicy;
}

/**
 * Analiza un perfil público: valida el usuario, comprueba la cuota gratuita, obtiene el perfil,
 * calcula las señales, guarda el resultado y descuenta un análisis.
 * La cuota solo se descuenta si el análisis termina bien.
 *
 * @throws InvalidUsernameError | QuotaExceededError | ProfileNotFoundError | PrivateProfileError
 *         | ProfileUnavailableError | InsufficientDataError
 */
export class AnalyzeProfileUseCase {
  private readonly calculator: SignalCalculator;
  private readonly policy: FreemiumPolicy;

  constructor(private readonly deps: AnalyzeProfileDeps) {
    this.calculator = deps.calculator ?? new SignalCalculator();
    this.policy = deps.policy ?? new FreemiumPolicy();
  }

  async execute(input: AnalyzeProfileInput): Promise<AnalysisResult> {
    const username = Username.create(input.username);
    const isPremium = input.isPremium ?? false;
    const startedAt = this.deps.clock.now();

    const used = await this.deps.quota.getMonthlyUsage(startedAt);
    if (!this.policy.canAnalyze(used, isPremium)) {
      throw new QuotaExceededError(`Alcanzaste el límite de ${this.policy.monthlyLimit} análisis gratuitos este mes`);
    }

    const profile = await this.deps.profiles.fetchByUsername(username);
    const previous = await this.findPreviousProfile(username);
    const signals = this.calculator.calculate(profile, previous);

    const result = AnalysisResult.create({
      id: this.deps.ids.next(),
      profile,
      signals,
      analyzedAt: this.deps.clock.now(),
    });

    await this.deps.history.save(result);
    await this.deps.quota.registerAnalysis(startedAt);
    return result;
  }

  private async findPreviousProfile(username: Username): Promise<Profile | null> {
    const saved = await this.deps.history.list();
    return saved.find((r) => r.profile.username.equals(username))?.profile ?? null;
  }
}
