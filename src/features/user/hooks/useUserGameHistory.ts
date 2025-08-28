import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchUserGameHistory, type GameParticipation } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';

export function useUserGameHistory(username: string | undefined, pageSize = 20) {
  return useInfiniteQuery<{ content: GameParticipation[]; totalElements: number; totalPages: number }, unknown>({
    queryKey: ['user', username, 'game-history'],
    queryFn: ({ pageParam = 0 }) => fetchUserGameHistory(username!, pageParam, pageSize),
    enabled: !!username && username.trim().length > 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.totalPages > lastPage.content.length / pageSize) {
        return Math.floor(lastPage.content.length / pageSize);
      }
      return undefined;
    },
    retry: (failureCount, error) => queryRetry(failureCount, error as any),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
