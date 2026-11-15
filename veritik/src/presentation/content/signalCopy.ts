import type { SignalId } from '../../domain';
import { decimal, percent } from './format';

interface SignalCopy {
  readonly label: string;
  /** Texto de "¿Cómo se calcula?". */
  readonly explanation: string;
  /** Cómo mostrar el valor medido. */
  readonly format: (raw: number) => string;
}

export const SIGNAL_COPY: Record<SignalId, SignalCopy> = {
  engagement: {
    label: 'Engagement real',
    explanation:
      'Sumamos los likes, comentarios y compartidos de los últimos videos y los dividimos entre sus vistas. Un valor muy bajo, o extremadamente alto frente a lo habitual, puede indicar una audiencia poco real.',
    format: (raw) => percent(raw),
  },
  viewsToFollowers: {
    label: 'Vistas frente a seguidores',
    explanation:
      'Comparamos las vistas promedio de cada video con el número de seguidores. Si casi nadie de los seguidores ve el contenido, parte de la audiencia podría no ser activa.',
    format: (raw) => decimal(raw, 2),
  },
  commentQuality: {
    label: 'Calidad de comentarios',
    explanation:
      'Medimos qué proporción de los comentarios son repetidos, genéricos o solo emojis. Solo se cuentan, no se guardan textos ni nombres.',
    format: (raw) => `${percent(raw, 0)} genéricos`,
  },
  followRatio: {
    label: 'Seguidores / seguidos',
    explanation: 'Compara cuánta gente sigue a la cuenta con a cuánta gente sigue ella. Seguir a muchos más de los que te siguen es un patrón típico de cuentas que buscan crecer rápido.',
    format: (raw) => decimal(raw, 1),
  },
  postingRegularity: {
    label: 'Frecuencia de publicación',
    explanation: 'Publicaciones por semana entre el video más antiguo y el más reciente analizados. Mide la frecuencia, no la constancia entre fechas.',
    format: (raw) => `${decimal(raw, 1)} por semana`,
  },
  followerJumps: {
    label: 'Saltos de seguidores',
    explanation: 'Compara los seguidores con tu análisis anterior de esta cuenta. Cambios muy bruscos en pocos días son una señal de atención.',
    format: (raw) => `${percent(raw)} por día`,
  },
};

export const UNAVAILABLE_EXPLANATION =
  'No pudimos calcular esta señal porque faltan datos (por ejemplo, TikTok no dejó ver los comentarios). Por eso no cuenta en el puntaje.';
