import type { UsageQuotaRepository } from '../../domain';
import type { QuotaStatus } from '../dto/QuotaStatus';
import { FreemiumPolicy } from '../policies/FreemiumPolicy';
import type { Clock } from '../ports/Clock';

/** Informa cuántos análisis gratuitos quedan este mes (para el aviso de la pantalla de inicio). */
export class CheckFreeQuotaUseCase {
  constructor(
    private readonly quota: UsageQuotaRepository,
    private readonly clock: Clock,
    private readonly policy: FreemiumPolicy = new FreemiumPolicy(),
  ) {}

  async execute(input: { isPremium?: boolean } = {}): Promise<QuotaStatus> {
    const isPremium = input.isPremium ?? false;
    const used = await this.quota.getMonthlyUsage(this.clock.now());
    return {
      used,
      limit: isPremium ? null : this.policy.monthlyLimit,
      remaining: this.policy.remaining(used, isPremium),
      canAnalyze: this.policy.canAnalyze(used, isPremium),
    };
  }
}
