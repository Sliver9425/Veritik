import { CommentSample, Profile, Username, VideoStats } from '../../domain';

/** Formato del JSON que genera tiktok_scraper_hibrido.py (solo se tipan los campos que se usan o aparecen). */
export interface ScraperComment {
  texto: string;
  likes?: number;
  fecha?: string;
}

export interface ScraperVideo {
  url: string;
  /** "YYYY-MM-DD HH:MM" (hora local). */
  fecha?: string;
  descripcion?: string;
  vistas: number | null;
  likes: number | null;
  comentarios: number | null;
  compartidos: number | null;
  primeros_comentarios?: ReadonlyArray<ScraperComment>;
}

export interface ScraperExport {
  perfil: { usuario: string; seguidores: number; seguidos: number; likes_totales: number; videos: number };
  ultimos_videos: ReadonlyArray<ScraperVideo>;
}

/**
 * APROXIMACIÓN: un comentario cuenta como "genérico" si tiene 2 palabras o menos, o ninguna letra (solo emojis o símbolos).
 * Es una regla simple para datos de ejemplo, no un detector real. Solo letras latinas (sin \p{L}, por compatibilidad con Hermes).
 */
function isGeneric(text: string): boolean {
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  return words.length <= 2 || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(text);
}

function parseLocalDate(text: string): Date {
  const date = new Date(text.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) throw new Error(`Fecha inválida: ${text}`);
  return date;
}

/** Convierte lo que exportó el scraper en un `Profile` del dominio. Los comentarios se reducen a conteos (no se guardan textos). */
export function profileFromScraperExport(data: ScraperExport, fetchedAt: Date): Profile {
  const videos = data.ultimos_videos.map((v) =>
    VideoStats.create({
      id: (v.url.split('/').pop() ?? v.url).split('?')[0] ?? v.url,
      url: v.url,
      publishedAt: v.fecha ? parseLocalDate(v.fecha) : fetchedAt,
      views: v.vistas ?? 0,
      likes: v.likes ?? 0,
      comments: v.comentarios ?? 0,
      shares: v.compartidos ?? 0,
    }),
  );

  const texts = data.ultimos_videos.flatMap((v) => (v.primeros_comentarios ?? []).map((c) => c.texto));
  const commentSample = texts.length > 0 ? CommentSample.create(texts.length, texts.filter(isGeneric).length) : null;

  const p = data.perfil;
  return Profile.create({
    username: Username.create(p.usuario),
    followers: p.seguidores,
    following: p.seguidos,
    totalLikes: p.likes_totales,
    videoCount: p.videos,
    videos,
    commentSample,
    fetchedAt,
  });
}
