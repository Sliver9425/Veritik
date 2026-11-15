import type { IdGenerator } from '../../application';

/** Ids únicos para análisis locales (marca de tiempo + parte aleatoria). No es un UUID criptográfico, no hace falta aquí. */
export class LocalIdGenerator implements IdGenerator {
  private counter = 0;

  next(): string {
    this.counter += 1;
    const random = Math.random().toString(36).slice(2, 8);
    return `${Date.now().toString(36)}-${this.counter.toString(36)}-${random}`;
  }
}
