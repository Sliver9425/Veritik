import { compareAnalyses } from '../../domain';
import type { AnalysisComparison, AnalysisHistoryRepository, AnalysisResult } from '../../domain';
import { AnalysisNotFoundError, InvalidComparisonError } from '../errors/ApplicationError';

export interface ComparisonResult {
  readonly first: AnalysisResult;
  readonly second: AnalysisResult;
  readonly comparison: AnalysisComparison;
}

/**
 * Compara dos análisis ya guardados (no consume cuota ni consulta a TikTok).
 * Se permite comparar dos análisis de la MISMA cuenta en fechas distintas, para ver su evolución.
 * @throws InvalidComparisonError | AnalysisNotFoundError
 */
export class CompareAnalysesUseCase {
  constructor(private readonly history: AnalysisHistoryRepository) {}

  async execute(input: { firstId: string; secondId: string }): Promise<ComparisonResult> {
    if (input.firstId === input.secondId) {
      throw new InvalidComparisonError('Elige dos análisis distintos para compararlos');
    }
    const [first, second] = await Promise.all([
      this.history.getById(input.firstId),
      this.history.getById(input.secondId),
    ]);
    if (first === null) throw new AnalysisNotFoundError(`No existe el análisis ${input.firstId}`);
    if (second === null) throw new AnalysisNotFoundError(`No existe el análisis ${input.secondId}`);
    return { first, second, comparison: compareAnalyses(first, second) };
  }
}
