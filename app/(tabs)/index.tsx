import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text } from '@/components/Themed';
import GamesList from '@/src/features/games/components/GamesList';
import RecommendationsCard from '@/src/features/ai/components/RecommendationsCard';
import { useAuthStore } from '@/src/stores/auth';

export default function GamesScreen() {
  const user = useAuthStore((s) => s.user);
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {user && (
          <Text style={styles.welcomeText}>
            Welcome back, {user.displayName || user.firstName || user.username}! 👋
          </Text>
        )}
        
        <RecommendationsCard />
        
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>🎮 Available Games</Text>
          <GamesList initialShowJoined={false} allowToggle />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  gamesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
});
