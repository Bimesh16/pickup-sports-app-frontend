import React from 'react';
import { StyleSheet, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import type { UserAchievement } from '../types';

interface UserAchievementsCardProps {
  achievements: UserAchievement[];
}

export default function UserAchievementsCard({ achievements }: UserAchievementsCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#f59e0b';
      case 'epic': return '#8b5cf6';
      case 'rare': return '#3b82f6';
      case 'common': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'streak': return '🔥';
      case 'milestone': return '🎯';
      case 'social': return '🤝';
      case 'skill': return '⭐';
      case 'participation': return '🏃';
      default: return '🏆';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Achievements & Badges</Text>
      
      {achievements.length === 0 ? (
        <RNView style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyText}>No achievements yet</Text>
          <Text style={styles.emptySubtext}>Keep playing to earn badges!</Text>
        </RNView>
      ) : (
        <RNView style={styles.achievementsContainer}>
          {achievements.map((achievement) => (
            <RNView key={achievement.id} style={styles.achievementItem}>
              <RNView style={styles.achievementHeader}>
                <Text style={styles.achievementIcon}>{getAchievementIcon(achievement.type)}</Text>
                <RNView style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </RNView>
                <RNView style={[styles.rarityBadge, { backgroundColor: getRarityColor(achievement.rarity) }]}>
                  <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
                </RNView>
              </RNView>
              
              <RNView style={styles.achievementFooter}>
                <Text style={styles.earnedDate}>Earned {formatDate(achievement.earnedAt)}</Text>
                
                {achievement.progress && (
                  <RNView style={styles.progressContainer}>
                    <RNView style={styles.progressBar}>
                      <RNView 
                        style={[
                          styles.progressFill, 
                          { width: `${achievement.progress.percentage}%` }
                        ]} 
                      />
                    </RNView>
                    <Text style={styles.progressText}>
                      {achievement.progress.current}/{achievement.progress.required}
                    </Text>
                  </RNView>
                )}
              </RNView>
            </RNView>
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
  achievementsContainer: {
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
  achievementItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1f2937',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  achievementFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  earnedDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
});
