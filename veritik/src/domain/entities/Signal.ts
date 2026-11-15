import { assertRange } from '../shared/invariants';
import { SignalStatus } from '../value-objects/SignalStatus';

export type SignalId =
  | 'engagement'
  | 'viewsToFollowers'
  | 'commentQuality'
  | 'followRatio'
  | 'postingRegularity'
  | 'followerJumps';

/** Pesos propuestos (suman 1). HIPÓTESIS INICIAL: calibrar con datos reales. */
export const SIGNAL_WEIGHTS: Readonly<Record<SignalId, number>> = {
  engagement: 0.3,
  viewsToFollowers: 0.25,
  commentQuality: 0.2,
  followRatio: 0.1,
  postingRegularity: 0.1,
  followerJumps: 0.05,
};

interface SignalProps {
  readonly id: SignalId;
  /** Puntaje 0-100 de la señal, o null si faltan datos para calcularla. */
  readonly score: number | null;
  /** Valor medido sin normalizar (p. ej. 0.041 = 4,1 % de engagement) para mostrarlo en el detalle. */
  readonly rawValue?: number | null;
}

/**
 * Señal que aporta al puntaje de autenticidad. Se identifica por su `id` dentro de un análisis.
 * El texto visible (nombre, explicación) vive en presentación, no aquí.
 */
export class Signal {
  private constructor(
    readonly id: SignalId,
    readonly weight: number,
    readonly score: number | null,
    readonly rawValue: number | null,
  ) {}

  static create(props: SignalProps): Signal {
    if (props.score !== null) assertRange(`puntaje de la señal ${props.id}`, props.score, 0, 100);
    return new Signal(props.id, SIGNAL_WEIGHTS[props.id], props.score, props.rawValue ?? null);
  }

  /** Señal sin datos suficientes: no entra al promedio ponderado. */
  static unavailable(id: SignalId): Signal {
    return new Signal(id, SIGNAL_WEIGHTS[id], null, null);
  }

  get isAvailable(): boolean {
    return this.score !== null;
  }

  get status(): SignalStatus | null {
    return this.score === null ? null : SignalStatus.fromScore(this.score);
  }
}
