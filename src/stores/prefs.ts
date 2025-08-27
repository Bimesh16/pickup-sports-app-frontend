import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type PrefsState = {
  lastQuery: string;
  showJoinedDefault: boolean;
  setLastQuery: (q: string) => void;
  setShowJoinedDefault: (v: boolean) => void;
  _rehydrated?: boolean;
};

const KEY = 'prefs:v1';

async function loadPrefs(): Promise<Pick<PrefsState, 'lastQuery' | 'showJoinedDefault'>> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return { lastQuery: '', showJoinedDefault: false };
    const parsed = JSON.parse(raw);
    return {
      lastQuery: typeof parsed.lastQuery === 'string' ? parsed.lastQuery : '',
      showJoinedDefault: !!parsed.showJoinedDefault,
    };
  } catch {
    return { lastQuery: '', showJoinedDefault: false };
  }
}

async function savePrefs(partial: Partial<Pick<PrefsState, 'lastQuery' | 'showJoinedDefault'>>) {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    const base = raw ? JSON.parse(raw) : {};
    const next = { ...base, ...partial };
    await SecureStore.setItemAsync(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export const usePrefs = create<PrefsState>((set, get) => {
  // kick off async rehydrate
  void (async () => {
    const data = await loadPrefs();
    set({ ...data, _rehydrated: true });
  })();

  return {
    lastQuery: '',
    showJoinedDefault: false,
    setLastQuery: (q: string) => {
      set({ lastQuery: q });
      void savePrefs({ lastQuery: q });
    },
    setShowJoinedDefault: (v: boolean) => {
      set({ showJoinedDefault: v });
      void savePrefs({ showJoinedDefault: v });
    },
  };
});
