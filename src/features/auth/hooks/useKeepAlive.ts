import { useEffect, useRef } from 'react';
import { api } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';

/**
 * Keeps the server session warm by pinging /auth/keepalive at a fixed interval
 * while the user is authenticated. Automatically stops when user logs out.
 */
export function useKeepAlive(intervalMs = 10 * 60 * 1000) {
  const user = useAuthStore((s) => s.user);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear any running interval whenever auth state changes
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Only start the keep-alive loop when authenticated
    if (user) {
      // Fire one warm-up request immediately (non-blocking)
      void api
        .get('/api/v1/auth/keepalive', { headers: { 'Cache-Control': 'no-store' } })
        .catch(() => {
          // ignore failures; this is best-effort
        });

      timerRef.current = setInterval(() => {
        void api
          .get('/api/v1/auth/keepalive', { headers: { 'Cache-Control': 'no-store' } })
          .catch(() => {
            // ignore
          });
      }, intervalMs);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [user, intervalMs]);
}
