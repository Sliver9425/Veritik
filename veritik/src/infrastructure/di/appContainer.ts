import { HttpProfileRepository } from '../api/HttpProfileRepository';
import { FIXTURES } from '../mocks/fixtures';
import { FixtureProfileRepository } from '../mocks/FixtureProfileRepository';
import { MockProfileRepository } from '../mocks/MockProfileRepository';
import { asyncStorageAdapter } from '../persistence/AsyncStorageAdapter';
import { SystemClock } from '../system/SystemClock';
import { createContainer } from './container';
import type { Container } from './container';

/**
 * Configuración real de la app. Si existe EXPO_PUBLIC_API_URL (archivo .env en la raíz del proyecto)
 * se usa el backend; si no, se usan los datos de ejemplo (fixtures + generador). Tras cambiar el .env: `npx expo start -c`.
 */
export function createAppContainer(): Container {
  const clock = new SystemClock();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  if (apiUrl) {
    return createContainer({
      profiles: new HttpProfileRepository({ baseUrl: apiUrl, clock }),
      storage: asyncStorageAdapter,
      clock,
      dataSource: 'api',
    });
  }
  return createContainer({
    // Cuentas con datos reales guardados (fixtures) y, para cualquier otro usuario, perfiles de ejemplo generados.
    profiles: new FixtureProfileRepository(clock, FIXTURES, new MockProfileRepository(clock)),
    storage: asyncStorageAdapter,
    clock,
    dataSource: 'mock',
  });
}

let instance: Container | null = null;

/** Contenedor único de la app (se crea la primera vez que se pide). */
export function getContainer(): Container {
  if (instance === null) instance = createAppContainer();
  return instance;
}
