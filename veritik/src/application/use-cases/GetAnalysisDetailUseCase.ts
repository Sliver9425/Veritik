import type { AnalysisHistoryRepository, AnalysisResult } from '../../domain';
import { AnalysisNotFoundError } from '../errors/ApplicationError';

/** Recupera un análisis guardado para mostrar su detalle. @throws AnalysisNotFoundError */
export class GetAnalysisDetailUseCase {
  constructor(private readonly history: AnalysisHistoryRepository) {}

  async execute(id: string): Promise<AnalysisResult> {
    const result = await this.history.getById(id);
    if (result === null) throw new AnalysisNotFoundError(`No existe el análisis ${id}`);
    return result;
  }
}
