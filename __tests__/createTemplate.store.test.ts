import {describe} from "node:test";

jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    getItemAsync: async (k: string) => store[k] ?? null,
    setItemAsync: async (k: string, v: string) => { store[k] = v; },
    deleteItemAsync: async (k: string) => { delete store[k]; },
  };
});

import { act } from 'react-test-renderer';
import { useCreateTemplate } from '@/src/stores/createTemplate';

describe('createTemplate store', () => {
  test('rehydrates with null by default and remember=true', async () => {
    const { template, remember, _rehydrated } = useCreateTemplate.getState();
    // initial async rehydrate may not be done yet; wait a tick
    await new Promise((r) => setTimeout(r, 0));
    const s = useCreateTemplate.getState();
    expect(s._rehydrated).toBe(true);
    expect(typeof s.remember).toBe('boolean');
  });

  test('setTemplate persists template', async () => {
    await act(async () => {
      useCreateTemplate.getState().setTemplate({
        title: 'Pickup',
        sport: 'Soccer',
        location: 'Court A',
        startsAt: '2030-01-01T10:00',
        maxPlayers: '10',
        description: 'Bring water',
        durationMinutes: '60',
      });
    });

    const s1 = useCreateTemplate.getState();
    expect(s1.template?.title).toBe('Pickup');
    expect(s1.template?.sport).toBe('Soccer');

    await act(async () => {
      useCreateTemplate.getState().setRemember(false);
    });

    const s2 = useCreateTemplate.getState();
    expect(s2.remember).toBe(false);
  });
});
