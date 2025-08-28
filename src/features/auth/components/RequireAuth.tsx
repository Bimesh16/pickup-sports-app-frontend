import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View } from '@/components/Themed';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/src/stores/auth';
import { useAuthBootstrap } from '@/src/features/auth/hooks/useAuthBootstrap';
import { useOnboardingStore } from '@/src/stores/onboarding';

/**
 * RequireAuth gates its children until the session is bootstrapped and the user is authenticated.
 * - If unauthenticated, redirect to /(auth)/login
 * - If authenticated but onboarding not completed, redirect to /(onboarding)/location
 * - If onboarding completed and user is in onboarding group, redirect back to /(tabs)
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((s) => s.user);
  const { isBootstrapping } = useAuthBootstrap();
  const onboardingCompleted = useOnboardingStore((s) => s.onboardingCompleted);

  // While bootstrapping, show a small loader
  if (isBootstrapping) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    // If not authenticated, redirect to login unless already in auth group
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
      return;
    }

    // If authenticated but onboarding incomplete, ensure user is in onboarding flow
    if (user && !onboardingCompleted && !inOnboarding) {
      router.replace('/(onboarding)/location' as any);
      return;
    }

    // If onboarding completed but user is in onboarding, kick to tabs
    if (user && onboardingCompleted && inOnboarding) {
      router.replace('/(tabs)' as any);
    }
  }, [user, onboardingCompleted, segments, router]);

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
