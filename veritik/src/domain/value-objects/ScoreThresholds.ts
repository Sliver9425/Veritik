/**
 * Umbrales del puntaje de autenticidad (0-100).
 * HIPÓTESIS INICIAL: deben calibrarse con datos de cuentas reales antes de presentarse como medida fiable.
 */
export const SCORE_THRESHOLDS = {
  high: 70,
  medium: 40,
} as const;
