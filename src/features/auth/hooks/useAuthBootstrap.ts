import { useEffect, useState } from 'react';
import { api, setTokens, getRefreshToken } from '@/src/api/client';
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
        // Check if we have a refresh token before attempting to restore session
        const refreshToken = await getRefreshToken();
        
        if (!refreshToken) {
          // No existing session, just set bootstrapping to false
          if (!cancelled) {
            setUser(null);
            setBootstrapping(false);
          }
          return;
        }

        // Try to restore the session
        const { data } = await api.get('/api/v1/auth/me', { headers: { 'Cache-Control': 'no-store' } });
        if (!cancelled) {
          // Ensure the user object has the required structure
          const userData = {
            ...data,
            authenticated: true, // Always set this to true for restored sessions
          };
          setUser(userData);
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
