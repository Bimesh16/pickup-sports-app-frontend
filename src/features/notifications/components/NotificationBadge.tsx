import React from 'react';
import { Text, View } from '@/components/Themed';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationBadge() {
  const { data } = useNotifications();
  const count = (data ?? []).filter((n) => !n.read).length;
  if (count === 0) return null;
  return (
    <View style={{ backgroundColor: 'red', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
      <Text style={{ color: 'white', fontSize: 12 }}>{count}</Text>
    </View>
  );
}
