import type { Signal } from '../entities/Signal';
import { assertRange } from '../shared/invariants';
import { SCORE_THRESHOLDS } from './ScoreThresholds';

export type ScoreLevel = 'high' | 'medium' | 'low';

/** Puntaje de autenticidad: entero de 0 a 100. Es una estimación, nunca una acusación. */
export class AuthenticityScore {
  private constructor(readonly value: number) {}

  static create(value: number): AuthenticityScore {
    assertRange('puntaje de autenticidad', value, 0, 100);
    return new AuthenticityScore(Math.round(value));
  }

  /**
   * Promedio ponderado de las señales disponibles. Si faltan señales, los pesos se
   * renormalizan sobre las que sí hay. Devuelve null si no hay ninguna disponible.
   */
  static fromSignals(signals: ReadonlyArray<Signal>): AuthenticityScore | null {
    let weightedSum = 0;
    let totalWeight = 0;
    for (const signal of signals) {
      if (signal.score === null) continue;
      weightedSum += signal.score * signal.weight;
      totalWeight += signal.weight;
    }
    return totalWeight === 0 ? null : AuthenticityScore.create(weightedSum / totalWeight);
  }

  get level(): ScoreLevel {
    if (this.value >= SCORE_THRESHOLDS.high) return 'high';
    if (this.value >= SCORE_THRESHOLDS.medium) return 'medium';
    return 'low';
  }
}
