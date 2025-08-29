import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/Colors';

interface NepalFlagProps {
  size?: number;
  style?: any;
}

/**
 * 🇳🇵 Nepal Flag Component
 * A stylized representation of Nepal's unique flag shape
 */
export function NepalFlag({ size = 40, style }: NepalFlagProps) {
  return (
    <View style={[{ width: size, height: size * 1.2 }, style]}>
      {/* Upper triangle */}
      <LinearGradient
        colors={[Colors.nepal.crimson, Colors.nepal.crimson]}
        style={[styles.upperTriangle, { 
          borderBottomWidth: size * 0.6,
          borderLeftWidth: size * 0.5,
          borderRightWidth: size * 0.5,
        }]}
      />
      
      {/* Lower triangle */}
      <LinearGradient
        colors={[Colors.nepal.blue, Colors.nepal.blue]}
        style={[styles.lowerTriangle, { 
          borderBottomWidth: size * 0.6,
          borderLeftWidth: size * 0.5,
          borderRightWidth: size * 0.5,
          top: size * 0.6,
        }]}
      />
      
      {/* White border outline */}
      <View style={[styles.outline, { 
        borderWidth: 1,
        borderColor: Colors.nepal.white,
        width: size,
        height: size * 1.2,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  upperTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderBottomColor: Colors.nepal.crimson,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
  },
  
  lowerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderBottomColor: Colors.nepal.blue,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
  },
  
  outline: {
    position: 'absolute',
    borderRadius: 2,
  },
});
