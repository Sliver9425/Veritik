import type { ScraperExport } from '../scraperExport';
import { callaNomas } from './callaNomas';

/**
 * Cuentas con datos reales guardados. Para agregar otra: crea su archivo en esta carpeta
 * (con el JSON del scraper, como en callaNomas.ts) y añade UNA línea aquí.
 */
export const FIXTURES: ReadonlyArray<ScraperExport> = [callaNomas];
