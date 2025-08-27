import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type PrefsState = {
  lastQuery: string;
  showJoinedDefault: boolean;
  timeFilter: 'all' | 'today' | 'week';
  defaultCalDuration: number; // minutes, e.g., 60/90/120
  setLastQuery: (q: string) => void;
  setShowJoinedDefault: (v: boolean) => void;
  setTimeFilter: (t: 'all' | 'today' | 'week') => void;
  setDefaultCalDuration: (m: number) => void;
  _rehydrated?: boolean;
};

const KEY = 'prefs:v1';

async function loadPrefs(): Promise<Pick<PrefsState, 'lastQuery' | 'showJoinedDefault' | 'timeFilter' | 'defaultCalDuration'>> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return { lastQuery: '', showJoinedDefault: false, timeFilter: 'all', defaultCalDuration: 60 };
    const parsed = JSON.parse(raw);
    return {
      lastQuery: typeof parsed.lastQuery === 'string' ? parsed.lastQuery : '',
      showJoinedDefault: !!parsed.showJoinedDefault,
      timeFilter: parsed.timeFilter === 'today' || parsed.timeFilter === 'week' ? parsed.timeFilter : 'all',
      defaultCalDuration: Number.isFinite(parsed.defaultCalDuration) ? parsed.defaultCalDuration : 60,
    };
  } catch {
    return { lastQuery: '', showJoinedDefault: false, timeFilter: 'all', defaultCalDuration: 60 };
  }
}

async function savePrefs(partial: Partial<Pick<PrefsState, 'lastQuery' | 'showJoinedDefault' | 'timeFilter' | 'defaultCalDuration'>>) {
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
    timeFilter: 'all',
    defaultCalDuration: 60,
    setLastQuery: (q: string) => {
      set({ lastQuery: q });
      void savePrefs({ lastQuery: q });
    },
    setShowJoinedDefault: (v: boolean) => {
      set({ showJoinedDefault: v });
      void savePrefs({ showJoinedDefault: v });
    },
    setTimeFilter: (t) => {
      set({ timeFilter: t });
      void savePrefs({ timeFilter: t });
    },
    setDefaultCalDuration: (m) => {
      set({ defaultCalDuration: m });
      void savePrefs({ defaultCalDuration: m });
    },
  };
});
