import type { ScoreLevel, SignalStatus } from '../../domain';

export const LEVEL_TEXT: Record<ScoreLevel, string> = {
  high: 'Autenticidad alta',
  medium: 'Autenticidad media',
  low: 'Autenticidad baja',
};

export const LEVEL_SHORT: Record<ScoreLevel, string> = { high: 'Alto', medium: 'Medio', low: 'Bajo' };

export const STATUS_TEXT: Record<SignalStatus, string> = { good: 'Bien', warning: 'Atención', risk: 'Riesgo' };

/** Nunca se afirma que una cuenta "es falsa": es una estimación con señales. */
export const VERDICT_TEXT: Record<ScoreLevel, string> = {
  high: 'Su interacción es coherente con el tamaño de su audiencia. Sigue siendo una estimación.',
  medium: 'Hay señales mixtas. Revisa el detalle antes de decidir.',
  low: 'Varias señales no cuadran con una audiencia típica. Revisa el detalle: es una estimación, no una acusación.',
};

const ERROR_TEXT: Record<string, string> = {
  INVALID_USERNAME: 'Escribe un usuario válido: de 2 a 24 caracteres, con letras, números, _ y .',
  QUOTA_EXCEEDED: 'Llegaste al límite de análisis gratuitos de este mes.',
  PROFILE_NOT_FOUND: 'No encontramos esa cuenta.',
  PROFILE_PRIVATE: 'La cuenta es privada: solo analizamos cuentas públicas.',
  PROFILE_UNAVAILABLE: 'No pudimos consultar la cuenta ahora (bloqueo o sin conexión). Intenta más tarde.',
  INSUFFICIENT_DATA: 'No hay datos suficientes para calcular un puntaje.',
  ANALYSIS_NOT_FOUND: 'No encontramos ese análisis.',
  INVALID_COMPARISON: 'Elige dos análisis distintos para compararlos.',
};

export function messageForCode(code: string): string {
  return ERROR_TEXT[code] ?? 'Ocurrió un error inesperado.';
}

export function errorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  return messageForCode(code ?? '');
}
