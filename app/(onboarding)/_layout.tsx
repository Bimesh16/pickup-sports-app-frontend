import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerTitle: '' }}>
      <Stack.Screen name="location" options={{ title: 'Choose city' }} />
      <Stack.Screen name="sports" options={{ title: 'Your sports' }} />
      <Stack.Screen name="skill" options={{ title: 'Skill level' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile setup' }} />
    </Stack>
  );
}
