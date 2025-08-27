import { useQuery } from '@tanstack/react-query';
import type { Participant } from '../types';
import { fetchWaitlist } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';

export function useWaitlist(gameId: string | undefined) {
  return useQuery<Participant[], unknown>({
    queryKey: ['game', gameId, 'waitlist'],
    queryFn: () => fetchWaitlist(gameId as string),
    enabled: !!gameId,
    retry: (failureCount: number, error: unknown) => queryRetry(failureCount, error as any),
  });
}

