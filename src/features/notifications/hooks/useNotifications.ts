import { useQuery } from '@tanstack/react-query';
import { fetchNotifications, Notification } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';

export function useNotifications() {
  return useQuery<Notification[], unknown>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    retry: (failureCount, error: unknown) => queryRetry(failureCount, error as any),
  });
}
