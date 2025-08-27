import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api, setTokens } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';
import { ToastProvider } from '@/src/components/ToastProvider';

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
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}
