/** Error base del dominio. Cada subclase aporta un `code` estable para que capas externas puedan mapearlo. */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidUsernameError extends DomainError {
  readonly code = 'INVALID_USERNAME';
}

export class InvalidMetricError extends DomainError {
  readonly code = 'INVALID_METRIC';
}

export class InsufficientDataError extends DomainError {
  readonly code = 'INSUFFICIENT_DATA';
}

export class ProfileNotFoundError extends DomainError {
  readonly code = 'PROFILE_NOT_FOUND';
}

export class PrivateProfileError extends DomainError {
  readonly code = 'PROFILE_PRIVATE';
}

/** La fuente de datos no pudo responder (bloqueo, captcha, límite de TikTok, sin conexión). */
export class ProfileUnavailableError extends DomainError {
  readonly code = 'PROFILE_UNAVAILABLE';
}
