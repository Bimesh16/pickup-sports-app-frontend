import React from 'react';
import { StyleSheet, View as RNView, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import Avatar from '@/src/components/Avatar';
import type { SocialConnection } from '../types';

interface UserSocialConnectionsCardProps {
  connections: SocialConnection[];
}

export default function UserSocialConnectionsCard({ connections }: UserSocialConnectionsCardProps) {
  const getConnectionStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'weak': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getConnectionStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'strong': return '💪';
      case 'medium': return '🤝';
      case 'weak': return '👋';
      default: return '👋';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const sortedConnections = [...connections].sort((a, b) => b.gamesPlayedTogether - a.gamesPlayedTogether);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social Connections</Text>
      
      {connections.length === 0 ? (
        <RNView style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤝</Text>
          <Text style={styles.emptyText}>No connections yet</Text>
          <Text style={styles.emptySubtext}>Join more games to meet players!</Text>
        </RNView>
      ) : (
        <RNView style={styles.connectionsContainer}>
          {sortedConnections.map((connection) => (
            <Pressable key={connection.username} style={styles.connectionItem}>
              <RNView style={styles.connectionHeader}>
                <Avatar 
                  name={connection.displayName || connection.username} 
                  uri={connection.avatarUrl ?? undefined} 
                  size={48} 
                />
                <RNView style={styles.connectionInfo}>
                  <Text style={styles.connectionName}>
                    {connection.displayName || connection.username}
                  </Text>
                  <Text style={styles.connectionStats}>
                    {connection.gamesPlayedTogether} games together
                  </Text>
                  <Text style={styles.connectionSports}>
                    {connection.favoriteSports.slice(0, 3).join(', ')}
                  </Text>
                </RNView>
                <RNView style={styles.connectionStrength}>
                  <Text style={styles.strengthIcon}>
                    {getConnectionStrengthIcon(connection.connectionStrength)}
                  </Text>
                  <Text style={[
                    styles.strengthText, 
                    { color: getConnectionStrengthColor(connection.connectionStrength) }
                  ]}>
                    {connection.connectionStrength}
                  </Text>
                </RNView>
              </RNView>
              
              <RNView style={styles.connectionFooter}>
                <Text style={styles.lastPlayed}>
                  Last played: {formatDate(connection.lastPlayedAt)}
                </Text>
                <Text style={styles.skillLevel}>
                  Skill: {connection.skillLevel}
                </Text>
              </RNView>
            </Pressable>
          ))}
        </RNView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectionsContainer: {
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
  },
  connectionItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  connectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1f2937',
  },
  connectionStats: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginBottom: 4,
  },
  connectionSports: {
    fontSize: 12,
    color: '#6b7280',
  },
  connectionStrength: {
    alignItems: 'center',
    marginLeft: 8,
  },
  strengthIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  strengthText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  connectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  lastPlayed: {
    fontSize: 12,
    color: '#6b7280',
  },
  skillLevel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});
