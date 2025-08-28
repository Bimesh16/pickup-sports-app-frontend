import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type SavedFilter = {
  id: string;
  name: string;
  city?: string;
  sport?: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  timeFilter?: 'all' | 'today' | 'week';
  radiusKm?: number | null;
};

type State = {
  filters: SavedFilter[];
  add: (f: SavedFilter) => void;
  remove: (id: string) => void;
  _rehydrated?: boolean;
};

const KEY = 'savedFilters:v1';

async function load(): Promise<SavedFilter[]> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as SavedFilter[]) : [];
  } catch {
    return [];
  }
}

async function save(filters: SavedFilter[]) {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(filters));
  } catch {
    // ignore
  }
}

export const useSavedFilters = create<State>((set, get) => {
  void (async () => {
    const items = await load();
    set({ filters: items, _rehydrated: true });
  })();

  return {
    filters: [],
    add: (f) => {
      const next = [f, ...get().filters].slice(0, 20);
      set({ filters: next });
      void save(next);
    },
    remove: (id) => {
      const next = get().filters.filter((x) => x.id !== id);
      set({ filters: next });
      void save(next);
    },
  };
});
