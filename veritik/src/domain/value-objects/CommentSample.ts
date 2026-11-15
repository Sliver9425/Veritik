import { assertNonNegativeInteger } from '../shared/invariants';
import { InvalidMetricError } from '../errors/DomainError';

/**
 * Muestra de comentarios analizada por el origen de datos.
 * No guarda texto ni autores (privacidad): solo conteos agregados.
 */
export class CommentSample {
  private constructor(
    readonly total: number,
    readonly genericCount: number,
  ) {}

  static create(total: number, genericCount: number): CommentSample {
    assertNonNegativeInteger('total de comentarios', total);
    assertNonNegativeInteger('comentarios genéricos', genericCount);
    if (genericCount > total) {
      throw new InvalidMetricError('Los comentarios genéricos no pueden superar al total');
    }
    return new CommentSample(total, genericCount);
  }

  /** Proporción 0-1 de comentarios repetidos, genéricos o solo emojis. */
  get genericRatio(): number {
    return this.total === 0 ? 0 : this.genericCount / this.total;
  }
}
