/** Error base de la capa de aplicación. Cada subclase tiene un `code` estable que la UI puede mapear a un mensaje. */
export abstract class ApplicationError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Se alcanzó el límite mensual de análisis gratuitos. */
export class QuotaExceededError extends ApplicationError {
  readonly code = 'QUOTA_EXCEEDED';
}

export class AnalysisNotFoundError extends ApplicationError {
  readonly code = 'ANALYSIS_NOT_FOUND';
}

/** Se pidió una comparación que no tiene sentido (por ejemplo, un análisis consigo mismo). */
export class InvalidComparisonError extends ApplicationError {
  readonly code = 'INVALID_COMPARISON';
}
