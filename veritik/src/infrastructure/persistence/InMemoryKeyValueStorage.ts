import type { KeyValueStorage } from './KeyValueStorage';

/** Almacenamiento en memoria: para pruebas, o como respaldo cuando no hay persistencia. */
export class InMemoryKeyValueStorage implements KeyValueStorage {
  private readonly data = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }
  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }
  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }
}
