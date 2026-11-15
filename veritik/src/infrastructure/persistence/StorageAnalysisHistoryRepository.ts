import type { AnalysisHistoryRepository, AnalysisResult } from '../../domain';
import { fromRecord, toRecord } from './AnalysisRecordMapper';
import type { KeyValueStorage } from './KeyValueStorage';
import { HISTORY_FORMAT_VERSION } from './records';
import type { AnalysisRecord, HistoryDocument } from './records';

export const HISTORY_STORAGE_KEY = 'veritik:history';
const DEFAULT_MAX_ITEMS = 50;

/** Historial de análisis guardado en un `KeyValueStorage` (AsyncStorage en la app). Más recientes primero. */
export class StorageAnalysisHistoryRepository implements AnalysisHistoryRepository {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly maxItems: number = DEFAULT_MAX_ITEMS,
  ) {}

  async save(result: AnalysisResult): Promise<void> {
    const current = await this.readRecords();
    const next = [toRecord(result), ...current.filter((r) => r.id !== result.id)].slice(0, this.maxItems);
    const doc: HistoryDocument = { v: HISTORY_FORMAT_VERSION, items: next };
    await this.storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(doc));
  }

  async list(limit?: number): Promise<ReadonlyArray<AnalysisResult>> {
    const results: AnalysisResult[] = [];
    for (const record of await this.readRecords()) {
      if (limit !== undefined && results.length >= limit) break;
      try {
        results.push(fromRecord(record));
      } catch {
        // Registro corrupto: se ignora en lugar de romper todo el historial.
      }
    }
    return results;
  }

  async getById(id: string): Promise<AnalysisResult | null> {
    const record = (await this.readRecords()).find((r) => r.id === id);
    if (record === undefined) return null;
    try {
      return fromRecord(record);
    } catch {
      return null;
    }
  }

  async clear(): Promise<void> {
    await this.storage.removeItem(HISTORY_STORAGE_KEY);
  }

  private async readRecords(): Promise<AnalysisRecord[]> {
    const raw = await this.storage.getItem(HISTORY_STORAGE_KEY);
    if (raw === null) return [];
    try {
      const doc = JSON.parse(raw) as Partial<HistoryDocument>;
      if (doc.v !== HISTORY_FORMAT_VERSION || !Array.isArray(doc.items)) return [];
      return doc.items;
    } catch {
      return [];
    }
  }
}
