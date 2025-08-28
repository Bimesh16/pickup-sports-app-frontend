import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type DraftState = {
  drafts: Record<string, string>;
  setDraft: (gameId: string, text: string) => void;
  clearDraft: (gameId: string) => void;
  _rehydrated?: boolean;
};

const KEY = 'chatDrafts:v1';

async function load(): Promise<Record<string, string>> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

async function save(drafts: Record<string, string>) {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(drafts));
  } catch {
    // ignore
  }
}

export const useChatDrafts = create<DraftState>((set, get) => {
  void (async () => {
    const data = await load();
    set({ drafts: data, _rehydrated: true });
  })();

  return {
    drafts: {},
    setDraft: (gameId, text) => {
      const next = { ...get().drafts, [gameId]: text };
      set({ drafts: next });
      void save(next);
    },
    clearDraft: (gameId) => {
      const drafts = { ...get().drafts };
      delete drafts[gameId];
      set({ drafts });
      void save(drafts);
    },
  };
});
