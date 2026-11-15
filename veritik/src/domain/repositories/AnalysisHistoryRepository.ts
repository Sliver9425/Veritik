import type { AnalysisResult } from '../entities/AnalysisResult';

export interface AnalysisHistoryRepository {
  save(result: AnalysisResult): Promise<void>;
  /** Más recientes primero. */
  list(limit?: number): Promise<ReadonlyArray<AnalysisResult>>;
  getById(id: string): Promise<AnalysisResult | null>;
  clear(): Promise<void>;
}
