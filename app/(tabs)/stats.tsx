import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import { Stack } from 'expo-router';
import { useStats } from '@/src/features/stats/hooks/useStats';

export default function StatsScreen() {
  const { data, isLoading, isError } = useStats();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ title: 'Stats' }} />
      {isLoading && <ActivityIndicator />} 
      {isError && <Text>Failed to load stats</Text>}
      {data &&
        Object.entries(data).map(([key, value]) => (
          <Text key={key} style={{ marginBottom: 8 }}>{`${key}: ${value}`}</Text>
        ))}
    </View>
  );
}
