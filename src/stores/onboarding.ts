import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type OnboardingState = {
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  sportPrefs: string[]; // e.g., ['Soccer', 'Basketball']
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | null;
  onboardingCompleted: boolean;

  setCity: (city: string, latitude?: number | null, longitude?: number | null) => void;
  setRadiusKm: (km: number | null) => void;
  setSportPrefs: (sports: string[]) => void;
  setSkillLevel: (level: 'Beginner' | 'Intermediate' | 'Advanced') => void;
  setOnboardingCompleted: (v: boolean) => void;

  _rehydrated?: boolean;
};

const KEY = 'onboarding:v1';

async function load(): Promise<Partial<OnboardingState>> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as Partial<OnboardingState>) : {};
  } catch {
    return {};
  }
}

async function save(partial: Partial<OnboardingState>) {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    const base = raw ? JSON.parse(raw) : {};
    const next = { ...base, ...partial };
    await SecureStore.setItemAsync(KEY, JSON.stringify(next));
  } catch {
    // ignore persistence errors
  }
}

export const useOnboardingStore = create<OnboardingState>((set) => {
  // async rehydrate
  void (async () => {
    const data = await load();
    set({ ...data, _rehydrated: true } as any);
  })();

  return {
    city: '',
    latitude: null,
    longitude: null,
    radiusKm: null,
    sportPrefs: [],
    skillLevel: null,
    onboardingCompleted: false,

    setCity: (city, latitude, longitude) => {
      set({ city, latitude: latitude ?? null, longitude: longitude ?? null });
      void save({ city, latitude: latitude ?? null, longitude: longitude ?? null });
    },
    setRadiusKm: (km) => {
      set({ radiusKm: km });
      void save({ radiusKm: km });
    },
    setSportPrefs: (sports) => {
      set({ sportPrefs: sports });
      void save({ sportPrefs: sports });
    },
    setSkillLevel: (level) => {
      set({ skillLevel: level });
      void save({ skillLevel: level });
    },
    setOnboardingCompleted: (v) => {
      set({ onboardingCompleted: v });
      void save({ onboardingCompleted: v });
    },
  };
});
