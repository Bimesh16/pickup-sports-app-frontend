import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type Template = {
  title?: string;
  sport?: string;
  location?: string;
  startsAt?: string;
  maxPlayers?: string;
  description?: string;
  durationMinutes?: string;
};

type State = {
  template: Template | null;
  remember: boolean;
  setTemplate: (t: Template | null) => void;
  setRemember: (v: boolean) => void;
  _rehydrated?: boolean;
};

const KEY = 'createTemplate:v1';

async function load(): Promise<{ template: Template | null; remember: boolean }> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return { template: null, remember: true };
    const parsed = JSON.parse(raw);
    return { template: parsed.template ?? parsed, remember: parsed.remember ?? true };
  } catch {
    return { template: null, remember: true };
  }
}

async function saveState(payload: { template: Template | null; remember: boolean }) {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export const useCreateTemplate = create<State>((set, get) => {
  void (async () => {
    const { template, remember } = await load();
    set({ template, remember, _rehydrated: true });
  })();

  return {
    template: null,
    remember: true,
    setTemplate: (t) => {
      set({ template: t });
      const { remember } = get();
      void saveState({ template: t, remember });
    },
    setRemember: (v) => {
      set({ remember: v });
      const { template } = get();
      void saveState({ template, remember: v });
    },
  };
});
