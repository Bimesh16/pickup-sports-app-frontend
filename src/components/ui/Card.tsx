import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: keyof typeof Theme.spacing;
  style?: ViewStyle;
  onPress?: () => void;
  gradient?: 'primary' | 'secondary' | 'sunset' | 'ocean';
}

export function Card({ 
  children, 
  variant = 'default',
  padding = 5,
  style,
  onPress,
  gradient = 'primary'
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: Theme.borderRadius['2xl'],
      padding: Theme.spacing[padding],
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyle,
          backgroundColor: Colors.background.primary,
          shadowColor: Colors.shadow.medium,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: Colors.background.primary,
          shadowColor: Colors.shadow.dark,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 12,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: Colors.background.primary,
          borderColor: Colors.border.light,
          borderWidth: 1,
        };
      case 'gradient':
        return {
          ...baseStyle,
          shadowColor: Colors.shadow.colored,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 10,
        };
      default:
        return baseStyle;
    }
  };

  if (variant === 'gradient') {
    const gradientColors = Colors.gradients[gradient];
    
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[getCardStyle(), style]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (onPress) {
    return (
      <View style={[getCardStyle(), style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
}

// Preset card variants
export function ElevatedCard({ children, style, ...props }: Omit<CardProps, 'variant'>) {
  return (
    <Card variant="elevated" style={style} {...props}>
      {children}
    </Card>
  );
}

export function OutlinedCard({ children, style, ...props }: Omit<CardProps, 'variant'>) {
  return (
    <Card variant="outlined" style={style} {...props}>
      {children}
    </Card>
  );
}

export function GradientCard({ children, style, gradient = 'primary', ...props }: Omit<CardProps, 'variant'>) {
  return (
    <Card variant="gradient" gradient={gradient} style={style} {...props}>
      {children}
    </Card>
  );
}
