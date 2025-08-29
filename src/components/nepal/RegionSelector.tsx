import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';
import { RegionThemes } from '@/src/constants/RegionThemes';

interface RegionSelectorProps {
  selectedRegion?: 'himalaya' | 'pahad' | 'terai' | null;
  onRegionChange: (region: 'himalaya' | 'pahad' | 'terai') => void;
  style?: any;
}

/**
 * 🗺️ Nepal Region Selector
 * Beautiful selector for filtering by geographical regions
 */
export function RegionSelector({ 
  selectedRegion, 
  onRegionChange, 
  style 
}: RegionSelectorProps) {
  const regions = [
    {
      id: 'himalaya' as const,
      name: 'हिमालय',
      englishName: 'Himalaya',
      icon: '⛰️',
      gradient: Colors.gradients.himalayan,
    },
    {
      id: 'pahad' as const,
      name: 'पहाड',
      englishName: 'Pahad',
      icon: '🏞️',
      gradient: Colors.gradients.everest,
    },
    {
      id: 'terai' as const,
      name: 'तराई',
      englishName: 'Terai',
      icon: '🌾',
      gradient: Colors.gradients.nepal,
    },
  ];

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Choose Region • क्षेत्र छान्नुहोस्</Text>
      
      <View style={styles.regionsContainer}>
        {regions.map((region) => {
          const isSelected = selectedRegion === region.id;
          
          return (
            <TouchableOpacity
              key={region.id}
              onPress={() => onRegionChange(region.id)}
              style={[
                styles.regionButton,
                isSelected && styles.selectedRegionButton
              ]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isSelected ? region.gradient : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.9)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.regionGradient}
              >
                <Text style={[
                  styles.regionIcon,
                  { opacity: isSelected ? 1 : 0.7 }
                ]}>
                  {region.icon}
                </Text>
                
                <Text style={[
                  styles.regionName,
                  { color: isSelected ? Colors.nepal.white : Colors.text.primary }
                ]}>
                  {region.name}
                </Text>
                
                <Text style={[
                  styles.regionEnglishName,
                  { color: isSelected ? 'rgba(255,255,255,0.8)' : Colors.text.secondary }
                ]}>
                  {region.englishName}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {selectedRegion && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedText}>
            Showing games in {RegionThemes[selectedRegion].identity.nepaliName} region
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing[4],
  },
  
  title: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing[4],
  },
  
  regionsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing[3],
    justifyContent: 'space-between',
  },
  
  regionButton: {
    flex: 1,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  selectedRegionButton: {
    shadowColor: Colors.shadow.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  
  regionGradient: {
    padding: Theme.spacing[4],
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  
  regionIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing[2],
  },
  
  regionName: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: Theme.spacing[1],
  },
  
  regionEnglishName: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  
  selectedInfo: {
    marginTop: Theme.spacing[4],
    padding: Theme.spacing[3],
    backgroundColor: Colors.primary[50],
    borderRadius: Theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.nepal.crimson,
  },
  
  selectedText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Colors.nepal.blue,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
});
