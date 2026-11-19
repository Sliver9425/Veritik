import { ProfileUnavailableError, Username } from '../../domain';
import type { Profile, ProfileRepository } from '../../domain';
import type { Clock } from '../../application';
import { profileFromScraperExport } from './scraperExport';
import type { ScraperExport } from './scraperExport';

/**
 * Repositorio de DESARROLLO con datos REALES guardados: si el usuario coincide con uno de los JSON exportados por el scraper,
 * devuelve ese perfil; si no, delega en `fallback` (el generador de perfiles de ejemplo).
 */
export class FixtureProfileRepository implements ProfileRepository {
  private readonly byUsername = new Map<string, ScraperExport>();

  constructor(
    private readonly clock: Clock,
    fixtures: ReadonlyArray<ScraperExport>,
    private readonly fallback: ProfileRepository,
    private readonly latencyMs: number = 900,
  ) {
    for (const fixture of fixtures) {
      try {
        this.byUsername.set(Username.create(fixture.perfil.usuario).value, fixture);
      } catch {
        // Usuario inválido en un archivo de datos: se ignora ese archivo.
      }
    }
  }

  async fetchByUsername(username: Username): Promise<Profile> {
    const fixture = this.byUsername.get(username.value);
    if (fixture === undefined) return this.fallback.fetchByUsername(username);

    if (this.latencyMs > 0) await new Promise<void>((resolve) => setTimeout(() => resolve(), this.latencyMs));
    try {
      return profileFromScraperExport(fixture, this.clock.now());
    } catch {
      throw new ProfileUnavailableError('El archivo de datos guardado de esa cuenta no es válido');
    }
  }
}
