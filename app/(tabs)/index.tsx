import React, { useState } from 'react';
import { StyleSheet, ScrollView, View as RNView } from 'react-native';
import { View, Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GamesList from '@/src/features/games/components/GamesList';
import RecommendationsCard from '@/src/features/ai/components/RecommendationsCard';
import { RegionSelector } from '@/src/components/nepal/RegionSelector';
import { NepalFlag } from '@/src/components/nepal/NepalFlag';
import { useAuthStore } from '@/src/stores/auth';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

export default function GamesScreen() {
  const user = useAuthStore((s) => s.user);
  const [selectedRegion, setSelectedRegion] = useState<'himalaya' | 'pahad' | 'terai' | null>(null);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>
                नमस्ते {user?.displayName || user?.firstName || user?.username || 'Friend'}! 👋
              </Text>
              <Text style={styles.heroSubtitle}>
                Ready to play some sports today?
              </Text>
            </View>
            <NepalFlag size={40} style={styles.heroFlag} />
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <View style={styles.actionCard}>
            <Ionicons name="search" size={24} color={Colors.nepal.crimson} />
            <Text style={styles.actionText}>Find Games</Text>
          </View>
          <View style={styles.actionCard}>
            <Ionicons name="add-circle" size={24} color={Colors.nepal.blue} />
            <Text style={styles.actionText}>Create Game</Text>
          </View>
          <View style={styles.actionCard}>
            <Ionicons name="star" size={24} color={Colors.nepal.crimson} />
            <Text style={styles.actionText}>My Games</Text>
          </View>
        </View>
        
        {/* Region Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 Choose Your Region</Text>
          <Text style={styles.sectionSubtitle}>
            Filter games by Nepal's geographic regions
          </Text>
          <RegionSelector 
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            style={styles.regionSelector}
          />
        </View>
        
        {/* AI Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 AI Recommendations</Text>
          <Text style={styles.sectionSubtitle}>
            Personalized game suggestions just for you
          </Text>
          <RecommendationsCard />
        </View>
        
        {/* Games List */}
        <View style={styles.section}>
          <View style={styles.gamesHeader}>
            <Text style={styles.sectionTitle}>
              🎮 Available Games
              {selectedRegion && (
                <Text style={styles.regionFilter}> in {selectedRegion}</Text>
              )}
            </Text>
            <View style={styles.gamesCount}>
              <Ionicons name="basketball" size={16} color={Colors.text.secondary} />
              <Text style={styles.countText}>Live Games</Text>
            </View>
          </View>
          
          <GamesList 
            initialShowJoined={false} 
            allowToggle 
            regionFilter={selectedRegion}
          />
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
    backgroundColor: Colors.nepal.crimson,
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
  },
  
  heroFlag: {
    marginLeft: 16,
  },
  
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
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
  
  regionSelector: {
    marginBottom: 0,
  },
  
  gamesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  regionFilter: {
    color: Colors.nepal.crimson,
    fontWeight: '600',
  },
  
  gamesCount: {
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
