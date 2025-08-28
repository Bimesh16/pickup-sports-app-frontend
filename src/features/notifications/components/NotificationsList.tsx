import React from 'react';
import { 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useNotifications, useMarkNotificationRead } from '../hooks/useNotifications';
import { Notification } from '../api';
import EmptyState from '@/src/components/EmptyState';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'GAME_INVITATION': return '🎮';
      case 'BOOKING_CONFIRMATION': return '📅';
      case 'AI_RECOMMENDATION': return '🤖';
      case 'GAME_REMINDER': return '⏰';
      case 'SYSTEM_ALERT': return '⚠️';
      default: return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity 
      style={[styles.notificationItem, !notification.read && styles.unreadNotification]}
      onPress={onPress}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.typeIcon}>{getTypeIcon(notification.type)}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.time}>{formatDate(notification.createdAt)}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        {!notification.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsList() {
  const { data: notifications, isLoading, isError, error, refetch, isRefetching } = useNotifications();
  const markReadMutation = useMarkNotificationRead();

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    
    // Handle navigation based on notification type or actionUrl
    if (notification.actionUrl) {
      // Navigate to the specific URL
      console.log('Navigate to:', notification.actionUrl);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Failed to load notifications: {(error as any)?.message || 'Unknown error'}
        </Text>
      </View>
    );
  }

  const notificationsList = notifications || [];
  const unreadCount = notificationsList.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={notificationsList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem 
            notification={item} 
            onPress={() => handleNotificationPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No notifications"
            message="You're all caught up!"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  notificationContent: {
    padding: 16,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  message: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
  },
});