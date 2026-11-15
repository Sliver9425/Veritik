/**
 * Umbrales con los que cada medida se convierte en puntaje (0-100).
 * HIPÓTESIS INICIALES: no están calibradas con cuentas reales. Se concentran aquí para ajustarlas sin tocar la lógica.
 */
export const SIGNAL_SCORING = {
  /** (likes + comentarios + compartidos) ÷ vistas. Muy bajo o extremadamente alto resultan sospechosos. */
  engagement: { zeroBelow: 0.005, fullFrom: 0.03, fullUntil: 0.2, zeroAbove: 0.5 },
  /** Vistas promedio ÷ seguidores. Un valor bajo sugiere seguidores que no ven el contenido. */
  viewsToFollowers: { zeroAt: 0.01, fullAt: 0.05 },
  /** Proporción de comentarios repetidos, genéricos o solo emojis. */
  commentQuality: { minComments: 10, fullAtGenericRatio: 0.1, zeroAtGenericRatio: 0.7 },
  /** Seguidores ÷ seguidos. Seguir a muchos más de los que te siguen es típico de cuentas inflables. */
  followRatio: { zeroAt: 0.1, fullAt: 1 },
  /** Publicaciones por semana. Solo mide frecuencia, no la constancia entre fechas. */
  postingRegularity: { zeroBelow: 0.2, fullFrom: 1, fullUntil: 14, zeroAbove: 40 },
  /** Crecimiento relativo diario de seguidores entre dos análisis del mismo perfil. */
  followerJumps: { minDays: 1, fullAtDailyChange: 0.02, zeroAtDailyChange: 0.2 },
} as const;
