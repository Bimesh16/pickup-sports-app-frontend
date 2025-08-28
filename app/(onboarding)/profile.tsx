import React from 'react';
import { Button, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useOnboardingStore } from '@/src/stores/onboarding';

export default function OnboardingProfile() {
  const router = useRouter();
  const { city, sportPrefs, skillLevel } = useOnboardingStore.getState();
  const setCompleted = useOnboardingStore((s) => s.setOnboardingCompleted);

  const onDone = () => {
    setCompleted(true);
    router.replace('/(tabs)' as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Profile setup' }} />
      <Text style={styles.title}>All set!</Text>
      <Text>City: {city || 'N/A'}</Text>
      <Text>Sports: {sportPrefs?.join(', ') || 'N/A'}</Text>
      <Text>Skill: {skillLevel || 'N/A'}</Text>
      <Button title="Finish" onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
});
