import type { SignalId } from '../../domain';

/**
 * Formato guardado en disco. Es independiente de las clases del dominio: fechas como texto ISO y solo datos simples.
 * Si el formato cambia, se sube `HISTORY_FORMAT_VERSION` y se migra o se descarta lo anterior.
 */
export const HISTORY_FORMAT_VERSION = 1;

export interface VideoRecord {
  id: string;
  url: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface ProfileRecord {
  username: string;
  followers: number;
  following: number;
  totalLikes: number;
  videoCount: number;
  videos: VideoRecord[];
  commentSample: { total: number; genericCount: number } | null;
  fetchedAt: string;
}

export interface SignalRecord {
  id: SignalId;
  score: number | null;
  rawValue: number | null;
}

export interface AnalysisRecord {
  id: string;
  profile: ProfileRecord;
  signals: SignalRecord[];
  analyzedAt: string;
}

export interface HistoryDocument {
  v: number;
  items: AnalysisRecord[];
}
