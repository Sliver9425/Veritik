/** Rejilla de 8 px. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/** Tamaños fijos de componentes y áreas táctiles (≥ 44 pt en iOS / 48 dp en Android). */
export const sizes = {
  minTouchTarget: 44,
  buttonHeight: 56,
  buttonHeightSmall: 48,
  inputHeight: 56,
  gaugeDiameter: 200,
  gaugeStroke: 14,
  sheetHandleWidth: 44,
  sheetHandleHeight: 5,
  iconSm: 16,
  iconMd: 22,
  iconLg: 28,
} as const;

/** Medidas de layout de pantalla. */
export const layout = {
  screenPaddingHorizontal: spacing.xl,
  cardGap: spacing.sm,
  /** Tamaño de referencia del diseño (iPhone 15). */
  referenceWidth: 393,
  referenceHeight: 852,
  /** Ancho máximo en la web: en pantallas grandes la app se muestra como un teléfono centrado. */
  webMaxWidth: 430,
} as const;
