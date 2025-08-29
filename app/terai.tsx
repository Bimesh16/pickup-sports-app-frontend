import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { NepalGradient } from '@/src/components/ui/GradientBackground';
import { Card, GradientCard } from '@/src/components/ui/Card';
import { PrimaryButton } from '@/src/components/ui/Button';
import { SportBadge } from '@/src/components/icons/SportIcons';
import { NepalHeader } from '@/src/components/nepal/NepalHeader';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

/**
 * 🌾 Terai Region Page
 * Plains sports and lowland activities
 */
export default function TeraiPage() {
  const plainsSports = [
    { name: 'Cricket', description: 'Most popular in Terai', season: 'Year-round' },
    { name: 'Football', description: 'Large field games', season: 'Oct-Mar' },
    { name: 'Athletics', description: 'Track and field events', season: 'Winter' },
    { name: 'Cycling', description: 'Flat terrain cycling', season: 'Year-round' },
    { name: 'Kabaddi', description: 'Traditional Terai sport', season: 'Festival times' },
    { name: 'Wrestling', description: 'Traditional kushti', season: 'Winter' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header is now handled by Stack navigation */}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <GradientCard gradient="nepal" style={styles.heroCard}>
          <Text style={styles.heroTitle}>🌾 तराई क्षेत्र</Text>
          <Text style={styles.heroSubtitle}>TERAI REGION</Text>
          <Text style={styles.heroDescription}>
            Nepal's fertile plains region - home to cricket, football, and traditional sports. 
            Where the majority of Nepal's population enjoys year-round outdoor activities.
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

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Plains Sports</Text>
          <Text style={styles.sectionSubtitle}>मैदानी खेलहरू</Text>
          
          <View style={styles.sportsGrid}>
            {plainsSports.map((sport, index) => (
              <Card key={index} style={styles.sportCard}>
                <View style={styles.sportHeader}>
                  <SportBadge 
                    sport={sport.name.toLowerCase()} 
                    size="medium" 
                    variant="filled" 
                  />
                  <View style={styles.sportInfo}>
                    <Text style={styles.sportName}>{sport.name}</Text>
                    <Text style={styles.sportDescription}>{sport.description}</Text>
                    <Text style={styles.sportSeason}>🗓️ {sport.season}</Text>
                  </View>
                </View>
                <PrimaryButton 
                  title="Join Games" 
                  size="small" 
                  onPress={() => {}}
                />
              </Card>
            ))}
          </View>
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
    color: 'rgba(255,255,255,0.9)',
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
  
  sportSeason: {
    fontSize: Theme.typography.fontSize.xs,
    color: Colors.nepal.blue,
    fontWeight: Theme.typography.fontWeight.medium,
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
