import { getContainer } from '../infrastructure/di/appContainer';

/**
 * Único punto donde `presentation/` toca `infrastructure/`: la raíz de composición.
 * Las pantallas usan `container.<casoDeUso>.execute(...)` y no saben nada de repositorios ni de AsyncStorage.
 */
export const container = getContainer();
