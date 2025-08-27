import { api } from '@/src/api/client';

export type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await api.get('/notifications', { headers: { 'Cache-Control': 'no-store' } });
  return data as Notification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.put(`/notifications/${id}/read`, null, { headers: { 'Cache-Control': 'no-store' } });
}

export async function subscribeToPushNotifications(token: string): Promise<void> {
  await api.post('/notifications/subscribe', { token }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function unsubscribeFromPushNotifications(token: string): Promise<void> {
  await api.post('/notifications/unsubscribe', { token }, { headers: { 'Cache-Control': 'no-store' } });
}
