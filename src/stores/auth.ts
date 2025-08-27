import { create } from 'zustand';
import type { AuthSession } from '@/src/features/auth/api';

export type AuthUser = {
  username: string;
  roles: string[];
  authenticated: boolean;
  displayName?: string;
  avatarUrl?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  sessions: AuthSession[];
  mfaEnabled: boolean;
  setUser: (u: AuthUser | null) => void;
  setSessions: (s: AuthSession[]) => void;
  setMfaEnabled: (v: boolean) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sessions: [],
  mfaEnabled: false,
  setUser: (u) => set({ user: u }),
  setSessions: (s) => set({ sessions: s }),
  setMfaEnabled: (v) => set({ mfaEnabled: v }),
  clear: () => set({ user: null, sessions: [], mfaEnabled: false }),
}));
