import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { View } from '@/components/Themed';
import AnalyticsDashboard from '@/src/features/ai/components/AnalyticsDashboard';
import RecommendationsCard from '@/src/features/ai/components/RecommendationsCard';

export default function AnalyticsScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <RecommendationsCard />
        <AnalyticsDashboard />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
});