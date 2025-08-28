import { api } from '@/src/api/client';

export interface Notification {
  id: string;
  type: 'GAME_INVITATION' | 'BOOKING_CONFIRMATION' | 'AI_RECOMMENDATION' | 'GAME_REMINDER' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  data?: any;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

// Fetch user notifications
export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await api.get('/api/v1/notifications', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

// Mark notification as read
export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/api/v1/notifications/${id}/read`, null, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

// Register for push notifications
export async function registerPushToken(token: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
  await api.post('/api/v1/notifications/register', {
    token,
    platform
  }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

// Update notification preferences
export async function updateNotificationPreferences(preferences: {
  gameInvitations: boolean;
  bookingConfirmations: boolean;
  aiRecommendations: boolean;
  gameReminders: boolean;
  systemAlerts: boolean;
}): Promise<void> {
  await api.put('/api/v1/notifications/preferences', preferences, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

// Get notification preferences
export async function getNotificationPreferences(): Promise<{
  gameInvitations: boolean;
  bookingConfirmations: boolean;
  aiRecommendations: boolean;
  gameReminders: boolean;
  systemAlerts: boolean;
}> {
  const { data } = await api.get('/api/v1/notifications/preferences', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}