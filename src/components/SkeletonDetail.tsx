import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { SkeletonBox } from '@/src/components/Skeleton';

export default function SkeletonDetail() {
  return (
    <View style={styles.container}>
      <SkeletonBox style={{ width: '70%', height: 22, marginBottom: 10 }} />
      <SkeletonBox style={{ width: '45%', height: 14, marginBottom: 8 }} />
      <SkeletonBox style={{ width: '35%', height: 14, marginBottom: 8 }} />
      <SkeletonBox style={{ width: '55%', height: 14, marginBottom: 14 }} />
      <SkeletonBox style={{ width: '100%', height: 80 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
