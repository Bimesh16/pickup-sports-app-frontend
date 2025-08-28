import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type State = {
  lastSentMs: Record<string, number>;
  markSent: (key: string, atMs?: number) => void;
  _rehydrated?: boolean;
};

const KEY = 'resendCooldown:v1';

async function load(): Promise<Record<string, number>> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

async function save(map: Record<string, number>) {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export const useResendCooldown = create<State>((set, get) => {
  void (async () => {
    const data = await load();
    set({ lastSentMs: data, _rehydrated: true });
  })();

  return {
    lastSentMs: {},
    markSent: (key, atMs) => {
      const now = atMs ?? Date.now();
      const next = { ...get().lastSentMs, [key]: now };
      set({ lastSentMs: next });
      void save(next);
    },
  };
});

/**
 * Returns remaining cooldown seconds (ceil) for a given key and interval.
 * 0 means no cooldown (allowed now).
 */
export function getRemainingSeconds(key: string, intervalMs: number): number {
  const ms = useResendCooldown.getState().lastSentMs[key];
  if (!ms) return 0;
  const elapsed = Date.now() - ms;
  const leftMs = Math.max(0, intervalMs - elapsed);
  return Math.ceil(leftMs / 1000);
}
