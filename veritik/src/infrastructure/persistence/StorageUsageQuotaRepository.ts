import type { UsageQuotaRepository } from '../../domain';
import type { KeyValueStorage } from './KeyValueStorage';

const PREFIX = 'veritik:quota:';

/** Clave del contador de un mes (año-mes en hora local): "veritik:quota:2026-11". */
export function quotaStorageKey(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${PREFIX}${now.getFullYear()}-${month}`;
}

/** Cuenta los análisis del mes. Un contador por mes: al cambiar de mes se empieza de cero sin borrar nada. */
export class StorageUsageQuotaRepository implements UsageQuotaRepository {
  constructor(private readonly storage: KeyValueStorage) {}

  async getMonthlyUsage(now: Date): Promise<number> {
    const raw = await this.storage.getItem(quotaStorageKey(now));
    const value = Number(raw);
    return raw !== null && Number.isInteger(value) && value >= 0 ? value : 0;
  }

  async registerAnalysis(now: Date): Promise<void> {
    const used = await this.getMonthlyUsage(now);
    await this.storage.setItem(quotaStorageKey(now), String(used + 1));
  }
}
