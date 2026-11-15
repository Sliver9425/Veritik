import { PrivateProfileError, ProfileNotFoundError, ProfileUnavailableError } from '../../domain';
import type { Profile, ProfileRepository, Username } from '../../domain';
import type { Clock } from '../../application';
import { parseProfileResponse } from './parseProfileResponse';

/**
 * CONTRATO CON EL BACKEND (a implementar, p. ej. con FastAPI sobre el scraper de Python):
 *
 *   GET {baseUrl}/profiles/{username}
 *
 *   200 → {
 *     "followers": 48200, "following": 300, "total_likes": 900000, "video_count": 120,
 *     "videos": [{ "id": "...", "url": "...", "published_at": "2026-11-12T18:30:00Z",
 *                  "views": 11200, "likes": 480, "comments": 35, "shares": 12 }],
 *     "comment_sample": { "total": 100, "generic_count": 34 },   // o null si TikTok no deja ver comentarios
 *     "fetched_at": "2026-11-15T12:00:00Z"                        // opcional
 *   }
 *   404 → el usuario no existe          403 → la cuenta es privada
 *   429 / 5xx → bloqueo, captcha o límite de TikTok (se muestra como "no disponible")
 */
export interface FetchResponseLike {
  readonly ok: boolean;
  readonly status: number;
  json(): Promise<unknown>;
}
export type FetchLike = (url: string, init?: { signal?: AbortSignal }) => Promise<FetchResponseLike>;

export interface HttpProfileRepositoryOptions {
  readonly baseUrl: string;
  readonly clock: Clock;
  /** Inyectable para pruebas. Por defecto, el `fetch` global. */
  readonly fetchFn?: FetchLike;
  /** El scraping real puede tardar un minuto o más. */
  readonly timeoutMs?: number;
}

export class HttpProfileRepository implements ProfileRepository {
  private readonly baseUrl: string;
  private readonly clock: Clock;
  private readonly fetchFn: FetchLike;
  private readonly timeoutMs: number;

  constructor(options: HttpProfileRepositoryOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.clock = options.clock;
    this.fetchFn = options.fetchFn ?? ((url, init) => fetch(url, init));
    this.timeoutMs = options.timeoutMs ?? 120_000;
  }

  async fetchByUsername(username: Username): Promise<Profile> {
    const url = `${this.baseUrl}/profiles/${encodeURIComponent(username.value)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      let response: FetchResponseLike;
      try {
        response = await this.fetchFn(url, { signal: controller.signal });
      } catch {
        throw new ProfileUnavailableError('No se pudo conectar con el servidor de análisis');
      }

      if (!response.ok) throw this.errorForStatus(response.status);

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        throw new ProfileUnavailableError('El servidor devolvió una respuesta ilegible');
      }
      return parseProfileResponse(body, username, this.clock.now());
    } finally {
      clearTimeout(timer);
    }
  }

  private errorForStatus(status: number): Error {
    if (status === 404) return new ProfileNotFoundError('No encontramos esa cuenta');
    if (status === 403) return new PrivateProfileError('La cuenta es privada');
    return new ProfileUnavailableError(`El servidor respondió con el error ${status}`);
  }
}
