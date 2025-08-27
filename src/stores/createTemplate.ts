import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type Template = {
  title?: string;
  location?: string;
  startsAt?: string;
  maxPlayers?: string;
};

type State = {
  template: Template | null;
  setTemplate: (t: Template | null) => void;
  _rehydrated?: boolean;
};

const KEY = 'createTemplate:v1';

async function load(): Promise<Template | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as Template) : null;
  } catch {
    return null;
  }
}

async function save(t: Template | null) {
  try {
    if (t) await SecureStore.setItemAsync(KEY, JSON.stringify(t));
    else await SecureStore.deleteItemAsync(KEY);
  } catch {
    // ignore
  }
}

export const useCreateTemplate = create<State>((set) => {
  void (async () => {
    const tpl = await load();
    set({ template: tpl, _rehydrated: true });
  })();

  return {
    template: null,
    setTemplate: (t) => {
      set({ template: t });
      void save(t);
    },
  };
});
