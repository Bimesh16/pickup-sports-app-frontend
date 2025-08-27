import { useMutation } from '@tanstack/react-query';
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '../api';

export function usePushNotifications() {
  const subscribe = useMutation({
    mutationFn: (token: string) => subscribeToPushNotifications(token),
  });
  const unsubscribe = useMutation({
    mutationFn: (token: string) => unsubscribeFromPushNotifications(token),
  });
  return { subscribe, unsubscribe };
}
