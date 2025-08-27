import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, ViewStyle } from 'react-native';
import { View } from '@/components/Themed';

export function SkeletonBox({ style }: { style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.box, style, { opacity }]} />;
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonBox style={{ width: '60%', height: 16, marginBottom: 8 }} />
      <SkeletonBox style={{ width: '40%', height: 12, marginBottom: 6 }} />
      <SkeletonBox style={{ width: '50%', height: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
});
