import { useMutation } from '@tanstack/react-query';
import { refresh } from '@/src/features/auth/api';
import { api } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';

export function useRefresh() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async () => {
      await refresh();
      const { data } = await api.get('/auth/me', { headers: { 'Cache-Control': 'no-store' } });
      return data;
    },
    onSuccess: (user) => {
      setUser(user);
    },
  });
}
