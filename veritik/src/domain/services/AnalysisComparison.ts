import type { AnalysisResult } from '../entities/AnalysisResult';
import { SIGNAL_WEIGHTS } from '../entities/Signal';
import type { Signal, SignalId } from '../entities/Signal';
import { AuthenticityScore } from '../value-objects/AuthenticityScore';

/** Diferencia mínima (en puntos de 0 a 100) para considerar que una cuenta supera a la otra. HIPÓTESIS: calibrar. */
export const COMPARISON_TIE_MARGIN = 5;

export type ComparisonVerdict = 'first' | 'second' | 'tie' | 'unknown';

export interface SignalComparison {
  readonly id: SignalId;
  readonly first: Signal | undefined;
  readonly second: Signal | undefined;
  /** 'unknown' si alguna de las dos no tiene datos para esa señal. */
  readonly verdict: ComparisonVerdict;
}

export interface AnalysisComparison {
  readonly signals: ReadonlyArray<SignalComparison>;
  /** Puntaje recalculado SOLO con las señales disponibles en ambas cuentas (comparación justa). null si no hay ninguna en común. */
  readonly commonFirstScore: number | null;
  readonly commonSecondScore: number | null;
  /** Cantidad de señales disponibles en ambas. */
  readonly commonSignalCount: number;
  readonly verdict: ComparisonVerdict;
}

function judge(firstScore: number | null, secondScore: number | null): ComparisonVerdict {
  if (firstScore === null || secondScore === null) return 'unknown';
  const diff = firstScore - secondScore;
  if (Math.abs(diff) < COMPARISON_TIE_MARGIN) return 'tie';
  return diff > 0 ? 'first' : 'second';
}

/**
 * Compara dos análisis. Como cada puntaje total se calcula con las señales que tuvo disponibles, el veredicto general
 * se basa en un puntaje recalculado solo con las señales presentes en AMBAS cuentas, para no favorecer a la que tiene menos datos.
 */
export function compareAnalyses(first: AnalysisResult, second: AnalysisResult): AnalysisComparison {
  const ids = Object.keys(SIGNAL_WEIGHTS) as SignalId[];

  const signals: SignalComparison[] = ids.map((id) => {
    const a = first.getSignal(id);
    const b = second.getSignal(id);
    return { id, first: a, second: b, verdict: judge(a?.score ?? null, b?.score ?? null) };
  });

  const common = signals.filter((s) => s.first?.score != null && s.second?.score != null);
  const firstCommon = common.flatMap((s) => (s.first ? [s.first] : []));
  const secondCommon = common.flatMap((s) => (s.second ? [s.second] : []));
  const commonFirstScore = AuthenticityScore.fromSignals(firstCommon)?.value ?? null;
  const commonSecondScore = AuthenticityScore.fromSignals(secondCommon)?.value ?? null;

  return {
    signals,
    commonFirstScore,
    commonSecondScore,
    commonSignalCount: common.length,
    verdict: judge(commonFirstScore, commonSecondScore),
  };
}
