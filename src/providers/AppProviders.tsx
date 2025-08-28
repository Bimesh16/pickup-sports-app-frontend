import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastProvider } from '@/src/components/ToastProvider';
import { View } from '@/components/Themed';
import { setupAuthInterceptors } from '@/src/features/auth/interceptors';
import { useAuthBootstrap } from '@/src/features/auth/hooks/useAuthBootstrap';
import { useKeepAlive } from '@/src/features/auth/hooks/useKeepAlive';

// Initialize Sentry if available. We dynamically require the SDK so that the
// application still works in environments where the dependency is not
// installed (e.g. tests).
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Sentry: any = require('@sentry/react-native');
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
} catch {
  // ignore – Sentry is optional for local development/tests
}

const persister =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
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
  // Install auth interceptors once
  useEffect(() => {
    setupAuthInterceptors();
  }, []);

  // Bootstrap the session before rendering the rest of the app
  const { isBootstrapping } = useAuthBootstrap();
  // Keep server session warm while authenticated
  useKeepAlive();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // Bump this when query shapes change to invalidate old persisted cache
        buster: 'v2',
        // Do not restore very old caches
        maxAge: 10 * 60 * 1000, // 10 minutes
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const key = query.queryKey[0];
            // Persist only successful queries for the games list/details
            return (
              query.state.status === 'success' &&
              (key === 'games' || key === 'game')
            );
          },
        },
      }}
    >
      <ToastProvider>
        {isBootstrapping ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : (
          children
        )}
      </ToastProvider>
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
