import type { Profile } from '../entities/Profile';
import type { Username } from '../value-objects/Username';

/**
 * Contrato para obtener un perfil público.
 * @throws ProfileNotFoundError | PrivateProfileError | ProfileUnavailableError
 */
export interface ProfileRepository {
  fetchByUsername(username: Username): Promise<Profile>;
}
