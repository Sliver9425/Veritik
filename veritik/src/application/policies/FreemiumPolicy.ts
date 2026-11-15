/** Análisis gratuitos por mes (modelo freemium del documento de diseño: de 1 a 3). */
export const FREE_MONTHLY_ANALYSES = 3;

export class FreemiumPolicy {
  constructor(readonly monthlyLimit: number = FREE_MONTHLY_ANALYSES) {}

  canAnalyze(used: number, isPremium: boolean): boolean {
    return isPremium || used < this.monthlyLimit;
  }

  /** null = ilimitado (premium). */
  remaining(used: number, isPremium: boolean): number | null {
    return isPremium ? null : Math.max(0, this.monthlyLimit - used);
  }
}
