import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '@/src/components/branding/AppLogo';
import { NepalFlag } from './NepalFlag';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

interface NepalHeaderProps {
  title?: string;
  showLogo?: boolean;
  showFlag?: boolean;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  variant?: 'default' | 'gradient';
}

/**
 * 🏔️ Nepal-themed Header Component
 * Beautiful header with Nepal flag colors and cultural elements
 */
export function NepalHeader({ 
  title,
  showLogo = true,
  showFlag = true,
  onMenuPress,
  onProfilePress,
  variant = 'default'
}: NepalHeaderProps) {
  const HeaderContent = () => (
    <View style={styles.headerContent}>
      {/* Left side - Menu or Logo */}
      <View style={styles.leftSection}>
        {onMenuPress ? (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
            <Ionicons name="menu" size={24} color={Colors.nepal.white} />
          </TouchableOpacity>
        ) : showLogo ? (
          <AppLogo size="small" variant="icon" />
        ) : null}
      </View>

      {/* Center - Title */}
      <View style={styles.centerSection}>
        {title ? (
          <Text style={styles.headerTitle}>{title}</Text>
        ) : (
          <Text style={styles.brandTitle}>
            <Text style={styles.brandTitleBold}>Pickup</Text>
            <Text style={styles.brandTitleRegular}>Sports</Text>
          </Text>
        )}
        <Text style={styles.nepalSubtitle}>खेल खोज्नुहोस्</Text>
      </View>

      {/* Right side - Flag and Profile */}
      <View style={styles.rightSection}>
        {showFlag && <NepalFlag size={28} style={styles.flag} />}
        {onProfilePress && (
          <TouchableOpacity onPress={onProfilePress} style={styles.iconButton}>
            <Ionicons name="person-circle" size={28} color={Colors.nepal.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={Colors.gradients.nepal}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <HeaderContent />
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.nepal.crimson }]}>
      <HeaderContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Theme.spacing[12], // For status bar
    paddingBottom: Theme.spacing[4],
    paddingHorizontal: Theme.spacing[4],
    shadowColor: Colors.shadow.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Theme.spacing[3],
  },
  
  headerTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.nepal.white,
    textAlign: 'center',
  },
  
  brandTitle: {
    fontSize: Theme.typography.fontSize.lg,
    textAlign: 'center',
  },
  
  brandTitleBold: {
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.nepal.white,
  },
  
  brandTitleRegular: {
    fontWeight: Theme.typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  nepalSubtitle: {
    fontSize: Theme.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  
  iconButton: {
    padding: Theme.spacing[2],
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  flag: {
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
