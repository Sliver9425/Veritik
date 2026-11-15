import { assertNonNegativeInteger } from '../shared/invariants';
import type { CommentSample } from '../value-objects/CommentSample';
import type { Username } from '../value-objects/Username';
import type { VideoStats } from './VideoStats';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface ProfileProps {
  readonly username: Username;
  readonly followers: number;
  readonly following: number;
  readonly totalLikes: number;
  readonly videoCount: number;
  readonly videos: ReadonlyArray<VideoStats>;
  /** null cuando TikTok no deja ver comentarios (p. ej. exige iniciar sesión). */
  readonly commentSample: CommentSample | null;
  readonly fetchedAt: Date;
}

/** Perfil público de TikTok con sus videos recientes. Raíz del agregado; identidad: `username`. */
export class Profile {
  private constructor(
    readonly username: Username,
    readonly followers: number,
    readonly following: number,
    readonly totalLikes: number,
    readonly videoCount: number,
    readonly videos: ReadonlyArray<VideoStats>,
    readonly commentSample: CommentSample | null,
    readonly fetchedAt: Date,
  ) {}

  static create(p: ProfileProps): Profile {
    assertNonNegativeInteger('seguidores', p.followers);
    assertNonNegativeInteger('seguidos', p.following);
    assertNonNegativeInteger('likes totales', p.totalLikes);
    assertNonNegativeInteger('cantidad de videos', p.videoCount);
    return new Profile(
      p.username, p.followers, p.following, p.totalLikes, p.videoCount,
      [...p.videos], p.commentSample, p.fetchedAt,
    );
  }

  get hasVideos(): boolean {
    return this.videos.length > 0;
  }

  /** Vistas promedio de los videos analizados; null si no hay videos. */
  get averageViews(): number | null {
    if (!this.hasVideos) return null;
    const total = this.videos.reduce((sum, v) => sum + v.views, 0);
    return total / this.videos.length;
  }

  /** Interacciones totales ÷ vistas totales (más robusto que promediar tasas por video). */
  get averageEngagementRate(): number | null {
    if (!this.hasVideos) return null;
    const views = this.videos.reduce((sum, v) => sum + v.views, 0);
    if (views === 0) return null;
    const interactions = this.videos.reduce((sum, v) => sum + v.interactions, 0);
    return interactions / views;
  }

  /** Vistas promedio ÷ seguidores; null si no hay videos o no hay seguidores. */
  get viewsToFollowersRatio(): number | null {
    const avg = this.averageViews;
    if (avg === null || this.followers === 0) return null;
    return avg / this.followers;
  }

  /** Seguidores ÷ seguidos; null si no sigue a nadie (la razón sería infinita). */
  get followersToFollowingRatio(): number | null {
    return this.following === 0 ? null : this.followers / this.following;
  }

  /** Publicaciones por semana entre el video más antiguo y el más reciente; null con menos de 2 videos o fechas iguales. */
  get postsPerWeek(): number | null {
    if (this.videos.length < 2) return null;
    const times = this.videos.map((v) => v.publishedAt.getTime());
    const spanDays = (Math.max(...times) - Math.min(...times)) / MS_PER_DAY;
    if (spanDays <= 0) return null;
    return (this.videos.length - 1) / (spanDays / 7);
  }
}
