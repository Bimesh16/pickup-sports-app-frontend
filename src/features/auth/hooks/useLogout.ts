import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setTokens } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';

export function useLogout() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        await api.post('/api/v1/auth/logout', null, { headers: { 'Cache-Control': 'no-store' } });
      } catch {
        // Ignore network/backend errors; we still clear local state
      } finally {
        await setTokens(null);
      }
    },
    onSuccess: async () => {
      setUser(null);
      // Clear all React Query cache to ensure no stale authed data remains
      qc.clear();
    },
  });
}
