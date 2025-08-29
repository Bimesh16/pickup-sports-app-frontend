import { useMutation } from '@tanstack/react-query';
import { verifyMfa } from '@/src/features/auth/api';
import { api } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';

export function useVerifyMfa() {
  const setUser = useAuthStore((s) => s.setUser);
  const setMfaEnabled = useAuthStore((s) => s.setMfaEnabled);

  return useMutation({
    mutationFn: async (body: { username: string; code: string; rememberDevice?: boolean }) => {
      await verifyMfa(body);
              const { data } = await api.get('/auth/me', { headers: { 'Cache-Control': 'no-store' } });
      return data;
    },
    onSuccess: (user) => {
      setUser(user);
      setMfaEnabled(true);
    },
  });
}
