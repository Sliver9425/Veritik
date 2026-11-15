import { CommentSample, Profile, ProfileUnavailableError, VideoStats } from '../../domain';
import type { Username } from '../../domain';

type Json = Record<string, unknown>;

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function num(o: Json, key: string): number {
  const v = o[key];
  if (typeof v !== 'number') throw new Error(`Falta el número "${key}"`);
  return v;
}
function str(o: Json, key: string): string {
  const v = o[key];
  if (typeof v !== 'string') throw new Error(`Falta el texto "${key}"`);
  return v;
}
function date(text: string): Date {
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) throw new Error(`Fecha inválida "${text}"`);
  return d;
}

/**
 * Convierte la respuesta JSON del backend (snake_case) en un `Profile`.
 * Cualquier campo ausente o inválido se informa como `ProfileUnavailableError`.
 */
export function parseProfileResponse(body: unknown, username: Username, fallbackNow: Date): Profile {
  try {
    if (!isRecord(body)) throw new Error('La respuesta no es un objeto');
    const rawVideos = body.videos ?? [];
    if (!Array.isArray(rawVideos)) throw new Error('"videos" debe ser una lista');
    const rawSample = body.comment_sample ?? null;

    let commentSample: CommentSample | null = null;
    if (rawSample !== null) {
      if (!isRecord(rawSample)) throw new Error('"comment_sample" inválido');
      commentSample = CommentSample.create(num(rawSample, 'total'), num(rawSample, 'generic_count'));
    }

    return Profile.create({
      username,
      followers: num(body, 'followers'),
      following: num(body, 'following'),
      totalLikes: num(body, 'total_likes'),
      videoCount: num(body, 'video_count'),
      videos: rawVideos.map((item: unknown) => {
        if (!isRecord(item)) throw new Error('Video inválido');
        return VideoStats.create({
          id: str(item, 'id'), url: str(item, 'url'), publishedAt: date(str(item, 'published_at')),
          views: num(item, 'views'), likes: num(item, 'likes'), comments: num(item, 'comments'), shares: num(item, 'shares'),
        });
      }),
      commentSample,
      fetchedAt: typeof body.fetched_at === 'string' ? date(body.fetched_at) : fallbackNow,
    });
  } catch {
    throw new ProfileUnavailableError('La respuesta del servidor no tiene el formato esperado');
  }
}
