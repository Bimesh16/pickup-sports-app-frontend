import React, { useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setTokens } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';
import { ToastProvider } from '@/src/components/ToastProvider';

const persister = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  ? createSyncStoragePersister({ storage: window.localStorage })
  : createAsyncStoragePersister({ storage: AsyncStorage });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false;
        if (error?.status === 412) return false; // precondition failed -> surface
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error: any) => error?.status === 429 && failureCount < 2,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/auth/me', { headers: { 'Cache-Control': 'no-store' } });
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) {
          await setTokens(null);
          setUser(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const key = query.queryKey[0];
            return key === 'games' || key === 'game';
          },
        },
      }}
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </PersistQueryClientProvider>
  );
}
