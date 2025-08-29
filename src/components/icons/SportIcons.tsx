import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Colors';

interface SportIconProps {
  sport: string;
  size?: number;
  color?: string;
}

export function SportIcon({ sport, size = 24, color = Colors.text.primary }: SportIconProps) {
  const getIconName = (sportName: string): keyof typeof Ionicons.glyphMap => {
    const sportLower = sportName.toLowerCase();
    
    switch (sportLower) {
      case 'basketball':
        return 'basketball-outline';
      case 'soccer':
      case 'football':
        return 'football-outline';
      case 'tennis':
        return 'tennisball-outline';
      case 'volleyball':
        return 'american-football-outline';
      case 'baseball':
        return 'baseball-outline';
      case 'golf':
        return 'golf-outline';
      case 'swimming':
        return 'water-outline';
      case 'cycling':
        return 'bicycle-outline';
      case 'running':
        return 'walk-outline';
      case 'fitness':
        return 'fitness-outline';
      default:
        return 'sports-outline';
    }
  };

  return (
    <Ionicons 
      name={getIconName(sport)} 
      size={size} 
      color={color} 
    />
  );
}

interface SportBadgeProps {
  sport: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined' | 'gradient';
}

const BADGE_SIZES = {
  small: { container: 32, icon: 16 },
  medium: { container: 40, icon: 20 },
  large: { container: 48, icon: 24 },
};

export function SportBadge({ 
  sport, 
  size = 'medium', 
  variant = 'filled' 
}: SportBadgeProps) {
  const sizeConfig = BADGE_SIZES[size];
  const sportColor = Colors.sports[sport as keyof typeof Colors.sports] || Colors.primary[500];

  const getContainerStyle = () => {
    const baseStyle = {
      width: sizeConfig.container,
      height: sizeConfig.container,
      borderRadius: sizeConfig.container / 2,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: sportColor,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: sportColor,
          borderWidth: 2,
        };
      case 'gradient':
        return {
          ...baseStyle,
          backgroundColor: sportColor,
        };
      default:
        return baseStyle;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'filled':
        return Colors.text.inverse;
      case 'outlined':
        return sportColor;
      case 'gradient':
        return Colors.text.inverse;
      default:
        return sportColor;
    }
  };

  return (
    <View style={getContainerStyle()}>
      <SportIcon 
        sport={sport} 
        size={sizeConfig.icon} 
        color={getIconColor()} 
      />
    </View>
  );
}
