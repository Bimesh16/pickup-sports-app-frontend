import { useMutation } from '@tanstack/react-query';
import { revokeSession } from '@/src/features/auth/api';
import { useAuthStore } from '@/src/stores/auth';

export function useRevokeSession() {
  const sessions = useAuthStore((s) => s.sessions);
  const setSessions = useAuthStore((s) => s.setSessions);

  return useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: (_data, id) => {
      setSessions(sessions.filter((s) => s.id !== id));
    },
  });
}
