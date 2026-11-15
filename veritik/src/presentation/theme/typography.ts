/**
 * Tipografía: Inter. Se carga con `@expo-google-fonts/inter` + `useFonts`;
 * los nombres de familia son los que registra ese paquete.
 */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** Estructura compatible con `TextStyle` de React Native, sin depender de él. */
export interface TextToken {
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly letterSpacing?: number;
}

export const typography = {
  /** Número protagonista del puntaje. */
  display: { fontFamily: fontFamily.bold, fontSize: 64, lineHeight: 68 },
  /** Título de pantalla. */
  h1: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 34 },
  /** Subtítulo / título de sección y de bottom sheet. */
  h2: { fontFamily: fontFamily.semibold, fontSize: 20, lineHeight: 26 },
  /** Valor destacado en tarjetas de métrica. */
  metric: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 24 },
  bodyLarge: { fontFamily: fontFamily.regular, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 23 },
  button: { fontFamily: fontFamily.semibold, fontSize: 17, lineHeight: 22 },
  buttonSmall: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 20 },
  label: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18 },
  /** Texto de apoyo: nunca por debajo de 12 px. */
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
} as const satisfies Record<string, TextToken>;

export type TypographyToken = keyof typeof typography;
