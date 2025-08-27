import { useQuery } from '@tanstack/react-query';
import { fetchGame } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';
import type { Game } from '../types';

export function useGame(id: string | undefined) {
  return useQuery<Game, unknown>({
    queryKey: ['game', id],
    queryFn: () => fetchGame(id as string),
    enabled: !!id,
    retry: (failureCount: number, error: unknown) => queryRetry(failureCount, error as any),
  });
}
