import { create } from 'zustand';

/** Estado de sesión de la app (por ahora solo el plan). Los datos de negocio viven en casos de uso, no aquí. */
interface SessionState {
  isPremium: boolean;
  togglePremium: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isPremium: false,
  togglePremium: () => set((state) => ({ isPremium: !state.isPremium })),
}));
