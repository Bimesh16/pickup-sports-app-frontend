import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  showTagline?: boolean;
}

const SIZES = {
  small: { width: 32, height: 32, fontSize: 18 },
  medium: { width: 48, height: 48, fontSize: 24 },
  large: { width: 64, height: 64, fontSize: 32 },
  xl: { width: 96, height: 96, fontSize: 48 },
};

export function AppLogo({ 
  size = 'medium', 
  variant = 'full', 
  showTagline = false 
}: AppLogoProps) {
  const logoSize = SIZES[size];

  const LogoIcon = () => (
    <LinearGradient
      colors={Colors.gradients.nepal}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.iconContainer,
        {
          width: logoSize.width,
          height: logoSize.height,
        }
      ]}
    >
      {/* Nepal-inspired Mountain Peak Design */}
      <View style={styles.mountainContainer}>
        {/* Main mountain peak (like Everest) */}
        <View style={[styles.mountainPeak, { 
          width: logoSize.width * 0.7, 
          height: logoSize.width * 0.5 
        }]} />
        
        {/* Secondary peaks */}
        <View style={[styles.mountainPeak2, { 
          width: logoSize.width * 0.5, 
          height: logoSize.width * 0.3 
        }]} />
        
        {/* Sports ball in the center */}
        <View style={[styles.ball, { 
          width: logoSize.width * 0.35, 
          height: logoSize.width * 0.35 
        }]}>
          {/* Ball pattern lines */}
          <View style={[styles.ballLine, styles.ballLineVertical]} />
          <View style={[styles.ballLine, styles.ballLineHorizontal]} />
        </View>
      </View>
      
      {/* Nepal flag-inspired corner accent */}
      <View style={styles.flagAccent}>
        <View style={styles.flagTriangle} />
      </View>
    </LinearGradient>
  );

  const LogoText = () => (
    <View style={styles.textContainer}>
      <Text style={[
        styles.brandText,
        { fontSize: logoSize.fontSize }
      ]}>
        <Text style={styles.brandTextBold}>Pickup</Text>
        <Text style={styles.brandTextRegular}>Sports</Text>
      </Text>
      {showTagline && (
        <Text style={styles.tagline}>खेल खोज्नुहोस् • Find Your Game</Text>
      )}
    </View>
  );

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  if (variant === 'text') {
    return <LogoText />;
  }

  return (
    <View style={styles.container}>
      <LogoIcon />
      <LogoText />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing[3],
  },
  
  iconContainer: {
    borderRadius: Theme.borderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: Colors.shadow.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  mountainContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  
  mountainPeak: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    // For React Native, we'll use a triangular shape approximation
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 30,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    width: 0,
    height: 0,
    top: '20%',
  },
  
  mountainPeak2: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 20,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    width: 0,
    height: 0,
    top: '30%',
    right: '10%',
  },
  
  ball: {
    backgroundColor: Colors.nepal.white,
    borderRadius: 999,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: '40%',
    shadowColor: Colors.shadow.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  ballLine: {
    position: 'absolute',
    backgroundColor: Colors.nepal.blue,
    opacity: 0.6,
  },
  
  ballLineVertical: {
    width: 1,
    height: '70%',
    left: '50%',
    marginLeft: -0.5,
  },
  
  ballLineHorizontal: {
    height: 1,
    width: '70%',
    top: '50%',
    marginTop: -0.5,
  },
  
  flagAccent: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  
  flagTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: Colors.nepal.gold,
    borderBottomColor: 'transparent',
  },
  
  textContainer: {
    alignItems: 'flex-start',
  },
  
  brandText: {
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  
  brandTextBold: {
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.nepal.crimson,
  },
  
  brandTextRegular: {
    fontWeight: Theme.typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  
  tagline: {
    fontSize: Theme.typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Theme.typography.fontWeight.medium,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
