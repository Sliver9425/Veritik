import { assertNonNegativeInteger } from '../shared/invariants';

interface VideoStatsProps {
  readonly id: string;
  readonly url: string;
  readonly publishedAt: Date;
  readonly views: number;
  readonly likes: number;
  readonly comments: number;
  readonly shares: number;
}

/** Estadísticas públicas de un video. Identidad: `id` del video en TikTok. */
export class VideoStats {
  private constructor(
    readonly id: string,
    readonly url: string,
    readonly publishedAt: Date,
    readonly views: number,
    readonly likes: number,
    readonly comments: number,
    readonly shares: number,
  ) {}

  static create(p: VideoStatsProps): VideoStats {
    assertNonNegativeInteger('vistas', p.views);
    assertNonNegativeInteger('likes', p.likes);
    assertNonNegativeInteger('comentarios', p.comments);
    assertNonNegativeInteger('compartidos', p.shares);
    return new VideoStats(p.id, p.url, p.publishedAt, p.views, p.likes, p.comments, p.shares);
  }

  get interactions(): number {
    return this.likes + this.comments + this.shares;
  }

  /** (likes + comentarios + compartidos) ÷ vistas. 0 si el video no tiene vistas. */
  get engagementRate(): number {
    return this.views === 0 ? 0 : this.interactions / this.views;
  }
}
