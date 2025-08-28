import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useComprehensiveRecommendations } from '../hooks/useRecommendations';
import { useRecommendationFeedback } from '../hooks/useRecommendations';
import { GameRecommendation, PlayerRecommendation, VenueRecommendation } from '@/src/types/api';
import { useAuthStore } from '@/src/stores/auth';

interface RecommendationItemProps {
  title: string;
  subtitle: string;
  score: number;
  reasons: string[];
  onLike?: () => void;
  onDislike?: () => void;
}

function RecommendationItem({ title, subtitle, score, reasons, onLike, onDislike }: RecommendationItemProps) {
  return (
    <View style={styles.recommendationItem}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{Math.round(score * 100)}%</Text>
        </View>
      </View>
      
      <View style={styles.reasonsContainer}>
        <Text style={styles.reasonsTitle}>Why recommended:</Text>
        {reasons.map((reason, index) => (
          <Text key={index} style={styles.reason}>• {reason}</Text>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.likeButton} onPress={onLike}>
          <Text style={styles.buttonText}>👍 Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dislikeButton} onPress={onDislike}>
          <Text style={styles.buttonText}>👎 Not for me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RecommendationsCard() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useComprehensiveRecommendations(user?.authenticated ? user.id : undefined);
  const feedbackMutation = useRecommendationFeedback();

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Recommendations</Text>
        <Text style={styles.loadingText}>Loading personalized recommendations...</Text>
      </View>
    );
  }

  if (!user?.authenticated) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Recommendations</Text>
        <Text style={styles.errorText}>Sign in to get personalized recommendations</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Recommendations</Text>
        <Text style={styles.errorText}>Unable to load recommendations</Text>
      </View>
    );
  }

  const handleFeedback = (
    type: 'GAME' | 'PLAYER' | 'VENUE',
    itemId: number,
    isPositive: boolean
  ) => {
    feedbackMutation.mutate({
      recommendationType: type,
      recommendedItemId: itemId,
      feedback: isPositive ? 'POSITIVE' : 'NEGATIVE',
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>AI Recommendations</Text>
      
      <View style={styles.recommendationsContainer}>
        {/* Game Recommendations */}
        {data.gameRecommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎮 Recommended Games</Text>
            {data.gameRecommendations.slice(0, 2).map((rec) => (
              <RecommendationItem
                key={rec.game.id}
                title={rec.game.sport || 'Sports Game'}
                subtitle={`${rec.game.venue.name} • ${new Date(rec.game.time).toLocaleDateString()}`}
                score={rec.score}
                reasons={rec.reasons}
                onLike={() => handleFeedback('GAME', rec.game.id, true)}
                onDislike={() => handleFeedback('GAME', rec.game.id, false)}
              />
            ))}
          </View>
        )}

        {/* Player Recommendations */}
        {data.playerRecommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Suggested Players</Text>
            {data.playerRecommendations.slice(0, 2).map((rec) => (
              <RecommendationItem
                key={rec.player.id}
                title={`${rec.player.firstName} ${rec.player.lastName}`}
                subtitle={`${rec.player.skillLevel} • @${rec.player.username}`}
                score={rec.score}
                reasons={rec.reasons}
                onLike={() => handleFeedback('PLAYER', rec.player.id, true)}
                onDislike={() => handleFeedback('PLAYER', rec.player.id, false)}
              />
            ))}
          </View>
        )}

        {/* Venue Recommendations */}
        {data.venueRecommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏟️ Recommended Venues</Text>
            {data.venueRecommendations.slice(0, 2).map((rec) => (
              <RecommendationItem
                key={rec.venue.id}
                title={rec.venue.name}
                subtitle={`${rec.venue.city} • ${rec.venue.sports.join(', ')}`}
                score={rec.score}
                reasons={rec.reasons}
                onLike={() => handleFeedback('VENUE', rec.venue.id, true)}
                onDislike={() => handleFeedback('VENUE', rec.venue.id, false)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  recommendationsContainer: {
    gap: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  recommendationItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scoreContainer: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  score: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  reasonsContainer: {
    marginBottom: 12,
  },
  reasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  reason: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  likeButton: {
    backgroundColor: '#28a745',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
  },
  dislikeButton: {
    backgroundColor: '#dc3545',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
  },
  buttonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
    padding: 20,
  },
});