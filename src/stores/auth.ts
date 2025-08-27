import { create } from 'zustand';
export type AuthUser = {
  username: string;
  roles: string[];
  authenticated: boolean;
  displayName?: string;
  avatarUrl?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  clear: () => set({ user: null }),
}));
