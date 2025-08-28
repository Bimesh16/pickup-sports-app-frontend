import { useEffect, useState } from 'react';
import { api, setTokens } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';

/**
 * Bootstraps the authenticated user session on app start.
 * - Fetches /auth/me to restore the user if a valid session exists
 * - Clears tokens and resets user if the session is invalid
 * - Exposes an isBootstrapping flag for gating initial UI
 */
export function useAuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const [isBootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/auth/me', { headers: { 'Cache-Control': 'no-store' } });
        if (!cancelled) {
          setUser(data);
          setError(null);
        }
      } catch (e: any) {
        // Clear tokens on bootstrap failure to avoid flapping
        try {
          await setTokens(null);
        } catch {
          // ignore
        }
        if (!cancelled) {
          setUser(null);
          setError(new Error(e?.response?.data?.message ?? e?.message ?? 'Session bootstrap failed'));
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  return { isBootstrapping, error };
}
