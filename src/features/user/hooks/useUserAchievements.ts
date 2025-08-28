import { useQuery } from '@tanstack/react-query';
import { fetchUserAchievements, type UserAchievement } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';

export function useUserAchievements(username: string | undefined) {
  return useQuery<UserAchievement[], unknown>({
    queryKey: ['user', username, 'achievements'],
    queryFn: () => fetchUserAchievements(username!),
    enabled: !!username && username.trim().length > 0,
    retry: (failureCount, error) => queryRetry(failureCount, error as any),
    staleTime: 10 * 60 * 1000, // 10 minutes (achievements don't change often)
  });
}
