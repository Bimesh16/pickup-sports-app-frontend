import React, { useMemo, useState } from 'react';
import { Button, Pressable, StyleSheet, View as RNView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useOnboardingStore } from '@/src/stores/onboarding';

const LEVELS: Array<'Beginner' | 'Intermediate' | 'Advanced'> = ['Beginner', 'Intermediate', 'Advanced'];

export default function OnboardingSkill() {
  const router = useRouter();
  const saved = useOnboardingStore((s) => s.skillLevel);
  const setSkill = useOnboardingStore((s) => s.setSkillLevel);
  const [picked, setPicked] = useState<typeof LEVELS[number] | null>(saved ?? null);

  const canNext = useMemo(() => !!picked, [picked]);

  const onNext = () => {
    if (picked) setSkill(picked);
    router.push('/(onboarding)/profile' as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Skill level' }} />
      <Text style={styles.title}>Choose your skill level</Text>
      <RNView style={styles.chips}>
        {LEVELS.map((l) => (
          <Pressable
            key={l}
            onPress={() => setPicked(l)}
            style={({ pressed }) => [
              styles.chip,
              picked === l ? styles.chipActive : null,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={picked === l ? styles.chipActiveText : undefined}>{l}</Text>
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
  chips: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#16a34a' },
  chipActiveText: { color: '#fff' },
});
