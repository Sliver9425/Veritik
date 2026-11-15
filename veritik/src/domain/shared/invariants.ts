import { InvalidMetricError } from '../errors/DomainError';

export function assertNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new InvalidMetricError(`${name} debe ser un entero mayor o igual a 0 (recibido: ${value})`);
  }
}

export function assertRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new InvalidMetricError(`${name} debe estar entre ${min} y ${max} (recibido: ${value})`);
  }
}
