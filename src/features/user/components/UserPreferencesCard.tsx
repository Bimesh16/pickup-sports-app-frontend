import React from 'react';
import { StyleSheet, View as RNView, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import type { UserStats } from '../types';

interface UserPreferencesCardProps {
  stats: UserStats;
}

export default function UserPreferencesCard({ stats }: UserPreferencesCardProps) {
  const formatPercentage = (value: number) => `${Math.round(value)}%`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preferences & Favorites</Text>
      
      {/* Favorite Sports */}
      <RNView style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite Sports</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <RNView style={styles.chipsContainer}>
            {stats.favoriteSports?.map((sport, index) => (
              <RNView key={sport.sport} style={styles.chip}>
                <Text style={styles.chipText}>{sport.sport}</Text>
                <Text style={styles.chipSubtext}>{sport.count} games</Text>
                <Text style={styles.chipPercentage}>{formatPercentage(sport.percentage)}</Text>
              </RNView>
            )) || (
              <Text style={styles.emptyText}>No favorite sports yet</Text>
            )}
          </RNView>
        </ScrollView>
      </RNView>

      {/* Favorite Venues */}
      <RNView style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite Venues</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <RNView style={styles.chipsContainer}>
            {stats.favoriteVenues?.map((venue, index) => (
              <RNView key={venue.venueId} style={styles.chip}>
                <Text style={styles.chipText}>{venue.venueName}</Text>
                <Text style={styles.chipSubtext}>{venue.count} visits</Text>
                <Text style={styles.chipPercentage}>{formatPercentage(venue.percentage)}</Text>
              </RNView>
            )) || (
              <Text style={styles.emptyText}>No favorite venues yet</Text>
            )}
          </RNView>
        </ScrollView>
      </RNView>

      {/* Preferred Time Slots */}
      <RNView style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Times</Text>
        <RNView style={styles.timeSlotsContainer}>
          {stats.preferredTimeSlots?.map((timeSlot) => (
            <RNView key={timeSlot.timeSlot} style={styles.timeSlotItem}>
              <Text style={styles.timeSlotLabel}>{timeSlot.timeSlot}</Text>
              <Text style={styles.timeSlotCount}>{timeSlot.count} games</Text>
              <Text style={styles.timeSlotPercentage}>{formatPercentage(timeSlot.percentage)}</Text>
            </RNView>
          )) || (
            <Text style={styles.emptyText}>No preferred times yet</Text>
          )}
        </RNView>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  chipSubtext: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  chipPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  timeSlotsContainer: {
    gap: 8,
  },
  timeSlotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  timeSlotLabel: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
    flex: 1,
  },
  timeSlotCount: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 12,
  },
  timeSlotPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    minWidth: 40,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

