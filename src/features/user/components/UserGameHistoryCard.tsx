import React from 'react';
import { StyleSheet, View as RNView, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import type { GameParticipation } from '../types';

interface UserGameHistoryCardProps {
  gameHistory: GameParticipation[];
  onGamePress?: (gameId: string) => void;
}

export default function UserGameHistoryCard({ gameHistory, onGamePress }: UserGameHistoryCardProps) {
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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'joined': return '#3b82f6';
      case 'created': return '#8b5cf6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'joined': return '🎯';
      case 'created': return '🎮';
      case 'cancelled': return '❌';
      default: return '⏳';
    }
  };

  const getOutcomeIcon = (outcome?: string) => {
    switch (outcome) {
      case 'win': return '🏆';
      case 'loss': return '😔';
      case 'draw': return '🤝';
      case 'cancelled': return '🚫';
      default: return '—';
    }
  };

  const sortedHistory = [...gameHistory].sort((a, b) => 
    new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Game History</Text>
      
      {gameHistory.length === 0 ? (
        <RNView style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎮</Text>
          <Text style={styles.emptyText}>No games yet</Text>
          <Text style={styles.emptySubtext}>Join your first game to get started!</Text>
        </RNView>
      ) : (
        <RNView style={styles.gamesContainer}>
          {sortedHistory.slice(0, 10).map((game) => (
            <Pressable 
              key={game.id} 
              style={styles.gameItem}
              onPress={() => onGamePress?.(game.gameId)}
            >
              <RNView style={styles.gameHeader}>
                <RNView style={styles.gameInfo}>
                  <Text style={styles.gameTitle} numberOfLines={1}>
                    {game.gameTitle}
                  </Text>
                  <Text style={styles.gameDetails}>
                    {game.sport} • {game.venueName}
                  </Text>
                  <Text style={styles.gameTime}>
                    {formatDate(game.startsAt)} • {formatTime(game.duration)}
                  </Text>
                </RNView>
                
                <RNView style={styles.gameStatus}>
                  <Text style={styles.statusIcon}>
                    {getStatusIcon(game.status)}
                  </Text>
                  <Text style={[
                    styles.statusText, 
                    { color: getStatusColor(game.status) }
                  ]}>
                    {game.status}
                  </Text>
                </RNView>
              </RNView>
              
              <RNView style={styles.gameFooter}>
                <RNView style={styles.gameStats}>
                  <Text style={styles.participantsText}>
                    {game.participantsCount}/{game.maxParticipants} players
                  </Text>
                  <Text style={styles.skillLevelText}>
                    Skill: {game.skillLevel}
                  </Text>
                </RNView>
                
                <RNView style={styles.gameOutcome}>
                  {game.outcome && (
                    <Text style={styles.outcomeIcon}>
                      {getOutcomeIcon(game.outcome)}
                    </Text>
                  )}
                  {game.rating && (
                    <Text style={styles.ratingText}>
                      ⭐ {game.rating}/5
                    </Text>
                  )}
                </RNView>
              </RNView>
            </Pressable>
          ))}
          
          {gameHistory.length > 10 && (
            <RNView style={styles.moreGames}>
              <Text style={styles.moreGamesText}>
                +{gameHistory.length - 10} more games
              </Text>
            </RNView>
          )}
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
  gamesContainer: {
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
  gameItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gameInfo: {
    flex: 1,
    marginRight: 12,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1f2937',
  },
  gameDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  gameTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  gameStatus: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  gameStats: {
    flex: 1,
  },
  participantsText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  skillLevelText: {
    fontSize: 12,
    color: '#6b7280',
  },
  gameOutcome: {
    alignItems: 'flex-end',
    gap: 4,
  },
  outcomeIcon: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  moreGames: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  moreGamesText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
