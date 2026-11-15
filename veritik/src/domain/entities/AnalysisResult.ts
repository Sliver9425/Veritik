import { InsufficientDataError } from '../errors/DomainError';
import { AuthenticityScore } from '../value-objects/AuthenticityScore';
import type { ScoreLevel } from '../value-objects/AuthenticityScore';
import type { Profile } from './Profile';
import type { Signal, SignalId } from './Signal';

interface AnalysisResultProps {
  /** Lo genera quien llama (el dominio no depende de librerías de UUID). */
  readonly id: string;
  readonly profile: Profile;
  readonly signals: ReadonlyArray<Signal>;
  readonly analyzedAt: Date;
}

/** Resultado de analizar un perfil: señales + puntaje. Raíz del agregado; identidad: `id`. */
export class AnalysisResult {
  private constructor(
    readonly id: string,
    readonly profile: Profile,
    readonly signals: ReadonlyArray<Signal>,
    readonly score: AuthenticityScore,
    readonly analyzedAt: Date,
  ) {}

  static create(p: AnalysisResultProps): AnalysisResult {
    const score = AuthenticityScore.fromSignals(p.signals);
    if (score === null) {
      throw new InsufficientDataError('No hay datos suficientes para calcular el puntaje de autenticidad');
    }
    return new AnalysisResult(p.id, p.profile, [...p.signals], score, p.analyzedAt);
  }

  get level(): ScoreLevel {
    return this.score.level;
  }

  getSignal(id: SignalId): Signal | undefined {
    return this.signals.find((s) => s.id === id);
  }

  /** Señales que no se pudieron calcular (la UI debe avisarlo en lugar de inventar un valor). */
  get unavailableSignals(): ReadonlyArray<Signal> {
    return this.signals.filter((s) => !s.isAvailable);
  }
}
