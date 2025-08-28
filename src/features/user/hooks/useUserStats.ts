import { useQuery } from '@tanstack/react-query';
import { fetchUserStats, type UserStats } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';

export function useUserStats(username: string | undefined) {
  return useQuery<UserStats, unknown>({
    queryKey: ['user', username, 'stats'],
    queryFn: () => fetchUserStats(username!),
    enabled: !!username && username.trim().length > 0,
    retry: (failureCount, error) => queryRetry(failureCount, error as any),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
