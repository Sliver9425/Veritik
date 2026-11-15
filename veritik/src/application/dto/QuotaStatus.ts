export interface QuotaStatus {
  readonly used: number;
  /** null = ilimitado (premium). */
  readonly limit: number | null;
  /** null = ilimitado (premium). */
  readonly remaining: number | null;
  readonly canAnalyze: boolean;
}
