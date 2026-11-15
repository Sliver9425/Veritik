import { InvalidUsernameError } from '../errors/DomainError';

const MIN_LENGTH = 2;
const MAX_LENGTH = 24;
const ALLOWED_CHARS = /^[a-z0-9_.]+$/;

/** Usuario de TikTok normalizado: sin "@", en minúsculas y validado. Inmutable. */
export class Username {
  private constructor(readonly value: string) {}

  static create(raw: string): Username {
    const normalized = raw.trim().replace(/^@+/, '').toLowerCase();

    if (normalized.length < MIN_LENGTH || normalized.length > MAX_LENGTH) {
      throw new InvalidUsernameError(`El usuario debe tener entre ${MIN_LENGTH} y ${MAX_LENGTH} caracteres`);
    }
    if (!ALLOWED_CHARS.test(normalized)) {
      throw new InvalidUsernameError('Solo se permiten letras, números, guion bajo y punto');
    }
    if (normalized.endsWith('.')) {
      throw new InvalidUsernameError('El usuario no puede terminar en punto');
    }
    return new Username(normalized);
  }

  static isValid(raw: string): boolean {
    try {
      Username.create(raw);
      return true;
    } catch {
      return false;
    }
  }

  /** Forma para mostrar en pantalla: "@usuario". */
  get handle(): string {
    return `@${this.value}`;
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
