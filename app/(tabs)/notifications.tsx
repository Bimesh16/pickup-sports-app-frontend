import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import NotificationsList from '@/src/features/notifications/components/NotificationsList';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <NotificationsList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});