import { useQuery } from '@tanstack/react-query';
import { listSessions } from '@/src/features/auth/api';
import { useAuthStore } from '@/src/stores/auth';

export function useSessions() {
  const setSessions = useAuthStore((s) => s.setSessions);

  return useQuery({
    queryKey: ['sessions'],
    queryFn: listSessions,
    onSuccess: (sessions) => {
      setSessions(sessions);
    },
  });
}
