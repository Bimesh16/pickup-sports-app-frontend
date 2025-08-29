import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { HimalayanGradient } from '@/src/components/ui/GradientBackground';
import { Card, GradientCard } from '@/src/components/ui/Card';
import { PrimaryButton } from '@/src/components/ui/Button';
import { SportBadge } from '@/src/components/icons/SportIcons';
import { NepalHeader } from '@/src/components/nepal/NepalHeader';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

/**
 * 🏔️ Himalaya Region Page
 * Mountain sports and high-altitude activities
 * Perfect for trekking, mountaineering, rock climbing
 */
export default function HimalayaPage() {
  const mountainSports = [
    { name: 'Trekking', icon: 'walk-outline', description: 'Himalayan trail adventures' },
    { name: 'Rock Climbing', icon: 'fitness-outline', description: 'Scale the mountain walls' },
    { name: 'Mountaineering', icon: 'triangle-outline', description: 'Conquer the peaks' },
    { name: 'Skiing', icon: 'snow-outline', description: 'Winter mountain sports' },
    { name: 'Mountain Biking', icon: 'bicycle-outline', description: 'Trail cycling adventures' },
    { name: 'Paragliding', icon: 'airplane-outline', description: 'Soar above the valleys' },
  ];

  const popularDestinations = [
    { name: 'Everest Base Camp', elevation: '5,364m', difficulty: 'Expert' },
    { name: 'Annapurna Circuit', elevation: '5,416m', difficulty: 'Advanced' },
    { name: 'Langtang Valley', elevation: '3,800m', difficulty: 'Intermediate' },
    { name: 'Manaslu Circuit', elevation: '5,106m', difficulty: 'Advanced' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header is now handled by Stack navigation */}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <GradientCard gradient="himalayan" style={styles.heroCard}>
          <Text style={styles.heroTitle}>🏔️ हिमालय क्षेत्र</Text>
          <Text style={styles.heroSubtitle}>HIMALAYA REGION</Text>
          <Text style={styles.heroDescription}>
            Experience the world's highest peaks and most challenging mountain sports. 
            From Everest to Annapurna, find your mountain adventure.
          </Text>
          
          {/* Navigation back to regions */}
          <View style={styles.navigationSection}>
            <PrimaryButton 
              title="← Back to Regions" 
              size="small" 
              variant="outline"
              onPress={() => router.push('/(tabs)/regions')}
              style={styles.backButton}
            />
          </View>
        </GradientCard>

        {/* Mountain Sports */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Mountain Sports</Text>
          <Text style={styles.sectionSubtitle}>पर्वतीय खेलहरू</Text>
          
          <View style={styles.sportsGrid}>
            {mountainSports.map((sport, index) => (
              <Card key={index} style={styles.sportCard}>
                <View style={styles.sportHeader}>
                  <SportBadge sport={sport.name.toLowerCase()} size="medium" variant="filled" />
                  <View style={styles.sportInfo}>
                    <Text style={styles.sportName}>{sport.name}</Text>
                    <Text style={styles.sportDescription}>{sport.description}</Text>
                  </View>
                </View>
                <PrimaryButton 
                  title="Find Games" 
                  size="small" 
                  onPress={() => {}}
                />
              </Card>
            ))}
          </View>
        </Card>

        {/* Popular Destinations */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <Text style={styles.sectionSubtitle}>लोकप्रिय गन्तव्यहरू</Text>
          
          {popularDestinations.map((destination, index) => (
            <Card key={index} style={styles.destinationCard}>
              <View style={styles.destinationHeader}>
                <Text style={styles.destinationName}>{destination.name}</Text>
                <View style={styles.destinationMeta}>
                  <Text style={styles.elevation}>🏔️ {destination.elevation}</Text>
                  <Text style={[
                    styles.difficulty,
                    { 
                      color: destination.difficulty === 'Expert' ? Colors.error[500] :
                             destination.difficulty === 'Advanced' ? Colors.warning[500] :
                             Colors.success[500]
                    }
                  ]}>
                    {destination.difficulty}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </Card>
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
  
  section: {
    margin: Theme.spacing[4],
  },
  
  heroCard: {
    margin: Theme.spacing[4],
    alignItems: 'center',
    padding: Theme.spacing[6],
  },
  
  heroTitle: {
    fontSize: Theme.typography.fontSize['4xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.nepal.white,
    textAlign: 'center',
    marginBottom: Theme.spacing[2],
  },
  
  heroSubtitle: {
    fontSize: Theme.typography.fontSize.lg,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: Theme.typography.fontWeight.semibold,
    letterSpacing: 2,
    marginBottom: Theme.spacing[4],
  },
  
  heroDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  sectionTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Theme.spacing[1],
  },
  
  sectionSubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Colors.nepal.blue,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing[4],
  },
  
  sportsGrid: {
    gap: Theme.spacing[3],
  },
  
  sportCard: {
    padding: Theme.spacing[4],
  },
  
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing[3],
    marginBottom: Theme.spacing[3],
  },
  
  sportInfo: {
    flex: 1,
  },
  
  sportName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  
  sportDescription: {
    fontSize: Theme.typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  
  destinationCard: {
    marginBottom: Theme.spacing[3],
    padding: Theme.spacing[4],
  },
  
  destinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  destinationName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
  },
  
  destinationMeta: {
    alignItems: 'flex-end',
    gap: Theme.spacing[1],
  },
  
  elevation: {
    fontSize: Theme.typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  
  difficulty: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  navigationSection: {
    marginTop: Theme.spacing[4],
    alignItems: 'center',
  },
  
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
  },
});
