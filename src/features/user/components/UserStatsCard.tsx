import React from 'react';
import { StyleSheet, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import type { UserStats } from '../types';

interface UserStatsCardProps {
  stats: UserStats;
}

export default function UserStatsCard({ stats }: UserStatsCardProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPercentage = (value: number) => `${Math.round(value)}%`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Overview</Text>
      
      <RNView style={styles.statsGrid}>
        <RNView style={styles.statItem}>
          <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
          <Text style={styles.statLabel}>Games Played</Text>
        </RNView>
        
        <RNView style={styles.statItem}>
          <Text style={styles.statValue}>{stats.gamesCreated}</Text>
          <Text style={styles.statLabel}>Games Created</Text>
        </RNView>
        
        <RNView style={styles.statItem}>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Week Streak</Text>
        </RNView>
        
        <RNView style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(stats.totalPlayTime)}</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </RNView>
      </RNView>

      <RNView style={styles.detailRow}>
        <Text style={styles.detailLabel}>Attendance Rate:</Text>
        <Text style={styles.detailValue}>{formatPercentage(stats.attendanceRate)}</Text>
      </RNView>
      
      <RNView style={styles.detailRow}>
        <Text style={styles.detailLabel}>Avg Game Duration:</Text>
        <Text style={styles.detailValue}>{formatTime(stats.averageGameDuration)}</Text>
      </RNView>
      
      <RNView style={styles.detailRow}>
        <Text style={styles.detailLabel}>Longest Streak:</Text>
        <Text style={styles.detailValue}>{stats.longestStreak} weeks</Text>
      </RNView>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
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
    opacity: 0.7,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

