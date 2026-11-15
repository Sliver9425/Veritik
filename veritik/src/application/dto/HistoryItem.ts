import type { ScoreLevel } from '../../domain';

/** Resumen ligero de un análisis para las listas (Inicio e Historial). */
export interface HistoryItem {
  readonly id: string;
  /** "@usuario", listo para mostrar. */
  readonly handle: string;
  readonly score: number;
  readonly level: ScoreLevel;
  readonly analyzedAt: Date;
}
