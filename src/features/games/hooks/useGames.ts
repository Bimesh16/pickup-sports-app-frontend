import { useQuery } from '@tanstack/react-query';
import { fetchGames } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';
import type { Game } from '../types';

export function useGames() {
  const { refetch, dataUpdatedAt, ...query } = useQuery<Game[], unknown>({
    queryKey: ['games'],
    queryFn: fetchGames,
    retry: (failureCount: number, error: unknown) => queryRetry(failureCount, error as any),
  });

  return { ...query, refetch, dataUpdatedAt };
}
