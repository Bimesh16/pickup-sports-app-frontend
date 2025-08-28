import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchNotifications, 
  markNotificationRead, 
  updateNotificationPreferences,
  getNotificationPreferences,
  registerPushToken
} from '../api';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    staleTime: 10 * 1000, // Consider stale after 10 seconds
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: getNotificationPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
}

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: ({ token, platform }: { token: string; platform: 'ios' | 'android' | 'web' }) =>
      registerPushToken(token, platform),
  });
}