import React, { useState } from 'react';
import { View, ActivityIndicator, ScrollView, RefreshControl, StyleSheet, View as RNView } from 'react-native';
import { Text } from '@/components/Themed';
import { Stack } from 'expo-router';
import { useStats } from '@/src/features/stats/hooks/useStats';
import { useAuthStore } from '@/src/stores/auth';
import { useUserStats } from '@/src/features/user/hooks/useUserStats';
import { useUserAchievements } from '@/src/features/user/hooks/useUserAchievements';
import UserStatsCard from '@/src/features/user/components/UserStatsCard';
import UserPreferencesCard from '@/src/features/user/components/UserPreferencesCard';

export default function StatsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((s) => s.user);
  
  // Fetch aggregate stats
  const { data: aggregateStats, isLoading: isLoadingAggregate, isError: isErrorAggregate, refetch: refetchAggregate } = useStats();
  
  // Fetch user stats if logged in
  const { data: userStats, isLoading: isLoadingUser, isError: isErrorUser, refetch: refetchUser } = useUserStats(user?.authenticated ? user.username : undefined);
  const { data: achievements, refetch: refetchAchievements } = useUserAchievements(user?.authenticated ? user.username : undefined);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchAggregate(),
        user ? refetchUser() : Promise.resolve(),
        user ? refetchAchievements() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Statistics & Analytics' }} />
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Aggregate Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Statistics</Text>
          
          {isLoadingAggregate && <ActivityIndicator style={styles.loader} />}
          {isErrorAggregate && <Text style={styles.errorText}>Failed to load platform stats</Text>}
          
          {aggregateStats && (
            <RNView style={styles.statsGrid}>
              {Object.entries(aggregateStats).map(([key, value]) => (
                <RNView key={key} style={styles.statCard}>
                  <Text style={styles.statValue}>{value.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                </RNView>
              ))}
            </RNView>
          )}
        </View>

        {/* User Stats Section (if logged in) */}
        {user && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Personal Statistics</Text>
              
              {isLoadingUser && <ActivityIndicator style={styles.loader} />}
              {isErrorUser && <Text style={styles.errorText}>Failed to load your stats</Text>}
              
              {userStats && (
                <>
                  <UserStatsCard stats={userStats} />
                  <UserPreferencesCard stats={userStats} />
                </>
              )}
            </View>

            {/* Achievements Summary */}
            {achievements && achievements.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Achievement Summary</Text>
                <RNView style={styles.achievementSummary}>
                  <RNView style={styles.achievementStat}>
                    <Text style={styles.achievementNumber}>{achievements.length}</Text>
                    <Text style={styles.achievementLabel}>Total Achievements</Text>
                  </RNView>
                  <RNView style={styles.achievementStat}>
                    <Text style={styles.achievementNumber}>
                      {achievements.filter(a => a.rarity === 'legendary').length}
                    </Text>
                    <Text style={styles.achievementLabel}>Legendary</Text>
                  </RNView>
                  <RNView style={styles.achievementStat}>
                    <Text style={styles.achievementNumber}>
                      {achievements.filter(a => a.rarity === 'epic').length}
                    </Text>
                    <Text style={styles.achievementLabel}>Epic</Text>
                  </RNView>
                </RNView>
              </View>
            )}
          </>
        )}

        {/* Not Logged In Message */}
        {!user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Statistics</Text>
            <RNView style={styles.loginPrompt}>
              <Text style={styles.loginText}>Sign in to view your personal statistics</Text>
              <Text style={styles.loginSubtext}>Track your games, achievements, and progress</Text>
            </RNView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937',
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6b7280',
    fontWeight: '500',
  },
  achievementSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
  },
  achievementStat: {
    alignItems: 'center',
  },
  achievementNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  achievementLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  loginPrompt: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  loginSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
