/** Funciones puras que convierten una medida en un puntaje de 0 a 100. */

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** 0 en `zeroAt` o menos, 100 en `fullAt` o más, lineal entre ambos. */
export function rampUp(x: number, zeroAt: number, fullAt: number): number {
  return clamp01((x - zeroAt) / (fullAt - zeroAt)) * 100;
}

/** 100 en `fullAt` o menos, 0 en `zeroAt` o más, lineal entre ambos. */
export function rampDown(x: number, fullAt: number, zeroAt: number): number {
  return 100 - rampUp(x, fullAt, zeroAt);
}

/** Sube de 0 a 100 entre `zeroBelow` y `fullFrom`, se mantiene hasta `fullUntil` y baja a 0 en `zeroAbove`. */
export function trapezoid(x: number, zeroBelow: number, fullFrom: number, fullUntil: number, zeroAbove: number): number {
  return Math.min(rampUp(x, zeroBelow, fullFrom), rampDown(x, fullUntil, zeroAbove));
}
