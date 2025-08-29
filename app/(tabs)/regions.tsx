import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NepalHeader } from '@/src/components/nepal/NepalHeader';
import { Card, GradientCard } from '@/src/components/ui/Card';
import { PrimaryButton } from '@/src/components/ui/Button';
import { NepalFlag } from '@/src/components/nepal/NepalFlag';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

/**
 * 🇳🇵 Nepal Regions Hub
 * Navigate between Himalaya, Pahad, and Terai regions
 */
export default function RegionsPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regions = [
    {
      id: 'himalaya',
      name: 'हिमालय',
      englishName: 'Himalaya',
      icon: '⛰️',
      elevation: '4,000m+',
      description: 'Mountain sports, trekking, mountaineering',
      sports: ['Trekking', 'Rock Climbing', 'Skiing', 'Mountaineering'],
      gradient: 'himalayan' as const,
      route: '/himalaya',
      climate: 'Alpine',
      population: '7%',
    },
    {
      id: 'pahad',
      name: 'पहाड',
      englishName: 'Pahad',
      icon: '🏞️',
      elevation: '610-4,000m',
      description: 'Hill sports, community games, cultural activities',
      sports: ['Football', 'Basketball', 'Tennis', 'Badminton'],
      gradient: 'everest' as const,
      route: '/pahad',
      climate: 'Temperate',
      population: '43%',
    },
    {
      id: 'terai',
      name: 'तराई',
      englishName: 'Terai',
      icon: '🌾',
      elevation: '60-610m',
      description: 'Plains sports, cricket, athletics, cycling',
      sports: ['Cricket', 'Football', 'Athletics', 'Cycling'],
      gradient: 'nepal' as const,
      route: '/terai',
      climate: 'Subtropical',
      population: '50%',
    },
  ];

  const handleRegionPress = (region: typeof regions[0]) => {
    setSelectedRegion(region.id);
    // Navigate to region page
    router.push(region.route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header is now handled by Stack navigation */}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <GradientCard gradient="nepal" style={styles.heroCard}>
          <NepalFlag size={60} style={styles.heroFlag} />
          <Text style={styles.heroTitle}>🇳🇵 नेपालका क्षेत्रहरू</Text>
          <Text style={styles.heroSubtitle}>NEPAL'S REGIONS</Text>
          <Text style={styles.heroDescription}>
            Explore sports across Nepal's three distinct geographical regions. 
            Each region offers unique sports culture and opportunities.
          </Text>
        </GradientCard>

        {/* Regions Grid */}
        <View style={styles.regionsContainer}>
          {regions.map((region, index) => (
            <TouchableOpacity 
              key={region.id}
              onPress={() => handleRegionPress(region)}
              style={styles.regionTouchable}
              activeOpacity={0.8}
            >
              <GradientCard 
                gradient={region.gradient} 
                style={[
                  styles.regionCard,
                  selectedRegion === region.id && styles.selectedRegion
                ]}
              >
                <View style={styles.regionHeader}>
                  <Text style={styles.regionIcon}>{region.icon}</Text>
                  <View style={styles.regionInfo}>
                    <Text style={styles.regionName}>{region.name}</Text>
                    <Text style={styles.regionEnglishName}>{region.englishName}</Text>
                  </View>
                  <View style={styles.regionStats}>
                    <Text style={styles.regionElevation}>{region.elevation}</Text>
                    <Text style={styles.regionPopulation}>{region.population} pop.</Text>
                  </View>
                </View>
                
                <Text style={styles.regionDescription}>{region.description}</Text>
                
                <View style={styles.regionMeta}>
                  <Text style={styles.regionClimate}>🌡️ {region.climate}</Text>
                </View>
                
                <View style={styles.sportsContainer}>
                  {region.sports.slice(0, 3).map((sport, idx) => (
                    <View key={idx} style={styles.sportTag}>
                      <Text style={styles.sportTagText}>{sport}</Text>
                    </View>
                  ))}
                  {region.sports.length > 3 && (
                    <Text style={styles.moreSports}>+{region.sports.length - 3} more</Text>
                  )}
                </View>
                
                <View style={styles.regionAction}>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color="rgba(255,255,255,0.8)" 
                  />
                </View>
              </GradientCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nepal Geography Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Nepal's Geography</Text>
          <Text style={styles.sectionSubtitle}>नेपालको भूगोल</Text>
          
          <View style={styles.geographyInfo}>
            <Text style={styles.geographyText}>
              Nepal's unique geography creates three distinct regions, each with its own sports culture:
            </Text>
            
            <View style={styles.geographyList}>
              <View style={styles.geographyItem}>
                <Text style={styles.geographyIcon}>⛰️</Text>
                <Text style={styles.geographyItemText}>
                  <Text style={styles.geographyBold}>Himalaya</Text> - Home to 8 of the world's 14 highest peaks
                </Text>
              </View>
              
              <View style={styles.geographyItem}>
                <Text style={styles.geographyIcon}>🏞️</Text>
                <Text style={styles.geographyItemText}>
                  <Text style={styles.geographyBold}>Pahad</Text> - Cultural heartland with diverse communities
                </Text>
              </View>
              
              <View style={styles.geographyItem}>
                <Text style={styles.geographyIcon}>🌾</Text>
                <Text style={styles.geographyItemText}>
                  <Text style={styles.geographyBold}>Terai</Text> - Fertile plains supporting 50% of population
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <PrimaryButton 
              title="Find Nearby Games" 
              onPress={() => router.push('/(tabs)/')}
              style={styles.actionButton}
            />
            <PrimaryButton 
              title="Create New Game" 
              onPress={() => router.push('/(tabs)/two')}
              style={styles.actionButton}
            />
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
  
  heroFlag: {
    marginBottom: Theme.spacing[4],
  },
  
  heroTitle: {
    fontSize: Theme.typography.fontSize['4xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.nepal.white,
    textAlign: 'center',
    marginBottom: Theme.spacing[1],
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
  
  regionsContainer: {
    margin: Theme.spacing[4],
    gap: Theme.spacing[4],
  },
  
  regionTouchable: {
    borderRadius: Theme.borderRadius['2xl'],
  },
  
  regionCard: {
    padding: Theme.spacing[5],
    position: 'relative',
  },
  
  selectedRegion: {
    transform: [{ scale: 0.98 }],
  },
  
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing[3],
  },
  
  regionIcon: {
    fontSize: 32,
    marginRight: Theme.spacing[3],
  },
  
  regionInfo: {
    flex: 1,
  },
  
  regionName: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.nepal.white,
    marginBottom: Theme.spacing[1],
  },
  
  regionEnglishName: {
    fontSize: Theme.typography.fontSize.lg,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: Theme.typography.fontWeight.medium,
  },
  
  regionStats: {
    alignItems: 'flex-end',
  },
  
  regionElevation: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  
  regionPopulation: {
    fontSize: Theme.typography.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  
  regionDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Theme.spacing[3],
    lineHeight: 22,
  },
  
  regionMeta: {
    marginBottom: Theme.spacing[3],
  },
  
  regionClimate: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: Theme.typography.fontWeight.medium,
  },
  
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing[2],
    marginBottom: Theme.spacing[3],
  },
  
  sportTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Theme.spacing[3],
    paddingVertical: Theme.spacing[1],
    borderRadius: Theme.borderRadius.full,
  },
  
  sportTagText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Colors.nepal.white,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  
  moreSports: {
    fontSize: Theme.typography.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
  },
  
  regionAction: {
    position: 'absolute',
    top: Theme.spacing[5],
    right: Theme.spacing[5],
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
  
  geographyInfo: {
    gap: Theme.spacing[4],
  },
  
  geographyText: {
    fontSize: Theme.typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  
  geographyList: {
    gap: Theme.spacing[3],
  },
  
  geographyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing[3],
  },
  
  geographyIcon: {
    fontSize: 24,
  },
  
  geographyItemText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  
  geographyBold: {
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  
  quickActions: {
    gap: Theme.spacing[3],
  },
  
  actionButton: {
    width: '100%',
  },
});
