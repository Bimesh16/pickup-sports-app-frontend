import { useQuery } from '@tanstack/react-query';
import { fetchUserSocialConnections, type SocialConnection } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';

export function useUserSocialConnections(username: string | undefined) {
  return useQuery<SocialConnection[], unknown>({
    queryKey: ['user', username, 'social-connections'],
    queryFn: () => fetchUserSocialConnections(username!),
    enabled: !!username && username.trim().length > 0,
    retry: (failureCount, error) => queryRetry(failureCount, error as any),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
