/** Control del límite mensual de análisis gratuitos (freemium). */
export interface UsageQuotaRepository {
  /** Análisis realizados en el mes de `now`. */
  getMonthlyUsage(now: Date): Promise<number>;
  registerAnalysis(now: Date): Promise<void>;
}
