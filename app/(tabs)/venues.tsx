import React, { useState } from 'react';
import { StyleSheet, ScrollView, View as RNView, TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import VenuesList from '@/src/features/venues/components/VenuesList';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

export default function VenuesScreen() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  
  const popularSports = ['Football', 'Basketball', 'Tennis', 'Cricket', 'Badminton', 'Volleyball'];
  const popularAreas = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Dharan', 'Biratnagar'];
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>🏟️ Sports Venues</Text>
              <Text style={styles.heroSubtitle}>
                Discover the best places to play sports across Nepal
              </Text>
            </View>
            <Ionicons name="location" size={40} color={Colors.nepal.white} />
          </View>
        </View>
        
        {/* Quick Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚽ Popular Sports</Text>
          <Text style={styles.sectionSubtitle}>
            Filter venues by your favorite sports
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {popularSports.map((sport) => (
              <TouchableOpacity
                key={sport}
                style={[
                  styles.filterChip,
                  selectedSport === sport && styles.filterChipActive
                ]}
                onPress={() => setSelectedSport(selectedSport === sport ? null : sport)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedSport === sport && styles.filterChipTextActive
                ]}>
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Area Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Popular Areas</Text>
          <Text style={styles.sectionSubtitle}>
            Find venues near your preferred locations
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {popularAreas.map((area) => (
              <TouchableOpacity
                key={area}
                style={[
                  styles.filterChip,
                  selectedArea === area && styles.filterChipActive
                ]}
                onPress={() => setSelectedArea(selectedArea === area ? null : area)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedArea === area && styles.filterChipTextActive
                ]}>
                  {area}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Venues List */}
        <View style={styles.section}>
          <View style={styles.venuesHeader}>
            <Text style={styles.sectionTitle}>
              🏟️ Available Venues
              {selectedSport && (
                <Text style={styles.filterText}> for {selectedSport}</Text>
              )}
              {selectedArea && (
                <Text style={styles.filterText}> in {selectedArea}</Text>
              )}
            </Text>
            <View style={styles.venuesCount}>
              <Ionicons name="location" size={16} color={Colors.text.secondary} />
              <Text style={styles.countText}>Venues</Text>
            </View>
          </View>
          
          <VenuesList />
        </View>
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  content: {
    flex: 1,
  },
  
  heroSection: {
    backgroundColor: Colors.nepal.blue,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 20,
  },
  
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  heroLeft: {
    flex: 1,
  },
  
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.nepal.white,
    marginBottom: 4,
  },
  
  heroSubtitle: {
    fontSize: 16,
    color: Colors.nepal.white + 'CC',
    fontWeight: '500',
    lineHeight: 22,
  },
  
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  
  filtersContainer: {
    marginBottom: 8,
  },
  
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  
  filterChipActive: {
    backgroundColor: Colors.nepal.crimson,
    borderColor: Colors.nepal.crimson,
  },
  
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  
  filterChipTextActive: {
    color: Colors.nepal.white,
  },
  
  venuesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  filterText: {
    color: Colors.nepal.crimson,
    fontWeight: '600',
  },
  
  venuesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  
  countText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  
  bottomSpacing: {
    height: 20,
  },
});