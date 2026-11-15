/** Recuerda si la persona ya vio la bienvenida de la app. */
export interface OnboardingRepository {
  hasCompleted(): Promise<boolean>;
  markCompleted(): Promise<void>;
}
