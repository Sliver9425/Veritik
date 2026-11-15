/**
 * Tokens de color de Veritik (tema oscuro).
 * Los cinco primeros valores son los definidos en el diseño; el resto se deriva del mismo.
 */
export const colors = {
  // --- Definidos en el diseño ---
  background: '#0F1220',
  surface: '#1A1E33',
  primary: '#7C5CFF',
  textPrimary: '#F5F7FF',
  textSecondary: '#A3A9C2',

  // --- Derivados (prototipo en Figma) ---
  surfaceElevated: '#232845', // bottom sheet y elementos flotantes
  border: '#2A2F4D',
  borderStrong: '#3A4066', // botones secundarios (outline)
  handle: '#4A5078', // barra de arrastre del bottom sheet
  overlay: 'rgba(15, 18, 32, 0.62)',
  textOnSheet: '#C3C8E0',

  // Accesibilidad: #7C5CFF con texto blanco da ~4,3:1 (< 4,5:1 de WCAG AA).
  // Por eso el relleno de botones usa un tono más oscuro, y el texto/iconos de acento uno más claro.
  primaryAction: '#6B4BF0', // relleno de botones primarios
  onPrimaryAction: '#FFFFFF',
  primaryAccent: '#9B82FF', // texto, iconos y pestaña activa sobre fondo oscuro

  // Estados de las señales (SignalStatus: good | warning | risk) y niveles de puntaje
  good: '#2EE6A6',
  warning: '#FFB020',
  risk: '#FF5C6C',
  goodSurface: '#13342F',
  warningSurface: '#3A2D12',
  riskSurface: '#3B1B25',

  track: '#2A2F4D', // pista del medidor circular
} as const;

export type ColorToken = keyof typeof colors;

/** Colores por estado. Las claves coinciden con `SignalStatus` del dominio. */
export const statusColors = {
  good: { foreground: colors.good, background: colors.goodSurface },
  warning: { foreground: colors.warning, background: colors.warningSurface },
  risk: { foreground: colors.risk, background: colors.riskSurface },
} as const;

/** Colores por nivel de puntaje. Las claves coinciden con `ScoreLevel` del dominio. */
export const levelColors = {
  high: statusColors.good,
  medium: statusColors.warning,
  low: statusColors.risk,
} as const;
