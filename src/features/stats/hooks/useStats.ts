import { useQuery } from '@tanstack/react-query';
import { fetchStats, Stats } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';

export function useStats() {
  return useQuery<Stats, unknown>({
    queryKey: ['stats'],
    queryFn: fetchStats,
    retry: (failureCount, error) => queryRetry(failureCount, error as any),
  });
}
