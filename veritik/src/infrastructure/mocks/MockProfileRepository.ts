import {
  CommentSample, PrivateProfileError, Profile, ProfileNotFoundError, ProfileUnavailableError, VideoStats,
} from '../../domain';
import type { ProfileRepository, Username } from '../../domain';
import type { Clock } from '../../application';

/**
 * Repositorio de DESARROLLO: genera perfiles inventados (pero estables para cada usuario), sin backend ni internet.
 *
 * Nombres con efecto especial (para probar cada estado de la UI):
 *   contiene "fake", "falsa" o "inflad" → cuenta con señales sospechosas  (puntaje bajo)
 *   contiene "medio" o "mixta"          → cuenta con señales mixtas       (puntaje medio)
 *   cualquier otro                      → cuenta saludable                (puntaje alto)
 *   "privada" · "noexiste" · "bloqueada" → error de cuenta privada / no encontrada / no disponible
 */
type Archetype = 'healthy' | 'mixed' | 'inflated';
type Range = readonly [number, number];

const ARCHETYPES: Record<Archetype, {
  followers: Range; following: Range; viewsRatio: Range; engagement: Range;
  gapDays: Range; commentTotal: Range; genericRatio: Range;
}> = {
  healthy: { followers: [20000, 80000], following: [100, 600], viewsRatio: [0.15, 0.4], engagement: [0.04, 0.08], gapDays: [1.5, 3], commentTotal: [40, 100], genericRatio: [0.05, 0.2] },
  mixed: { followers: [10000, 40000], following: [800, 1500], viewsRatio: [0.02, 0.035], engagement: [0.01, 0.016], gapDays: [3, 6], commentTotal: [30, 60], genericRatio: [0.35, 0.5] },
  inflated: { followers: [60000, 120000], following: [2000, 6000], viewsRatio: [0.003, 0.008], engagement: [0.002, 0.004], gapDays: [10, 20], commentTotal: [50, 100], genericRatio: [0.6, 0.85] },
};

const VIDEO_COUNT = 6;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function between(random: () => number, [min, max]: Range): number {
  return min + (max - min) * random();
}

function archetypeFor(handle: string): Archetype {
  if (/fake|falsa|inflad/.test(handle)) return 'inflated';
  if (/medio|mixta/.test(handle)) return 'mixed';
  return 'healthy';
}

export class MockProfileRepository implements ProfileRepository {
  constructor(
    private readonly clock: Clock,
    private readonly latencyMs: number = 900,
  ) {}

  async fetchByUsername(username: Username): Promise<Profile> {
    if (this.latencyMs > 0) await new Promise<void>((resolve) => setTimeout(() => resolve(), this.latencyMs));

    const handle = username.value;
    if (handle.includes('noexiste')) throw new ProfileNotFoundError('No encontramos esa cuenta');
    if (handle.includes('privada')) throw new PrivateProfileError('La cuenta es privada');
    if (handle.includes('bloqueada')) throw new ProfileUnavailableError('TikTok bloqueó temporalmente la consulta');

    const seed = hash(handle);
    const random = seededRandom(seed);
    const a = ARCHETYPES[archetypeFor(handle)];
    const fetchedAt = this.clock.now();

    const followers = Math.round(between(random, a.followers));
    const following = Math.round(between(random, a.following));

    const videos: VideoStats[] = [];
    let publishedAt = fetchedAt.getTime() - between(random, [0.2, 1]) * MS_PER_DAY;
    for (let i = 0; i < VIDEO_COUNT; i += 1) {
      const views = Math.round(followers * between(random, a.viewsRatio));
      const interactions = views * between(random, a.engagement);
      videos.push(
        VideoStats.create({
          id: `${seed}${i}`,
          url: `https://www.tiktok.com/@${handle}/video/${seed}${i}`,
          publishedAt: new Date(publishedAt),
          views,
          likes: Math.round(interactions * 0.88),
          comments: Math.round(interactions * 0.07),
          shares: Math.round(interactions * 0.05),
        }),
      );
      publishedAt -= between(random, a.gapDays) * MS_PER_DAY;
    }

    const total = Math.round(between(random, a.commentTotal));
    const generic = Math.round(total * between(random, a.genericRatio));
    // Alrededor de 1 de cada 5 cuentas simula "TikTok no dejó ver comentarios".
    const commentSample = random() < 0.2 ? null : CommentSample.create(total, generic);

    return Profile.create({
      username,
      followers,
      following,
      totalLikes: Math.round(followers * between(random, [10, 25])),
      videoCount: Math.round(between(random, [40, 200])),
      videos,
      commentSample,
      fetchedAt,
    });
  }
}
