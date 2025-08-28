import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type SportFilter = 'All' | 'Soccer' | 'Basketball' | 'Tennis' | 'Volleyball' | 'Pickleball';
export type SkillFilter = 'all' | 'Beginner' | 'Intermediate' | 'Advanced';

type State = {
  lastSportFilter: SportFilter;
  lastSkillFilter: SkillFilter;
  setLastSportFilter: (s: SportFilter) => void;
  setLastSkillFilter: (s: SkillFilter) => void;
  _rehydrated?: boolean;
};

const KEY = 'discoveryPrefs:v1';

async function load(): Promise<Pick<State, 'lastSportFilter' | 'lastSkillFilter'>> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return { lastSportFilter: 'All', lastSkillFilter: 'all' };
    const parsed = JSON.parse(raw);
    const sport: SportFilter =
      parsed.lastSportFilter === 'Soccer' ||
      parsed.lastSportFilter === 'Basketball' ||
      parsed.lastSportFilter === 'Tennis' ||
      parsed.lastSportFilter === 'Volleyball' ||
      parsed.lastSportFilter === 'Pickleball'
        ? parsed.lastSportFilter
        : 'All';
    const skill: SkillFilter =
      parsed.lastSkillFilter === 'Beginner' ||
      parsed.lastSkillFilter === 'Intermediate' ||
      parsed.lastSkillFilter === 'Advanced'
        ? parsed.lastSkillFilter
        : 'all';
    return { lastSportFilter: sport, lastSkillFilter: skill };
  } catch {
    return { lastSportFilter: 'All', lastSkillFilter: 'all' };
  }
}

async function save(partial: Partial<Pick<State, 'lastSportFilter' | 'lastSkillFilter'>>) {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    const base = raw ? JSON.parse(raw) : {};
    const next = { ...base, ...partial };
    await SecureStore.setItemAsync(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export const useDiscoveryPrefs = create<State>((set) => {
  void (async () => {
    const data = await load();
    set({ ...data, _rehydrated: true });
  })();

  return {
    lastSportFilter: 'All',
    lastSkillFilter: 'all',
    setLastSportFilter: (s) => {
      set({ lastSportFilter: s });
      void save({ lastSportFilter: s });
    },
    setLastSkillFilter: (s) => {
      set({ lastSkillFilter: s });
      void save({ lastSkillFilter: s });
    },
  };
});
