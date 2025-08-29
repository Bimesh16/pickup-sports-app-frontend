import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/Colors';

interface GradientBackgroundProps {
  variant?: 'primary' | 'secondary' | 'success' | 'nepal' | 'himalayan' | 'everest' | 'heritage';
  children?: React.ReactNode;
  style?: ViewStyle;
  opacity?: number;
}

const GRADIENT_CONFIGS = {
  primary: {
    colors: Colors.gradients.primary,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  secondary: {
    colors: Colors.gradients.secondary,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  success: {
    colors: Colors.gradients.success,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  nepal: {
    colors: Colors.gradients.nepal,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  himalayan: {
    colors: Colors.gradients.himalayan,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 }, // Top to bottom like mountain snow
  },
  everest: {
    colors: Colors.gradients.everest,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  heritage: {
    colors: Colors.gradients.heritage,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

export function GradientBackground({ 
  variant = 'primary', 
  children, 
  style,
  opacity = 1 
}: GradientBackgroundProps) {
  const config = GRADIENT_CONFIGS[variant];

  return (
    <LinearGradient
      colors={config.colors.map(color => opacity < 1 ? `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : color)}
      start={config.start}
      end={config.end}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
}

// Preset gradient views for common use cases
export function PrimaryGradient({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  return (
    <GradientBackground variant="primary" style={style}>
      {children}
    </GradientBackground>
  );
}

export function NepalGradient({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  return (
    <GradientBackground variant="nepal" style={style}>
      {children}
    </GradientBackground>
  );
}

export function HimalayanGradient({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  return (
    <GradientBackground variant="himalayan" style={style}>
      {children}
    </GradientBackground>
  );
}

export function EverestGradient({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  return (
    <GradientBackground variant="everest" style={style}>
      {children}
    </GradientBackground>
  );
}
