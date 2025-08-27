import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api, setTokens } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';
import { ToastProvider } from '@/src/components/ToastProvider';

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
