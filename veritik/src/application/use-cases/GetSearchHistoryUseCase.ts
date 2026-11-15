import type { AnalysisHistoryRepository } from '../../domain';
import type { HistoryItem } from '../dto/HistoryItem';

/** Lista los análisis recientes como resúmenes ligeros (más recientes primero). */
export class GetSearchHistoryUseCase {
  constructor(private readonly history: AnalysisHistoryRepository) {}

  async execute(limit = 20): Promise<HistoryItem[]> {
    const results = await this.history.list(limit);
    return results.map((r) => ({
      id: r.id,
      handle: r.profile.username.handle,
      score: r.score.value,
      level: r.level,
      analyzedAt: r.analyzedAt,
    }));
  }
}
