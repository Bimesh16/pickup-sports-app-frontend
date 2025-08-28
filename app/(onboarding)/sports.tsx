import React, { useMemo, useState } from 'react';
import { Button, Pressable, StyleSheet, View as RNView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useOnboardingStore } from '@/src/stores/onboarding';

const SPORTS = ['Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Pickleball'];

export default function OnboardingSports() {
  const router = useRouter();
  const saved = useOnboardingStore((s) => s.sportPrefs);
  const setSports = useOnboardingStore((s) => s.setSportPrefs);
  const [picked, setPicked] = useState<string[]>(saved ?? []);

  const canNext = useMemo(() => picked.length > 0, [picked]);

  const toggle = (s: string) => {
    setPicked((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const onNext = () => {
    setSports(picked);
    router.push('/(onboarding)/skill' as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Your sports' }} />
      <Text style={styles.title}>Select the sports you play</Text>
      <RNView style={styles.chips}>
        {SPORTS.map((s) => (
          <Pressable
            key={s}
            onPress={() => toggle(s)}
            style={({ pressed }) => [
              styles.chip,
              picked.includes(s) ? styles.chipActive : null,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={picked.includes(s) ? styles.chipActiveText : undefined}>{s}</Text>
          </Pressable>
        ))}
      </RNView>
      <Button title="Next" onPress={onNext} disabled={!canNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#2563eb' },
  chipActiveText: { color: '#fff' },
});
