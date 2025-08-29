import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { EverestGradient } from '@/src/components/ui/GradientBackground';
import { Card, GradientCard } from '@/src/components/ui/Card';
import { PrimaryButton, SecondaryButton } from '@/src/components/ui/Button';
import { SportBadge } from '@/src/components/icons/SportIcons';
import { NepalHeader } from '@/src/components/nepal/NepalHeader';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

/**
 * 🏞️ Pahad Region Page
 * Hill sports and mid-altitude activities
 */
export default function PahadPage() {
  const hillSports = [
    { name: 'Football', description: 'Popular in hill communities', players: '11v11' },
    { name: 'Basketball', description: 'Court games in towns', players: '5v5' },
    { name: 'Tennis', description: 'Club and school courts', players: '1v1, 2v2' },
    { name: 'Badminton', description: 'Indoor hill sports', players: '1v1, 2v2' },
    { name: 'Volleyball', description: 'Community gatherings', players: '6v6' },
    { name: 'Running', description: 'Hill trail running', players: 'Groups' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header is now handled by Stack navigation */}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <GradientCard gradient="everest" style={styles.heroCard}>
          <Text style={styles.heroTitle}>🏞️ पहाडी क्षेत्र</Text>
          <Text style={styles.heroSubtitle}>PAHAD REGION</Text>
          <Text style={styles.heroDescription}>
            Discover sports in Nepal's beautiful hill region. From Pokhara's lakeside courts 
            to Bandipur's traditional grounds, find your perfect game in the hills.
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
          <Text style={styles.sectionTitle}>Hill Sports</Text>
          <Text style={styles.sectionSubtitle}>पहाडी खेलहरू</Text>
          
          <View style={styles.sportsGrid}>
            {hillSports.map((sport, index) => (
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
                    <Text style={styles.sportPlayers}>👥 {sport.players}</Text>
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
    color: Colors.nepal.crimson,
    textAlign: 'center',
    marginBottom: Theme.spacing[2],
  },
  
  heroSubtitle: {
    fontSize: Theme.typography.fontSize.lg,
    color: Colors.nepal.blue,
    fontWeight: Theme.typography.fontWeight.semibold,
    letterSpacing: 2,
    marginBottom: Theme.spacing[4],
  },
  
  heroDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: Colors.text.primary,
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
  
  sportPlayers: {
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
