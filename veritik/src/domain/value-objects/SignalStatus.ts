import { SCORE_THRESHOLDS } from './ScoreThresholds';

/** Estado de una señal individual. En UI: good = "Bien", warning = "Atención", risk = "Riesgo". */
export type SignalStatus = 'good' | 'warning' | 'risk';

export const SignalStatus = {
  fromScore(score: number): SignalStatus {
    if (score >= SCORE_THRESHOLDS.high) return 'good';
    if (score >= SCORE_THRESHOLDS.medium) return 'warning';
    return 'risk';
  },
} as const;
