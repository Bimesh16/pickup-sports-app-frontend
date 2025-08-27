import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GamesList from '@/src/features/games/components/GamesList';
import { setOnline } from '@/src/components/OfflineBanner';
import { joinGame, leaveGame } from '@/src/features/games/api';

jest.setTimeout(15000);

// Mock navigation and icons
jest.mock('expo-router', () => ({ Link: ({ children }: any) => <>{children}</> }));
jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesome');

// Controllable online state
jest.mock('@/src/components/OfflineBanner', () => {
  const React = require('react');
  let online = true;
  const listeners = new Set<() => void>();
  const setOnline = (v: boolean) => {
    online = v;
    listeners.forEach((l) => l());
  };
  const useOnline = () => {
    const [, force] = React.useReducer((c: number) => c + 1, 0);
    React.useEffect(() => {
      const listener = () => force();
      listeners.add(listener);
      return () => listeners.delete(listener);
    }, []);
    return online;
  };
  return { __esModule: true, default: () => null, useOnline, setOnline };
});

// Simplified prefs and toast
jest.mock('@/src/stores/prefs', () => ({
  usePrefs: () => ({
    lastQuery: '',
    showJoinedDefault: false,
    timeFilter: 'all',
    setLastQuery: jest.fn(),
    setShowJoinedDefault: jest.fn(),
    setTimeFilter: jest.fn(),
    _rehydrated: true,
  }),
}));

jest.mock('@/src/components/ToastProvider', () => ({
  useToast: () => ({ show: jest.fn(), success: jest.fn(), error: jest.fn(), info: jest.fn() }),
}));

// Mock API with in-memory data
const mockGames = [
  {
    id: '1',
    title: 'Test Game',
    startsAt: new Date().toISOString(),
    maxPlayers: 10,
    playersCount: 1,
    joined: false,
  },
];

jest.mock('@/src/features/games/api', () => ({
  joinGame: jest.fn(async (id: string) => {
    const g = mockGames.find((gm) => gm.id === id);
    if (g) {
      g.joined = true;
      g.playersCount += 1;
    }
  }),
  leaveGame: jest.fn(async (id: string) => {
    const g = mockGames.find((gm) => gm.id === id);
    if (g) {
      g.joined = false;
      g.playersCount = Math.max(g.playersCount - 1, 0);
    }
  }),
}));

// Mock game list hook to avoid network and React Query complexity
jest.mock('@/src/features/games/hooks/useInfiniteGames', () => ({
  useInfiniteGames: () => ({
    data: { pages: [{ items: mockGames, nextPage: null }] },
    isLoading: false,
    isRefetching: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
    hasNextPage: false,
    error: null,
    isError: false,
  }),
}));

const queryClient = new QueryClient();

describe('offline join/leave', () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setQueryData(['games'], { pages: [{ items: mockGames, nextPage: null }], pageParams: [1] });
    (joinGame as jest.Mock).mockClear();
    (leaveGame as jest.Mock).mockClear();
  });

  test('disables join offline and allows join/leave when online', async () => {
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <GamesList />
        </QueryClientProvider>
      );
      // wait for initial query
      await Promise.resolve();
    });

    const root = renderer.root;
    // initial state online
    let joinBtn = root.findByProps({ title: 'Join' });
    expect(joinBtn.props.disabled).toBe(false);

    // go offline
    act(() => setOnline(false));
    joinBtn = root.findByProps({ title: 'Join' });
    expect(joinBtn.props.disabled).toBe(true);
    const offlineMsg = root.findAll(
      (n) => n.type === 'Text' && n.props.children === "You’re offline. Join/Leave is disabled."
    );
    expect(offlineMsg.length).toBe(1);

    // back online
    act(() => setOnline(true));
    joinBtn = root.findByProps({ title: 'Join' });
    expect(joinBtn.props.disabled).toBe(false);
    const noBanner = root.findAll(
      (n) => n.type === 'Text' && n.props.children === "You’re offline. Join/Leave is disabled."
    );
    expect(noBanner.length).toBe(0);

    // join
    await act(async () => {
      joinBtn.props.onPress();
      await Promise.resolve();
    });
    expect(joinGame).toHaveBeenCalledWith('1');
    let leaveBtn = root.findByProps({ title: 'Leave' });

    // leave
    await act(async () => {
      leaveBtn.props.onPress();
      await Promise.resolve();
    });
    expect(leaveGame).toHaveBeenCalledWith('1');

    await act(async () => {
      renderer.unmount();
    });
  });
});
